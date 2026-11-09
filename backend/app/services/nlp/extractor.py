"""spaCy-based resume text extraction.

The implementation is deliberately simple:
- a PhraseMatcher finds technical skills from a curated dictionary;
- regular expressions collect education and experience hints.
This is easy to explain in a BTech viva and does not need a large model.

spaCy ships unsigned native extensions (thinc), which Windows Smart App
Control may block. When spaCy cannot be imported, the same skill dictionary is
matched with word-boundary regular expressions instead, so resume analysis
keeps working; spaCy is used again automatically whenever it loads.
"""

import re
from io import BytesIO

import docx
import fitz

from app.utils.errors import ApiError

try:
    import spacy
    from spacy.matcher import PhraseMatcher

    SPACY_AVAILABLE = True
except ImportError:  # blocked or missing native dependencies
    spacy = None
    PhraseMatcher = None
    SPACY_AVAILABLE = False

from .skill_dictionary import SKILL_DICTIONARY

_NLP = None
_MATCHER = None
_SKILL_PATTERNS = {}

MATCHER_BACKEND = "spacy-phrase-matcher" if SPACY_AVAILABLE else "regex-skill-matcher"

MAX_RESUME_PAGES = 5
MAX_TEXT_CHARS = 100_000

DEGREE_KEYWORDS = (
    "bachelor",
    "master",
    "phd",
    "doctorate",
    "diploma",
    "b.tech",
    "m.tech",
    "b.e",
    "m.e",
    "b.sc",
    "m.sc",
    "bca",
    "mca",
    "mba",
)

EDUCATION_CONTEXT_WORDS = (
    "university",
    "college",
    "institute",
    "school",
    "academy",
)

EXPERIENCE_CONTEXT_WORDS = (
    "experience",
    "intern",
    "engineer",
    "developer",
    "analyst",
    "manager",
    "lead",
    "consultant",
    "architect",
)


def get_nlp():
    """Load the spaCy model once and reuse it for every request."""
    global _NLP
    if not SPACY_AVAILABLE:
        raise ApiError(
            "spaCy is unavailable in this environment; the regex skill "
            "matcher is used instead.",
            status_code=503,
        )
    if _NLP is None:
        try:
            _NLP = spacy.load("en_core_web_sm")
        except OSError as exc:
            raise ApiError(
                "spaCy model 'en_core_web_sm' is not installed. "
                "Run: python -m spacy download en_core_web_sm",
                status_code=503,
            ) from exc
    return _NLP


def get_skill_matcher():
    """Build the PhraseMatcher once from the skill dictionary."""
    global _MATCHER
    if _MATCHER is None:
        nlp = get_nlp()
        matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
        for canonical, aliases in SKILL_DICTIONARY.items():
            patterns = [nlp.make_doc(alias) for alias in aliases]
            matcher.add(canonical, patterns)
        _MATCHER = matcher
    return _MATCHER


def clean_text(text):
    """Normalise whitespace while preserving line breaks for section hints."""
    return re.sub(r"[ \t]+", " ", text).strip()


def extract_pdf_text(data):
    document = fitz.open(stream=data, filetype="pdf")
    try:
        if document.page_count > MAX_RESUME_PAGES:
            raise ApiError(
                f"Resume has {document.page_count} pages; the limit is "
                f"{MAX_RESUME_PAGES} pages.",
                status_code=422,
            )
        pages = [page.get_text() for page in document]
    finally:
        document.close()

    text = "\n".join(pages)
    if not text.strip():
        raise ApiError(
            "No readable text was found in this PDF. If it is a scanned image, "
            "paste the resume text instead.",
            status_code=422,
        )
    return text


def extract_docx_text(data):
    document = docx.Document(BytesIO(data))
    parts = [paragraph.text for paragraph in document.paragraphs]
    for table in document.tables:
        for row in table.rows:
            parts.extend(cell.text for cell in row.cells)

    text = "\n".join(part for part in parts if part.strip())
    if not text.strip():
        raise ApiError(
            "No readable text was found in this DOCX file.",
            status_code=422,
        )
    return text


def extract_skills(text):
    """Return canonical skill names found in the resume, sorted by frequency."""
    if SPACY_AVAILABLE:
        return _extract_skills_with_spacy(text)
    return _extract_skills_with_regex(text)


def _extract_skills_with_spacy(text):
    nlp = get_nlp()
    matcher = get_skill_matcher()
    doc = nlp(text[:MAX_TEXT_CHARS])

    counts = {}
    for match_id, start, end in matcher(doc):
        canonical = nlp.vocab.strings[match_id]
        counts[canonical] = counts.get(canonical, 0) + 1

    return sorted(counts, key=lambda skill: (-counts[skill], skill))


def _skill_pattern(alias):
    """Compile a word-boundary pattern for one skill alias once."""
    pattern = _SKILL_PATTERNS.get(alias)
    if pattern is None:
        words = r"\s+".join(re.escape(part) for part in alias.split())
        # The lookaround set keeps short aliases such as "c" from matching
        # inside "c++" or "html", while still matching hyphenated forms such
        # as "react-native".
        pattern = re.compile(r"(?<![\w#+])" + words + r"(?![\w#+])", re.IGNORECASE)
        _SKILL_PATTERNS[alias] = pattern
    return pattern


def _extract_skills_with_regex(text):
    """Match the skill dictionary without spaCy (fallback path)."""
    sample = text[:MAX_TEXT_CHARS]
    counts = {}
    for canonical, aliases in SKILL_DICTIONARY.items():
        total = 0
        for alias in aliases:
            if alias:
                total += len(_skill_pattern(alias).findall(sample))
        if total:
            counts[canonical] = total

    return sorted(counts, key=lambda skill: (-counts[skill], skill))


def extract_education(text):
    """Collect likely education lines using simple keyword matching."""
    results = []
    seen = set()
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or len(line) > 180:
            continue
        lowered = line.lower()
        if any(keyword in lowered for keyword in DEGREE_KEYWORDS + EDUCATION_CONTEXT_WORDS):
            key = line.lower()
            if key not in seen:
                seen.add(key)
                results.append(line)
    return results[:8]


def extract_experience(text):
    """Collect likely experience lines and an approximate years-of-experience value."""
    lines = []
    seen = set()
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or len(line) > 180:
            continue
        lowered = line.lower()
        if any(word in lowered for word in EXPERIENCE_CONTEXT_WORDS):
            key = line.lower()
            if key not in seen:
                seen.add(key)
                lines.append(line)

    years = [int(value) for value in re.findall(r"\b(\d+)\s*\+?\s*years?\b", text.lower())]
    experience_years = max(years) if years else None

    return {
        "lines": lines[:8],
        "years": experience_years,
    }

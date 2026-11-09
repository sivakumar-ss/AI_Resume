import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  FileSearch,
  FileText,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'

import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { Input } from '../components/ui/Fields'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { profileApi } from '../api/profile'
import { resumeApi } from '../api/resume'
import { parseApiError } from '../utils/errors'
import ProfileInputsCard from '../components/dashboard/ProfileInputsCard'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

function extensionOf(fileName) {
  const lower = (fileName || '').toLowerCase()
  const dot = lower.lastIndexOf('.')
  return dot >= 0 ? lower.slice(dot) : ''
}

export default function ResumeAnalyzerPage() {
  const { profile, syncProfile } = useAuth()
  const { addToast } = useToast()

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [customSkill, setCustomSkill] = useState('')
  const [analyzeError, setAnalyzeError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const existingSkillNames = useMemo(
    () => new Set((profile?.technical_skills || []).map((skill) => skill.name)),
    [profile],
  )

  const newSkillCount = useMemo(
    () => selectedSkills.filter((skill) => !existingSkillNames.has(skill)).length,
    [selectedSkills, existingSkillNames],
  )

  function handleFileChange(event) {
    const next = event.target.files?.[0] || null
    setFileError('')
    setAnalyzeError('')
    setAnalysis(null)
    setSelectedSkills([])

    if (!next) {
      setFile(null)
      return
    }

    const extension = extensionOf(next.name)
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFile(null)
      setFileError('Choose a PDF or DOCX resume.')
      return
    }
    if (next.size > MAX_BYTES) {
      setFile(null)
      setFileError('Resume must be 5 MB or smaller.')
      return
    }

    setFile(next)
  }

  async function handleAnalyze(event) {
    event.preventDefault()
    setAnalyzeError('')

    if (!file) {
      setAnalyzeError('Choose a resume before analyzing it.')
      return
    }

    setAnalyzing(true)
    try {
      const result = await resumeApi.analyze(file)
      setAnalysis(result)
      setSelectedSkills(result.extracted_skills || [])
      addToast({
        type: 'success',
        title: 'Resume analyzed',
        message: `${result.skill_count || 0} skill${result.skill_count === 1 ? '' : 's'} extracted. Review them before saving.`,
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not analyze this resume. Please try again.')
      setAnalyzeError(parsed.message)
    } finally {
      setAnalyzing(false)
    }
  }

  function toggleSkill(skill) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    )
  }

  function removeSkill(skill) {
    setSelectedSkills((current) => current.filter((item) => item !== skill))
  }

  function addCustomSkill() {
    const name = customSkill.trim().toLowerCase()
    if (!name) return
    if (!selectedSkills.includes(name)) {
      setSelectedSkills((current) => [...current, name])
    }
    setCustomSkill('')
  }

  async function handleSaveConfirmed() {
    setSaveError('')
    if (!selectedSkills.length) {
      setSaveError('Select at least one skill to save.')
      return
    }

    setSaving(true)
    try {
      const knownSkills = new Set(existingSkillNames)
      const created = []
      for (const skill of selectedSkills) {
        if (knownSkills.has(skill)) continue
        try {
          const createdSkill = await profileApi.addSkill({
            name: skill,
            proficiency_level: 3,
          })
          created.push(createdSkill)
          knownSkills.add(skill)
        } catch (apiError) {
          const status = apiError?.response?.status
          if (status !== 409) throw apiError
        }
      }

      if (created.length && profile) {
        syncProfile({
          ...profile,
          technical_skills: [...(profile.technical_skills || []), ...created],
        })
      }

      addToast({
        type: 'success',
        title: 'Skills saved',
        message:
          created.length > 0
            ? `${created.length} new skill${created.length === 1 ? '' : 's'} added to your profile.`
            : 'Your selected skills are already on your profile.',
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not save the selected skills. Please try again.')
      setSaveError(parsed.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI resume tools"
        title="Resume Analyzer"
        description="Upload a resume, review the skills extracted by spaCy, and confirm the ones that belong on your profile."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-navy-900">Upload a resume</h2>
                <p className="mt-1 text-sm text-slate-500">
                  PDF or DOCX, up to 5 MB. The file is processed privately and is not
                  stored or exposed after analysis.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5 p-5 sm:p-6">
            {analyzeError ? <Alert variant="error">{analyzeError}</Alert> : null}

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-navy-900">
                {file ? file.name : 'Choose a resume file'}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected`
                  : 'PDF or DOCX. Scanned image PDFs cannot be read; paste the text instead.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <label className={file ? 'cursor-pointer' : 'cursor-pointer'}>
                  <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-navy-800 transition hover:border-brand-300 hover:text-brand-700">
                    Choose file
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <Button type="submit" loading={analyzing} disabled={!file}>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Analyze resume
                </Button>
              </div>
              {fileError ? (
                <p className="mt-3 text-xs font-medium text-rose-600">{fileError}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
              The backend stores only resume metadata and extracted skills. The
              uploaded file is deleted after analysis and is never public.
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <ProfileInputsCard profile={profile} />
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <FileSearch className="size-5 text-brand-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-900">What you will get</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                'Technical skills found by spaCy PhraseMatcher',
                'Education details found in the resume',
                'Experience lines and approximate years of experience',
                'A review step before anything is saved to your profile',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {analysis ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-navy-900">Analysis results</h2>
              <p className="mt-1 text-sm text-slate-500">
                {analysis.original_filename} · {analysis.file_type.toUpperCase()} ·{' '}
                {(analysis.file_size_bytes / 1024).toFixed(0)} KB
              </p>
            </div>
            <Badge variant="success" dot>Processed</Badge>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">Extracted skills</h3>
              <p className="mt-1 text-xs text-slate-500">
                Uncheck anything that should not be on your profile.
              </p>
              {analysis.extracted_skills?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.extracted_skills.map((skill) => {
                    const selected = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={
                          selected
                            ? 'inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition'
                            : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300'
                        }
                        aria-pressed={selected}
                      >
                        {selected ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
                        {skill}
                        {selected ? (
                          <X className="size-3.5" aria-hidden="true" onClick={(event) => {
                            event.stopPropagation()
                            removeSkill(skill)
                          }} />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No known technical skills were found. You can add one manually below.
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <Input
                  aria-label="Add a skill manually"
                  placeholder="e.g. python, sql, figma"
                  value={customSkill}
                  onChange={(event) => setCustomSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addCustomSkill()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomSkill}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-navy-900">Education details</h3>
                {analysis.education?.length ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {analysis.education.map((item, index) => (
                      <li key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 leading-6">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No clear education details were found.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-navy-900">Experience details</h3>
                {analysis.experience_years ? (
                  <p className="mt-2 text-sm text-slate-600">
                    Approximate experience: {analysis.experience_years} year
                    {analysis.experience_years === 1 ? '' : 's'}
                  </p>
                ) : null}
                {analysis.experience?.length ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {analysis.experience.map((item, index) => (
                      <li key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 leading-6">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No clear experience details were found.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-slate-500">
              {newSkillCount > 0
                ? `${newSkillCount} selected skill${newSkillCount === 1 ? '' : 's'} will be added at proficiency level 3.`
                : 'All selected skills are already on your profile.'}
              {saveError ? <span className="ml-2 font-medium text-rose-600">{saveError}</span> : null}
            </div>
            <Button
              type="button"
              loading={saving}
              disabled={!selectedSkills.length}
              onClick={handleSaveConfirmed}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Save confirmed skills
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

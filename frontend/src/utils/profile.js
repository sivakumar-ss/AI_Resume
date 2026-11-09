export const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High school' },
  { value: 'higher_secondary', label: 'Higher secondary' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'doctorate', label: 'Doctorate' },
]

export const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: `Semester ${index + 1}`,
}))

export const DEPARTMENT_SUGGESTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science',
  'Business Administration',
]

export const SKILL_PROFICIENCY_OPTIONS = [
  { value: 1, label: '1 · Novice' },
  { value: 2, label: '2 · Beginner' },
  { value: 3, label: '3 · Intermediate' },
  { value: 4, label: '4 · Advanced' },
  { value: 5, label: '5 · Expert' },
]

const EDUCATION_LABELS = Object.fromEntries(
  EDUCATION_OPTIONS.map((option) => [option.value, option.label]),
)

const EXPERIENCE_LABELS = Object.fromEntries(
  EXPERIENCE_OPTIONS.map((option) => [option.value, option.label]),
)

export function educationLabel(value) {
  return EDUCATION_LABELS[value] || 'Not specified'
}

export function experienceLabel(value) {
  return EXPERIENCE_LABELS[value] || 'Not specified'
}

export function proficiencyLabel(value) {
  const labels = {
    1: 'Novice',
    2: 'Beginner',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert',
  }
  return labels[Number(value)] || 'Intermediate'
}

const SKILL_NAME_OVERRIDES = {
  ai: 'AI',
  api: 'API',
  aws: 'AWS',
  'c#': 'C#',
  'c++': 'C++',
  'ci/cd': 'CI/CD',
  css: 'CSS',
  dsa: 'DSA',
  gcp: 'GCP',
  github: 'GitHub',
  gitlab: 'GitLab',
  graphql: 'GraphQL',
  html: 'HTML',
  ios: 'iOS',
  javascript: 'JavaScript',
  json: 'JSON',
  jwt: 'JWT',
  ml: 'ML',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  nlp: 'NLP',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  numpy: 'NumPy',
  oop: 'OOP',
  php: 'PHP',
  postgresql: 'PostgreSQL',
  pytorch: 'PyTorch',
  rest: 'REST',
  'scikit-learn': 'scikit-learn',
  sql: 'SQL',
  tensorflow: 'TensorFlow',
  typescript: 'TypeScript',
  ui: 'UI',
  ux: 'UX',
  xml: 'XML',
}

export function formatSkillName(name = '') {
  const value = String(name).trim()
  if (!value) return ''
  const override = SKILL_NAME_OVERRIDES[value.toLowerCase()]
  if (override) return override
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'ST'
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'Student'
}

export function calculateProfileCompletion(profile) {
  if (!profile) return 0

  const skills = profile.technical_skills?.length || 0
  const interests = profile.career_interests?.length || 0
  const checks = [
    { weight: 10, complete: Boolean(profile.full_name?.trim()) },
    { weight: 10, complete: Boolean(profile.education_level) },
    {
      weight: 10,
      complete: Boolean(profile.department && profile.department !== 'Undeclared'),
    },
    { weight: 10, complete: Boolean(profile.college_name?.trim()) },
    { weight: 10, complete: Boolean(profile.graduation_year) },
    { weight: 5, complete: Boolean(profile.experience_level) },
    { weight: 5, complete: Boolean(profile.semester) },
    { weight: 5, complete: profile.cgpa !== null && profile.cgpa !== undefined },
    { weight: 10, complete: Boolean(profile.bio?.trim()) },
    { weight: 10, complete: interests > 0 },
    { weight: 10, complete: skills > 0 },
    { weight: 5, complete: skills >= 3 },
  ]

  return Math.round(
    checks.reduce((total, check) => total + (check.complete ? check.weight : 0), 0),
  )
}

export function getProfileChecklist(profile) {
  return [
    {
      label: 'Add your academic details',
      description: 'College, department and graduation year',
      complete: Boolean(
        profile?.college_name?.trim() &&
          profile?.department &&
          profile.department !== 'Undeclared' &&
          profile?.graduation_year,
      ),
    },
    {
      label: 'Add at least three technical skills',
      description: 'Skills power your career matches',
      complete: (profile?.technical_skills?.length || 0) >= 3,
    },
    {
      label: 'Choose your career interests',
      description: 'Tell us what kind of work excites you',
      complete: (profile?.career_interests?.length || 0) > 0,
    },
    {
      label: 'Write a short profile summary',
      description: 'A clear bio adds context to your profile',
      complete: Boolean(profile?.bio?.trim()),
    },
  ]
}

export function formatMonthYear(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

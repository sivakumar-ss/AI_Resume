import { useMemo, useState } from 'react'
import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import CompletionCard from '../components/dashboard/CompletionCard'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button, { buttonClasses } from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { Input, Select, Textarea } from '../components/ui/Fields'
import PageHeader from '../components/ui/PageHeader'
import TagInput from '../components/ui/TagInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { profileApi } from '../api/profile'
import { getFieldError, parseApiError } from '../utils/errors'
import {
  DEPARTMENT_SUGGESTIONS,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SEMESTER_OPTIONS,
  SKILL_PROFICIENCY_OPTIONS,
  calculateProfileCompletion,
  educationLabel,
  formatMonthYear,
  formatSkillName,
  proficiencyLabel,
} from '../utils/profile'

function formFromProfile(profile) {
  return {
    full_name: profile?.full_name || '',
    education_level: profile?.education_level || 'undergraduate',
    department: profile?.department || '',
    college_name: profile?.college_name || '',
    graduation_year: profile?.graduation_year ? String(profile.graduation_year) : '',
    semester: profile?.semester ? String(profile.semester) : '1',
    cgpa: profile?.cgpa !== null && profile?.cgpa !== undefined ? String(profile.cgpa) : '',
    experience_level: profile?.experience_level || 'beginner',
    bio: profile?.bio || '',
    career_interests: profile?.career_interests || profile?.interests || [],
  }
}

export default function ProfilePage() {
  const { user, profile, syncProfile } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState(() => formFromProfile(profile))
  const [fieldErrors, setFieldErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [skillsError, setSkillsError] = useState('')
  const [skillForm, setSkillForm] = useState({ name: '', proficiency_level: '3' })
  const [addingSkill, setAddingSkill] = useState(false)
  const [updatingSkillId, setUpdatingSkillId] = useState(null)
  const [skillToDelete, setSkillToDelete] = useState(null)
  const [deletingSkill, setDeletingSkill] = useState(false)

  const completion = useMemo(() => calculateProfileCompletion(profile), [profile])
  const skills = profile?.technical_skills || []

  // Re-seed the editable form only when a different profile is loaded, so
  // unsaved academic edits survive skill add/update actions.
  const profileId = profile?.id ?? null
  const [formProfileId, setFormProfileId] = useState(profileId)
  if (profileId !== formProfileId) {
    setFormProfileId(profileId)
    setForm(formFromProfile(profile))
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Your account"
          title="My profile"
          description="Manage the academic and skill context used across CareerCompass."
        />
        <EmptyState
          icon={UserRound}
          title="Profile not available"
          description="We could not load your profile. Refresh the page or sign in again."
          action={
            <Link to="/dashboard" className={buttonClasses({ size: 'sm' })}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    )
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  function validateProfile() {
    const errors = {}
    if (!form.full_name.trim()) errors.full_name = 'Full name is required.'
    else if (form.full_name.trim().length < 2) errors.full_name = 'Use at least 2 characters.'
    else if (form.full_name.trim().length > 120) errors.full_name = 'Use 120 characters or fewer.'

    if (form.department.length > 100) errors.department = 'Use 100 characters or fewer.'
    if (form.college_name.length > 200) errors.college_name = 'Use 200 characters or fewer.'
    if (form.bio.length > 1000) errors.bio = 'Use 1000 characters or fewer.'

    if (form.graduation_year) {
      const year = Number(form.graduation_year)
      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        errors.graduation_year = 'Use a year between 2000 and 2100.'
      }
    }

    if (form.cgpa !== '') {
      const cgpa = Number(form.cgpa)
      if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.cgpa = 'CGPA must be between 0 and 10.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setSaveError('')
    if (!validateProfile()) return

    const payload = {
      full_name: form.full_name.trim(),
      education_level: form.education_level,
      experience_level: form.experience_level,
      semester: Number(form.semester),
      career_interests: form.career_interests,
    }

    if (form.department.trim()) payload.department = form.department.trim()
    if (form.college_name.trim()) payload.college_name = form.college_name.trim()
    if (form.graduation_year) payload.graduation_year = Number(form.graduation_year)
    if (form.cgpa !== '') payload.cgpa = Number(form.cgpa)
    if (form.bio.trim()) payload.bio = form.bio.trim()

    setSaving(true)
    try {
      const updated = await profileApi.update(payload)
      syncProfile(updated)
      setFieldErrors({})
      addToast({
        type: 'success',
        title: 'Profile saved',
        message: 'Your academic details and career interests are up to date.',
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not save your profile. Please try again.')
      setSaveError(parsed.message)
      setFieldErrors(parsed.fields || {})
    } finally {
      setSaving(false)
    }
  }

  async function handleAddSkill(event) {
    event.preventDefault()
    setSkillsError('')
    const name = skillForm.name.trim()
    if (!name) {
      setSkillsError('Enter a skill name before adding it.')
      return
    }

    setAddingSkill(true)
    try {
      const created = await profileApi.addSkill({
        name,
        proficiency_level: Number(skillForm.proficiency_level),
      })
      syncProfile({
        ...profile,
        technical_skills: [...skills, created],
      })
      setSkillForm({ name: '', proficiency_level: '3' })
      addToast({
        type: 'success',
        title: 'Skill added',
        message: `${formatSkillName(created.name)} is now part of your profile.`,
      })
    } catch (apiError) {
      setSkillsError(
        parseApiError(apiError, 'We could not add that skill. Please try again.').message,
      )
    } finally {
      setAddingSkill(false)
    }
  }

  async function handleSkillProficiency(studentSkillId, level) {
    setSkillsError('')
    setUpdatingSkillId(studentSkillId)
    try {
      const updated = await profileApi.updateSkill(studentSkillId, {
        proficiency_level: Number(level),
      })
      syncProfile({
        ...profile,
        technical_skills: skills.map((skill) =>
          skill.id === studentSkillId ? updated : skill,
        ),
      })
    } catch (apiError) {
      setSkillsError(
        parseApiError(apiError, 'We could not update that skill. Please try again.').message,
      )
    } finally {
      setUpdatingSkillId(null)
    }
  }

  async function handleDeleteSkill() {
    if (!skillToDelete) return
    setDeletingSkill(true)
    setSkillsError('')
    try {
      await profileApi.deleteSkill(skillToDelete.id)
      syncProfile({
        ...profile,
        technical_skills: skills.filter((skill) => skill.id !== skillToDelete.id),
      })
      addToast({
        type: 'success',
        title: 'Skill removed',
        message: `${formatSkillName(skillToDelete.name)} was removed from your profile.`,
      })
      setSkillToDelete(null)
    } catch (apiError) {
      setSkillsError(
        parseApiError(apiError, 'We could not remove that skill. Please try again.').message,
      )
    } finally {
      setDeletingSkill(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your account"
        title="My profile"
        description="Keep your academic details, career interests and technical skills current. These signals power every future recommendation."
        actions={
          <Link
            to="/dashboard"
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-navy-900">
                    Personal & academic details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    The core context for your student profile.
                  </p>
                </div>
              </div>
              <Badge variant={completion === 100 ? 'success' : 'primary'}>
                {completion}% complete
              </Badge>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5 p-5 sm:p-6" noValidate>
              {saveError ? <Alert variant="error">{saveError}</Alert> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={(event) => updateField('full_name', event.target.value)}
                  error={getFieldError(fieldErrors, 'full_name')}
                  icon={UserRound}
                  maxLength={120}
                  autoComplete="name"
                  required
                />
                <Input
                  label="Email address"
                  value={user?.email || ''}
                  icon={UserRound}
                  readOnly
                  disabled
                  hint="Your sign-in email cannot be changed here."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Education level"
                  name="education_level"
                  value={form.education_level}
                  onChange={(event) => updateField('education_level', event.target.value)}
                  error={getFieldError(fieldErrors, 'education_level')}
                >
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={(event) => updateField('department', event.target.value)}
                  error={
                    getFieldError(fieldErrors, 'department') ||
                    getFieldError(fieldErrors, 'branch')
                  }
                  icon={Building2}
                  list="profile-department-suggestions"
                  maxLength={100}
                  placeholder="e.g. Computer Science"
                />
                <datalist id="profile-department-suggestions">
                  {DEPARTMENT_SUGGESTIONS.map((department) => (
                    <option key={department} value={department} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="College name"
                  name="college_name"
                  value={form.college_name}
                  onChange={(event) => updateField('college_name', event.target.value)}
                  error={getFieldError(fieldErrors, 'college_name')}
                  icon={Building2}
                  maxLength={200}
                  placeholder="Your college or university"
                />
                <Input
                  label="Graduation year"
                  name="graduation_year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.graduation_year}
                  onChange={(event) => updateField('graduation_year', event.target.value)}
                  error={getFieldError(fieldErrors, 'graduation_year')}
                  icon={CalendarDays}
                  placeholder="e.g. 2028"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Select
                  label="Semester"
                  name="semester"
                  value={form.semester}
                  onChange={(event) => updateField('semester', event.target.value)}
                  error={getFieldError(fieldErrors, 'semester')}
                >
                  {SEMESTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Input
                  label="CGPA"
                  name="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={form.cgpa}
                  onChange={(event) => updateField('cgpa', event.target.value)}
                  error={getFieldError(fieldErrors, 'cgpa')}
                  placeholder="e.g. 8.75"
                />

                <Select
                  label="Experience level"
                  name="experience_level"
                  value={form.experience_level}
                  onChange={(event) => updateField('experience_level', event.target.value)}
                  error={getFieldError(fieldErrors, 'experience_level')}
                >
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <TagInput
                label="Career interests"
                value={form.career_interests}
                onChange={(value) => updateField('career_interests', value)}
                placeholder="e.g. machine learning, product design"
                maxItems={20}
                maxLength={50}
                error={
                  getFieldError(fieldErrors, 'career_interests') ||
                  getFieldError(fieldErrors, 'interests')
                }
                hint="Add the areas of work you want to explore. Press Enter after each item."
              />

              <Textarea
                label="Profile summary"
                name="bio"
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                error={getFieldError(fieldErrors, 'bio')}
                maxLength={1000}
                rows={4}
                placeholder="A short summary of your interests, strengths and what you want to build next."
                hint="Optional, but useful context for your profile."
              />

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-400">
                  Your profile is linked to your account and cannot be deleted separately.
                </p>
                <Button type="submit" loading={saving} loadingText="Saving…">
                  <Save className="size-4" aria-hidden="true" />
                  Save profile
                </Button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                  <BookOpen className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-navy-900">Technical skills</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add skills and set a proficiency level from 1 to 5.
                  </p>
                </div>
              </div>
              <Badge variant="neutral">{skills.length} skills</Badge>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {skillsError ? <Alert variant="error">{skillsError}</Alert> : null}

              <form onSubmit={handleAddSkill} className="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
                <Input
                  aria-label="Skill name"
                  placeholder="e.g. Python, SQL, Figma"
                  value={skillForm.name}
                  onChange={(event) =>
                    setSkillForm((current) => ({ ...current, name: event.target.value }))
                  }
                  maxLength={100}
                  error={getFieldError(fieldErrors, 'name')}
                />
                <Select
                  aria-label="Skill proficiency"
                  value={skillForm.proficiency_level}
                  onChange={(event) =>
                    setSkillForm((current) => ({
                      ...current,
                      proficiency_level: event.target.value,
                    }))
                  }
                >
                  {SKILL_PROFICIENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Button type="submit" loading={addingSkill} className="sm:px-5">
                  <Plus className="size-4" aria-hidden="true" />
                  Add skill
                </Button>
              </form>

              {skills.length ? (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-navy-900">
                            {formatSkillName(skill.name)}
                          </p>
                          <Badge variant="primary">{proficiencyLabel(skill.proficiency_level)}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {skill.category ? `${skill.category} skill` : 'Technical skill'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`skill-level-${skill.id}`}>
                          Proficiency for {formatSkillName(skill.name)}
                        </label>
                        <select
                          id={`skill-level-${skill.id}`}
                          value={String(skill.proficiency_level)}
                          onChange={(event) =>
                            handleSkillProficiency(skill.id, event.target.value)
                          }
                          disabled={updatingSkillId === skill.id}
                          className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-navy-800 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
                        >
                          {SKILL_PROFICIENCY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setSkillToDelete(skill)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${formatSkillName(skill.name)}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-navy-900">No technical skills yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add your first skill above. At least three skills give your profile a stronger signal.
                  </p>
                </div>
              )}

              <p className="text-xs leading-5 text-slate-400">
                Skill names are normalised to lowercase and shared across the platform.
                Removing a skill here only removes it from your profile.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <CompletionCard profile={profile} completion={completion} />

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold text-navy-900">Profile at a glance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Education</dt>
                <dd className="font-medium text-navy-900">
                  {educationLabel(profile.education_level)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Department</dt>
                <dd className="max-w-44 truncate font-medium text-navy-900">
                  {profile.department || 'Not added'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">College</dt>
                <dd className="max-w-44 truncate font-medium text-navy-900">
                  {profile.college_name || 'Not added'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Member since</dt>
                <dd className="font-medium text-navy-900">
                  {formatMonthYear(user?.created_at)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="font-medium text-navy-900">
                  {formatMonthYear(profile.updated_at)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-xl bg-brand-50/70 p-3 text-xs leading-5 text-brand-800">
              Your display name is stored on the account. All other fields are stored
              on your student profile.
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(skillToDelete)}
        title="Remove this skill?"
        description={
          skillToDelete
            ? `${formatSkillName(skillToDelete.name)} will be removed from your profile. You can add it again later.`
            : ''
        }
        confirmLabel="Remove skill"
        loading={deletingSkill}
        onConfirm={handleDeleteSkill}
        onClose={() => {
          if (!deletingSkill) setSkillToDelete(null)
        }}
      />
    </div>
  )
}

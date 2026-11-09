import { useMemo, useState } from 'react'
import { ArrowRight, Building2, GraduationCap, Mail, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Input, PasswordInput, Select } from '../components/ui/Fields'
import {
  DEPARTMENT_SUGGESTIONS,
  SEMESTER_OPTIONS,
} from '../utils/profile'
import { parseApiError } from '../utils/errors'
import { cx } from '../utils/cx'

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  department: '',
  semester: '1',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordStrength = useMemo(() => {
    if (!form.password) return 0
    if (form.password.length >= 12) return 3
    if (form.password.length >= 8) return 2
    return 1
  }, [form.password])

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

  function validate() {
    const errors = {}
    if (!form.full_name.trim()) errors.full_name = 'Full name is required.'
    else if (form.full_name.trim().length < 2) errors.full_name = 'Use at least 2 characters.'
    else if (form.full_name.trim().length > 120) errors.full_name = 'Use 120 characters or fewer.'

    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.'

    if (!form.password) errors.password = 'Password is required.'
    else if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
    else if (form.password.length > 128) errors.password = 'Use 128 characters or fewer.'

    if (!form.confirm_password) errors.confirm_password = 'Confirm your password.'
    else if (form.confirm_password !== form.password) {
      errors.confirm_password = 'The passwords do not match.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        branch: form.department.trim() || 'Undeclared',
        semester: Number(form.semester),
      })
      navigate('/dashboard', { replace: true })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not create your account. Please try again.')
      setError(parsed.message)
      setFieldErrors(parsed.fields || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Create your account"
      title="Start building your career profile"
      description="A few details now give you a stronger foundation for career guidance later."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}

        <Input
          label="Full name"
          name="full_name"
          autoComplete="name"
          placeholder="e.g. Asha Rao"
          value={form.full_name}
          onChange={(event) => updateField('full_name', event.target.value)}
          error={fieldErrors.full_name}
          icon={UserRound}
          maxLength={120}
          required
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@college.edu"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={fieldErrors.email}
          icon={Mail}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              error={fieldErrors.password}
              required
            />
            {form.password ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <span
                      key={level}
                      className={cx(
                        'h-1 flex-1 rounded-full transition',
                        passwordStrength >= level
                          ? level === 1
                            ? 'bg-rose-400'
                            : level === 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          : 'bg-slate-200',
                      )}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">
                  {passwordStrength === 3 ? 'Strong' : passwordStrength === 2 ? 'Good' : 'Weak'}
                </span>
              </div>
            ) : null}
          </div>

          <PasswordInput
            label="Confirm password"
            name="confirm_password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={form.confirm_password}
            onChange={(event) => updateField('confirm_password', event.target.value)}
            error={fieldErrors.confirm_password}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <Input
              label="Department"
              name="department"
              placeholder="e.g. Computer Science"
              value={form.department}
              onChange={(event) => updateField('department', event.target.value)}
              error={fieldErrors.department || fieldErrors.branch}
              icon={Building2}
              list="department-suggestions"
              maxLength={100}
            />
            <datalist id="department-suggestions">
              {DEPARTMENT_SUGGESTIONS.map((department) => (
                <option key={department} value={department} />
              ))}
            </datalist>
          </div>
          <Select
            label="Current semester"
            name="semester"
            value={form.semester}
            onChange={(event) => updateField('semester', event.target.value)}
            error={fieldErrors.semester}
          >
            {SEMESTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
          <GraduationCap className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          You can add your college, graduation year, skills and interests after
          creating your account.
        </p>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={submitting}
          loadingText="Creating account…"
        >
          Create student account
          {!submitting ? <ArrowRight className="size-[18px]" aria-hidden="true" /> : null}
        </Button>

        <p className="text-center text-[11px] leading-5 text-slate-400">
          By creating an account, you agree to use CareerCompass for your own
          academic and career planning.
        </p>
      </form>
    </AuthLayout>
  )
}

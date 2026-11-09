import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Input, PasswordInput } from '../components/ui/Fields'
import { parseApiError } from '../utils/errors'

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default function LoginPage() {
  const { login, sessionMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const shownError = error || sessionMessage

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
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.'
    if (!form.password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password,
      })
      const from = location.state?.from?.pathname
      const role = data.user?.role
      const destination =
        role === 'admin'
          ? from?.startsWith('/admin')
            ? from
            : '/admin'
          : from && !from.startsWith('/admin')
            ? from
            : '/dashboard'
      navigate(destination, { replace: true })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not sign you in. Please try again.')
      setError(parsed.message)
      setFieldErrors(parsed.fields || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      description="Continue building your profile and career direction."
      footer={
        <>
          New to CareerCompass?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create a student account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {shownError ? <Alert variant="error">{shownError}</Alert> : null}

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

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={fieldErrors.password}
          required
        />

        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            Use the email and password you registered with. Administrator accounts
            are issued separately by the project owner.
          </span>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={submitting}
          loadingText="Signing in…"
        >
          Sign in
          {!submitting ? <ArrowRight className="size-[18px]" aria-hidden="true" /> : null}
        </Button>
      </form>
    </AuthLayout>
  )
}

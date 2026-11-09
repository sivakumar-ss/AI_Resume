import { ArrowLeft, Compass, LayoutDashboard, LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonClasses } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth()
  const destination = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="hero-glow relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-soft opacity-40" aria-hidden="true" />
      <div className="relative w-full max-w-xl rounded-3xl border border-white/80 bg-white/85 p-8 text-center shadow-lifted backdrop-blur-xl sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lifted">
          <Compass className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          This path is off the map
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          The page you are looking for does not exist, or it may have moved. Let us
          get you back to a useful part of your career workspace.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className={buttonClasses({ variant: 'outline', size: 'md' })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          {isAuthenticated ? (
            <Link to={destination} className={buttonClasses({ size: 'md' })}>
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Open dashboard
            </Link>
          ) : (
            <Link to="/login" className={buttonClasses({ size: 'md' })}>
              <LifeBuoy className="size-4" aria-hidden="true" />
              Sign in
            </Link>
          )}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          CareerCompass · AI-powered career guidance
        </p>
      </div>
    </div>
  )
}

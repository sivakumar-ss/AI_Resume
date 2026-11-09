import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'
import { buttonClasses } from '../ui/Button'

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Student tools', href: '/#tools' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const destination = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link to={destination} className={buttonClasses({ size: 'sm' })}>
              Open dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonClasses({ variant: 'ghost', size: 'sm' })}
              >
                Sign in
              </Link>
              <Link to="/register" className={buttonClasses({ size: 'sm' })}>
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-navy-800 transition hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={
          open
            ? 'border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden'
            : 'hidden'
        }
      >
        <nav className="space-y-1" aria-label="Mobile navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
          {isAuthenticated ? (
            <Link
              to={destination}
              className={buttonClasses({ className: 'w-full' })}
              onClick={() => setOpen(false)}
            >
              Open dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonClasses({ variant: 'outline', className: 'w-full' })}
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={buttonClasses({ className: 'w-full' })}
                onClick={() => setOpen(false)}
              >
                Create a free account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

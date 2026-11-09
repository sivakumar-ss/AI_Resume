import { ArrowUpRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

import Logo from '../ui/Logo'

const CURRENT_YEAR = new Date().getFullYear()

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Student tools', to: '/#tools' },
    ],
  },
  {
    title: 'Student workspace',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My profile', to: '/profile' },
      { label: 'Recommendations', to: '/recommendations' },
      { label: 'Learning roadmap', to: '/roadmap' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Administrator', to: '/admin' },
    ],
  },
]

export default function Footer({ variant = 'public' }) {
  if (variant === 'dashboard') {
    return (
      <footer className="border-t border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} CareerCompass. AI-powered career guidance workspace.</p>
          <p>Student data is stored securely in your project database.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo theme="dark" />
            <p className="mt-5 text-sm leading-6 text-navy-300">
              A clearer path from classroom to career. Build a structured profile,
              understand your strengths, and turn your next step into a plan.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-navy-200">
              <Mail className="size-3.5" aria-hidden="true" />
              Built for the BTech career guidance project
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-400">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1 text-sm text-navy-200 transition hover:text-white"
                      >
                        {link.label}
                        {link.to.startsWith('/#') ? (
                          <ArrowUpRight className="size-3 opacity-60" aria-hidden="true" />
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} CareerCompass. All rights reserved.</p>
          <p>React · Flask · Supabase · scikit-learn</p>
        </div>
      </div>
    </footer>
  )
}

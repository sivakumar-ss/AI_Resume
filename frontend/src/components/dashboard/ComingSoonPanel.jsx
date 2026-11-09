import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import Badge from '../ui/Badge'
import { buttonClasses } from '../ui/Button'

export default function ComingSoonPanel({
  icon: Icon = Sparkles,
  title,
  description,
  bullets = [],
  action,
  actionTo,
  actionLabel,
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/50 to-white p-6 shadow-card sm:p-8">
      <div
        className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-16 size-56 rounded-full bg-sky-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-900 text-brand-300 shadow-lifted">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <Badge variant="warning" dot>
            In development
          </Badge>
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>

        {bullets.length ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3 text-sm text-slate-600"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                <span className="leading-6">{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {actionTo && actionLabel ? (
          <Link to={actionTo} className={buttonClasses({ className: 'mt-6', size: 'md' })}>
            {actionLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : action ? (
          <div className="mt-6">{action}</div>
        ) : null}
      </div>
    </section>
  )
}

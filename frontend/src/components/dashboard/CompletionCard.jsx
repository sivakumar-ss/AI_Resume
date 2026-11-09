import { CheckCircle2, CircleDashed } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonClasses } from '../ui/Button'
import { getProfileChecklist } from '../../utils/profile'
import { cx } from '../../utils/cx'

export default function CompletionCard({ profile, completion }) {
  const checklist = getProfileChecklist(profile)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div
          className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#2f7ff5 ${completion * 3.6}deg, #e2e8f0 0deg)`,
          }}
          aria-hidden="true"
        >
          <div className="flex size-[62px] items-center justify-center rounded-full bg-white">
            <span className="text-lg font-bold text-navy-900">{completion}%</span>
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-navy-900">Profile strength</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {completion === 100
              ? 'Your profile is complete and ready for recommendations.'
              : 'A stronger profile gives the career engine better context.'}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            {item.complete ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-300" aria-hidden="true" />
            )}
            <div>
              <p
                className={cx(
                  'text-sm font-medium',
                  item.complete ? 'text-slate-500 line-through decoration-slate-300' : 'text-navy-900',
                )}
              >
                {item.label}
              </p>
              <p className="text-xs text-slate-400">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/profile"
        className={buttonClasses({
          variant: completion === 100 ? 'outline' : 'primary',
          size: 'sm',
          className: 'mt-5 w-full',
        })}
      >
        {completion === 100 ? 'Review profile' : 'Complete profile'}
      </Link>
    </section>
  )
}

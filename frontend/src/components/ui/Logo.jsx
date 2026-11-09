import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cx } from '../../utils/cx'

export default function Logo({ to = '/', theme = 'light', compact = false, className = '' }) {
  const dark = theme === 'dark'

  return (
    <Link
      to={to}
      className={cx('group inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="CareerCompass home"
    >
      <span
        className={cx(
          'relative flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-[1.03]',
          dark
            ? 'border border-white/15 bg-white/10 text-white'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand-600/20',
        )}
      >
        <Compass className="size-5" aria-hidden="true" />
        <span
          className={cx(
            'absolute -right-0.5 -top-0.5 size-2 rounded-full border-2',
            dark ? 'border-navy-950 bg-brand-300' : 'border-white bg-sky-400',
          )}
          aria-hidden="true"
        />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span
            className={cx(
              'block text-[17px] font-bold tracking-tight',
              dark ? 'text-white' : 'text-navy-900',
            )}
          >
            CareerCompass
          </span>
          <span
            className={cx(
              'mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em]',
              dark ? 'text-navy-300' : 'text-slate-400',
            )}
          >
            AI career guidance
          </span>
        </span>
      ) : null}
    </Link>
  )
}

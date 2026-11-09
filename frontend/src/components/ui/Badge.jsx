import { cx } from '../../utils/cx'

const variants = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  primary: 'border-brand-100 bg-brand-50 text-brand-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  navy: 'border-navy-700/40 bg-navy-900 text-white',
  outline: 'border-slate-300 bg-white text-slate-600',
}

export default function Badge({ children, variant = 'neutral', className = '', dot = false }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        variants[variant] || variants.neutral,
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

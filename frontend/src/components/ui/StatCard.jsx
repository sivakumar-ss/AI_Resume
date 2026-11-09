import { cx } from '../../utils/cx'

const tones = {
  brand: 'border-brand-100 bg-brand-50 text-brand-700',
  navy: 'border-navy-100 bg-navy-50 text-navy-700',
  sky: 'border-sky-100 bg-sky-50 text-sky-700',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-100 bg-amber-50 text-amber-700',
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  className = '',
}) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon ? (
          <span className={cx('rounded-xl border p-2', tones[tone] || tones.brand)}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-navy-900">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  )
}

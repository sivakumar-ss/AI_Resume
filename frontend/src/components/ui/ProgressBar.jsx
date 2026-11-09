import { cx } from '../../utils/cx'

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueLabel,
  color = 'brand',
  size = 'md',
  className = '',
}) {
  const safeMax = max > 0 ? max : 100
  const percentage = Math.min(100, Math.max(0, (Number(value) / safeMax) * 100))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3' }
  const colors = {
    brand: 'bg-brand-500',
    navy: 'bg-navy-800',
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
  }

  return (
    <div className={className}>
      {label || valueLabel ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-semibold text-navy-800">{valueLabel ?? `${Math.round(percentage)}%`}</span>
        </div>
      ) : null}
      <div
        className={cx('overflow-hidden rounded-full bg-slate-100', heights[size] || heights.md)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Number(value) || 0}
        aria-label={label || 'Progress'}
      >
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            colors[color] || colors.brand,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

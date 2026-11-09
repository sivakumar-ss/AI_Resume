import { cx } from '../../utils/cx'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 rounded-2xl border border-brand-100 bg-white p-3 text-brand-600 shadow-sm">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

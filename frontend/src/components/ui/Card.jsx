import { cx } from '../../utils/cx'

export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-slate-200/80 bg-white shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function SectionCard({
  title,
  description,
  action,
  icon: Icon,
  children,
  className = '',
  bodyClassName = '',
  id,
}) {
  return (
    <Card className={cx('overflow-hidden', className)} id={id}>
      {title || description || action ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-navy-900">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cx('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </Card>
  )
}

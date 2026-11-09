import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { cx } from '../../utils/cx'

const variants = {
  info: {
    icon: Info,
    container: 'border-brand-200 bg-brand-50/80 text-brand-900',
    iconClass: 'text-brand-600',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
  warning: {
    icon: TriangleAlert,
    container: 'border-amber-200 bg-amber-50/80 text-amber-900',
    iconClass: 'text-amber-600',
  },
  error: {
    icon: AlertCircle,
    container: 'border-rose-200 bg-rose-50/80 text-rose-900',
    iconClass: 'text-rose-600',
  },
}

export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  onDismiss,
}) {
  const style = variants[variant] || variants.info
  const Icon = style.icon

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        style.container,
        className,
      )}
    >
      <Icon className={cx('mt-0.5 size-4 shrink-0', style.iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cx(title ? 'mt-0.5' : '', 'leading-6')}>{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss message"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

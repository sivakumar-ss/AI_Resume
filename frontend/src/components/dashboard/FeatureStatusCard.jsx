import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cx } from '../../utils/cx'
import Badge from '../ui/Badge'

export default function FeatureStatusCard({
  icon: Icon,
  title,
  description,
  to,
  status = 'soon',
  statusLabel,
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <Badge variant={status === 'available' ? 'success' : 'warning'}>
          {statusLabel || (status === 'available' ? 'Available' : 'In development')}
        </Badge>
      </div>
      <h3 className="mt-4 text-base font-semibold text-navy-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        {status === 'available' ? 'Open workspace' : 'View preview'}
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </>
  )

  return (
    <Link
      to={to}
      className={cx(
        'group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lifted',
      )}
    >
      {content}
    </Link>
  )
}

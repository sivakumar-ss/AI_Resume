import { Building2, CalendarDays, GraduationCap, Pencil, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonClasses } from '../ui/Button'
import { educationLabel, experienceLabel, initials } from '../../utils/profile'
import { cx } from '../../utils/cx'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 rounded-lg bg-slate-100 p-1.5 text-slate-500">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-navy-900">{value || 'Not added'}</p>
      </div>
    </div>
  )
}

export default function ProfileSummaryCard({ profile, user, className = '' }) {
  const name = profile?.full_name || user?.full_name || 'Student'

  return (
    <section
      className={cx(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card',
        className,
      )}
    >
      <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 px-5 py-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-bold text-white">
            {initials(name)}
          </span>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/10"
          >
            <Pencil className="size-3" aria-hidden="true" />
            Edit
          </Link>
        </div>
        <h2 className="mt-4 truncate text-lg font-semibold text-white">{name}</h2>
        <p className="mt-0.5 truncate text-sm text-navy-300">{user?.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-navy-200">
            {educationLabel(profile?.education_level)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium capitalize text-navy-200">
            {experienceLabel(profile?.experience_level)}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 px-5 py-2">
        <DetailRow
          icon={GraduationCap}
          label="Department"
          value={profile?.department || 'Not added'}
        />
        <DetailRow
          icon={Building2}
          label="College"
          value={profile?.college_name || 'Not added'}
        />
        <DetailRow
          icon={CalendarDays}
          label="Graduation year"
          value={profile?.graduation_year || 'Not added'}
        />
        <DetailRow
          icon={UserRound}
          label="Semester"
          value={profile?.semester ? `Semester ${profile.semester}` : 'Not added'}
        />
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        <Link to="/profile" className={buttonClasses({ variant: 'outline', size: 'sm', className: 'w-full' })}>
          Manage profile
        </Link>
      </div>
    </section>
  )
}

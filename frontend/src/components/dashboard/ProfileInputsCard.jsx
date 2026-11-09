import { ArrowRight, Pencil, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonClasses } from '../ui/Button'
import { educationLabel, experienceLabel, formatSkillName } from '../../utils/profile'

function ChipList({ items, emptyLabel }) {
  if (!items.length) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function ProfileInputsCard({ profile, className = '' }) {
  const skills = (profile?.technical_skills || []).map((skill) =>
    formatSkillName(skill.name),
  )
  const interests = profile?.career_interests || profile?.interests || []
  const shownSkills = skills.slice(0, 8)
  const shownInterests = interests.slice(0, 6)

  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-navy-900">Your profile inputs</h2>
            <p className="mt-1 text-sm text-slate-500">
              These values come from your saved student profile.
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 rounded-lg p-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </Link>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Department
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-navy-900">
            {profile?.department || 'Not added'}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Experience
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-navy-900">
            {experienceLabel(profile?.experience_level)}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Education
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-navy-900">
            {educationLabel(profile?.education_level)}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Skills
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy-900">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Technical skills
            </p>
            <span className="text-[11px] text-slate-400">{skills.length} total</span>
          </div>
          <ChipList items={shownSkills} emptyLabel="Add technical skills to strengthen your profile." />
          {skills.length > shownSkills.length ? (
            <p className="mt-2 text-[11px] text-slate-400">
              +{skills.length - shownSkills.length} more in your profile
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Career interests
            </p>
            <span className="text-[11px] text-slate-400">{interests.length} total</span>
          </div>
          <ChipList
            items={shownInterests}
            emptyLabel="Add career interests so future matches can reflect what excites you."
          />
        </div>
      </div>

      {!skills.length || !interests.length ? (
        <Link to="/profile" className={buttonClasses({ variant: 'soft', size: 'sm', className: 'mt-5 w-full' })}>
          Improve profile inputs
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  )
}

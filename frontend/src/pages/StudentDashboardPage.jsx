import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Map,
  Sparkles,
  Target,
  UserRound,
  WandSparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import CompletionCard from '../components/dashboard/CompletionCard'
import FeatureStatusCard from '../components/dashboard/FeatureStatusCard'
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard'
import Badge from '../components/ui/Badge'
import { buttonClasses } from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/ui/StatCard'
import { useAuth } from '../context/AuthContext'
import {
  calculateProfileCompletion,
  experienceLabel,
  firstName,
  getProfileChecklist,
} from '../utils/profile'

const tools = [
  {
    icon: Sparkles,
    title: 'Career recommendations',
    description: 'See career directions ranked against your profile.',
    to: '/recommendations',
    status: 'available',
  },
  {
    icon: Target,
    title: 'Skill gap analysis',
    description: 'Identify the capabilities to build for a target role.',
    to: '/skill-gap',
    status: 'available',
  },
  {
    icon: FileSearch,
    title: 'Resume analyzer',
    description: 'Extract skill signals from your resume text.',
    to: '/resume-analyzer',
    status: 'available',
  },
  {
    icon: Map,
    title: 'Learning roadmap',
    description: 'Turn your gaps into a focused learning path.',
    to: '/roadmap',
    status: 'available',
  },
]

export default function StudentDashboardPage() {
  const { user, profile } = useAuth()
  const [now] = useState(() => new Date())

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student workspace"
          title="Your dashboard"
          description="Your profile will appear here once it is available."
        />
        <EmptyState
          icon={UserRound}
          title="Profile not available"
          description="We could not load your student profile. Refresh the page or open your profile to try again."
          action={
            <Link to="/profile" className={buttonClasses({ size: 'sm' })}>
              Open my profile
            </Link>
          }
        />
      </div>
    )
  }

  const completion = calculateProfileCompletion(profile)
  const checklist = getProfileChecklist(profile)
  const pendingSteps = checklist.filter((item) => !item.complete)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting}, ${firstName(user?.full_name)}`}
        description={`${dateLabel} · Here is a snapshot of your career profile and next steps.`}
        actions={
          <>
            <Link
              to="/profile"
              className={buttonClasses({ variant: 'outline', size: 'sm' })}
            >
              <UserRound className="size-4" aria-hidden="true" />
              Edit profile
            </Link>
            <Link to="/recommendations" className={buttonClasses({ size: 'sm' })}>
              Explore career tools
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-lifted sm:p-7">
        <div className="absolute inset-0 bg-grid-soft opacity-[0.06]" aria-hidden="true" />
        <div
          className="absolute -right-16 -top-20 size-64 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <Badge variant="navy" className="border-white/10 bg-white/10 text-navy-100">
              <WandSparkles className="size-3" aria-hidden="true" />
              Student workspace
            </Badge>
            <h2 className="mt-4 max-w-2xl text-xl font-bold tracking-tight text-white sm:text-2xl">
              {completion === 100
                ? 'Your profile is ready for deeper career insights.'
                : 'A stronger profile unlocks better career guidance.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-300">
              {completion === 100
                ? 'You have captured the foundations. Keep your skills current as you grow through the semester.'
                : 'Add the missing details below so future recommendations can reflect your real academic and skill context.'}
            </p>
            {completion < 100 ? (
              <Link
                to="/profile"
                className={buttonClasses({
                  variant: 'light',
                  size: 'sm',
                  className: 'mt-5',
                })}
              >
                Complete my profile
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                to="/profile"
                className={buttonClasses({
                  variant: 'light',
                  size: 'sm',
                  className: 'mt-5',
                })}
              >
                Review my profile
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Profile strength</p>
              <span className="text-2xl font-bold text-brand-300">{completion}%</span>
            </div>
            <ProgressBar
              value={completion}
              size="md"
              color="brand"
              label=""
              className="mt-3"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-navy-300">Skills added</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {profile.technical_skills?.length || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-navy-300">Interests</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {profile.career_interests?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile strength"
          value={`${completion}%`}
          hint={completion === 100 ? 'Profile complete' : 'Complete the remaining details'}
          icon={Sparkles}
          tone="brand"
        />
        <StatCard
          label="Technical skills"
          value={profile.technical_skills?.length || 0}
          hint="Stored with a proficiency level"
          icon={ClipboardCheck}
          tone="sky"
        />
        <StatCard
          label="Career interests"
          value={profile.career_interests?.length || 0}
          hint="Topics you want to explore"
          icon={Target}
          tone="emerald"
        />
        <StatCard
          label="Experience level"
          value={experienceLabel(profile.experience_level)}
          hint="Based on your current profile"
          icon={UserRound}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-navy-900">Your next best actions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Small profile updates make the career engine more useful.
                </p>
              </div>
              <Badge variant={pendingSteps.length ? 'warning' : 'success'}>
                {pendingSteps.length
                  ? `${pendingSteps.length} remaining`
                  : 'All set'}
              </Badge>
            </div>

            <div className="mt-5 space-y-2.5">
              {pendingSteps.length ? (
                pendingSteps.map((item) => (
                  <Link
                    key={item.label}
                    to="/profile"
                    className="group flex items-center gap-3 rounded-xl border border-slate-200/80 px-3.5 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-navy-900">
                        {item.label}
                      </span>
                      <span className="block text-xs text-slate-500">{item.description}</span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-slate-300 transition group-hover:text-brand-600"
                      aria-hidden="true"
                    />
                  </Link>
                ))
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-3.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      Your profile foundations are complete.
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                      Keep your skills updated and explore the career tools as they become available.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-navy-900">Career intelligence tools</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The next layer of your career workspace.
                </p>
              </div>
              <Badge variant="primary">Roadmap</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tools.map((tool) => (
                <FeatureStatusCard key={tool.title} {...tool} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <CompletionCard profile={profile} completion={completion} />
          <ProfileSummaryCard profile={profile} user={user} />
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'

import { adminApi, healthApi } from '../api/admin'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/ui/StatCard'
import { PanelSkeleton, StatCardSkeleton } from '../components/ui/Skeleton'
import { parseApiError } from '../utils/errors'

const plannedTools = [
  {
    icon: Users,
    title: 'Student directory',
    description: 'Browse students, profile completeness and account activity.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Career catalogue',
    description: 'Manage the careers, required skills and recommendation inputs.',
  },
  {
    icon: BookOpen,
    title: 'Learning resources',
    description: 'Curate the resources used by generated learning roadmaps.',
  },
  {
    icon: ShieldCheck,
    title: 'Access control',
    description: 'Review administrator accounts and platform permissions.',
  },
]

function formatTimestamp(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)
  const [databaseStatus, setDatabaseStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [healthError, setHealthError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    setError('')
    setHealthError('')

    const [statsResult, apiResult, databaseResult] = await Promise.allSettled([
      adminApi.getStats(),
      healthApi.getStatus(),
      healthApi.getDatabaseStatus(),
    ])

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value)
    } else {
      setError(
        parseApiError(
          statsResult.reason,
          'We could not load platform statistics. Please try again.',
        ).message,
      )
    }

    if (apiResult.status === 'fulfilled') {
      setApiStatus(apiResult.value)
    } else {
      setApiStatus(null)
      setHealthError(
        parseApiError(apiResult.reason, 'The API health check could not be reached.')
          .message,
      )
    }

    if (databaseResult.status === 'fulfilled') {
      setDatabaseStatus(databaseResult.value)
    } else {
      setDatabaseStatus(null)
      setHealthError((current) => {
        const message = parseApiError(
          databaseResult.reason,
          'The database health check failed.',
        ).message
        return current && current !== message ? `${current} ${message}` : message
      })
    }

    setUpdatedAt(new Date())
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const distribution = useMemo(() => {
    const total = stats?.users?.total || 0
    const students = stats?.users?.students || 0
    const admins = stats?.users?.admins || 0
    const active = stats?.users?.active || 0

    return {
      total,
      students,
      admins,
      active,
      studentShare: total ? Math.round((students / total) * 100) : 0,
      adminShare: total ? Math.round((admins / total) * 100) : 0,
      activeShare: total ? Math.round((active / total) * 100) : 0,
    }
  }, [stats])

  const apiHealthy = apiStatus?.status === 'ok'
  const databaseHealthy = databaseStatus?.status === 'ok'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="Live account and catalogue counts from the CareerCompass backend, plus platform health."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => load({ refresh: true })}
            loading={refreshing}
            loadingText="Refreshing…"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert
          variant="error"
          title="Statistics could not be loaded"
          onDismiss={() => setError('')}
        >
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
              <PanelSkeleton rows={4} />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
              <PanelSkeleton rows={4} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total users"
              value={stats?.users?.total ?? '—'}
              hint="All registered accounts"
              icon={Users}
              tone="brand"
            />
            <StatCard
              label="Students"
              value={stats?.users?.students ?? '—'}
              hint="Student accounts with a profile"
              icon={GraduationCap}
              tone="sky"
            />
            <StatCard
              label="Administrators"
              value={stats?.users?.admins ?? '—'}
              hint="Accounts with admin access"
              icon={ShieldCheck}
              tone="navy"
            />
            <StatCard
              label="Active accounts"
              value={stats?.users?.active ?? '—'}
              hint="Accounts currently enabled"
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              label="Student profiles"
              value={stats?.profiles ?? '—'}
              hint="Academic profiles on record"
              icon={UserRound}
              tone="amber"
            />
            <StatCard
              label="Career catalogue"
              value={stats?.careers ?? '—'}
              hint="Careers available for matching"
              icon={BriefcaseBusiness}
              tone="brand"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-card">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">
                    Account distribution
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Derived from the current platform totals.
                  </p>
                </div>
                <Badge variant="neutral">Live</Badge>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-600">Students</span>
                    <span className="font-semibold text-navy-900">
                      {distribution.students} · {distribution.studentShare}%
                    </span>
                  </div>
                  <ProgressBar
                    value={distribution.studentShare}
                    label=""
                    size="md"
                    color="brand"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-600">Administrators</span>
                    <span className="font-semibold text-navy-900">
                      {distribution.admins} · {distribution.adminShare}%
                    </span>
                  </div>
                  <ProgressBar
                    value={distribution.adminShare}
                    label=""
                    size="md"
                    color="navy"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-600">Active accounts</span>
                    <span className="font-semibold text-navy-900">
                      {distribution.active} · {distribution.activeShare}%
                    </span>
                  </div>
                  <ProgressBar
                    value={distribution.activeShare}
                    label=""
                    size="md"
                    color="emerald"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-card">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">
                    Platform health
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Checked at {formatTimestamp(updatedAt)}
                  </p>
                </div>
                <Badge variant={apiHealthy && databaseHealthy ? 'success' : 'warning'}>
                  {apiHealthy && databaseHealthy ? 'Operational' : 'Needs attention'}
                </Badge>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {healthError ? (
                  <Alert variant="warning" title="Some checks failed">
                    {healthError}
                  </Alert>
                ) : null}

                <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        apiHealthy
                          ? 'rounded-xl bg-emerald-50 p-2 text-emerald-600'
                          : 'rounded-xl bg-amber-50 p-2 text-amber-600'
                      }
                    >
                      <Activity className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Flask API</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {apiStatus?.service || 'career-guidance-api'}
                        {apiStatus?.version ? ` · v${apiStatus.version}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={apiHealthy ? 'success' : 'warning'}>
                    {apiStatus ? (apiHealthy ? 'Online' : 'Degraded') : 'Unavailable'}
                  </Badge>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        databaseHealthy
                          ? 'rounded-xl bg-emerald-50 p-2 text-emerald-600'
                          : 'rounded-xl bg-amber-50 p-2 text-amber-600'
                      }
                    >
                      <Database className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">Database</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {databaseStatus
                          ? `${databaseStatus.dialect} · ${databaseStatus.latency_ms} ms latency`
                          : 'Connection status unavailable'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={databaseHealthy ? 'success' : 'warning'}>
                    {databaseStatus
                      ? databaseHealthy
                        ? 'Connected'
                        : 'Degraded'
                      : 'Unavailable'}
                  </Badge>
                </div>

                <p className="text-xs leading-5 text-slate-400">
                  Health checks use the public <code>/api/health</code> endpoints. No
                  connection details or credentials are returned to the browser.
                </p>
              </div>
            </section>
          </div>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-navy-900">
                  Administration tools
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  The next set of admin capabilities planned for the platform.
                </p>
              </div>
              <Badge variant="warning" dot>
                In development
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {plannedTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <article
                    key={tool.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
                  >
                    <span className="inline-flex rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-navy-900">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      {tool.description}
                    </p>
                    <div className="mt-4">
                      <Badge variant="warning">In development</Badge>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

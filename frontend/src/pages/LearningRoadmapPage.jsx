import { useEffect, useState } from 'react'
import {
  BookOpen,
  Loader2,
  Map,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import ProfileInputsCard from '../components/dashboard/ProfileInputsCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { recommendationsApi } from '../api/recommendations'
import { roadmapApi } from '../api/roadmap'
import { parseApiError } from '../utils/errors'

export default function LearningRoadmapPage() {
  const { profile } = useAuth()
  const { addToast } = useToast()

  const [recommendations, setRecommendations] = useState([])
  const [selectedCareerId, setSelectedCareerId] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  async function loadRecommendations() {
    try {
      const data = await recommendationsApi.getLatest()
      const items = data?.recommendations || []
      setRecommendations(items)
      if (items.length && !selectedCareerId) {
        setSelectedCareerId(items[0].career.id)
      }
      return items
    } catch {
      setRecommendations([])
      return []
    }
  }

  async function loadRoadmap(careerId) {
    setError('')
    setLoading(true)
    try {
      const data = await roadmapApi.get(careerId)
      setRoadmap(data)
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not load your learning roadmap.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialLoad() {
      const items = await loadRecommendations()
      if (!active) return
      const careerId = items.length ? items[0].career.id : null
      if (careerId) {
        await loadRoadmap(careerId)
      } else {
        setLoading(false)
      }
    }

    initialLoad()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (selectedCareerId) {
      loadRoadmap(selectedCareerId)
    }
  }, [selectedCareerId])

  async function handleGenerateRecommendations() {
    setGenerating(true)
    setError('')
    try {
      await recommendationsApi.generate()
      const items = await loadRecommendations()
      if (items.length) {
        setSelectedCareerId(items[0].career.id)
      }
      addToast({
        type: 'success',
        title: 'Recommendations ready',
        message: 'Your roadmap can now be generated from a recommended career.',
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not generate recommendations.')
      setError(parsed.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleTaskStatus(resourceId, status) {
    setUpdatingId(resourceId)
    setError('')
    try {
      const updated = await roadmapApi.updateProgress(
        resourceId,
        status,
        status === 'completed' ? 100 : status === 'not_started' ? 0 : undefined,
      )
      setRoadmap((current) => {
        if (!current) return current
        return {
          ...current,
          phases: current.phases.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.resource_id === resourceId
                ? { ...task, status: updated.status, progress_percent: updated.progress_percent }
                : task,
            ),
            completed_count: phase.tasks.filter((task) =>
              task.resource_id === resourceId ? updated.status === 'completed' : task.status === 'completed',
            ).length,
          })),
          overall_progress: recalculateProgress(current.phases, resourceId, updated.status),
        }
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not update task progress.')
      setError(parsed.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const progressChartData = (roadmap?.phases || []).map((phase) => ({
    name: `${phase.day}-day`,
    completed: phase.completed_count,
    remaining: Math.max(0, phase.task_count - phase.completed_count),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Turn insight into action"
        title="Learning Roadmap"
        description="A focused plan generated from your selected career and skill gaps. Progress is saved as you mark tasks complete."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!recommendations.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
          <Map className="mx-auto size-8 text-brand-700" aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold text-navy-900">
            Generate recommendations first
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
            A roadmap needs a target career. Generate career recommendations from
            your profile, then choose a career to build a 30/60/90-day plan.
          </p>
          <Button className="mt-5" onClick={handleGenerateRecommendations} loading={generating}>
            Generate recommendations
          </Button>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-navy-900" htmlFor="roadmap-career">
                  Target career
                </label>
                <p className="mt-1 text-sm text-slate-500">
                  The roadmap is generated from this career’s required skills and your current gaps.
                </p>
              </div>
              <select
                id="roadmap-career"
                value={selectedCareerId || ''}
                onChange={(event) => setSelectedCareerId(Number(event.target.value))}
                className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-navy-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {recommendations.map((item) => (
                  <option key={item.career.id} value={item.career.id}>
                    {item.career.title}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto size-5 animate-spin text-brand-700" aria-hidden="true" />
              <p className="mt-3">Building your roadmap…</p>
            </div>
          ) : roadmap?.has_roadmap ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Overall progress</p>
                  <p className="mt-2 text-3xl font-bold text-navy-900">
                    {roadmap.overall_progress.percent}%
                  </p>
                  <ProgressBar className="mt-3" value={roadmap.overall_progress.percent} />
                  <p className="mt-2 text-xs text-slate-500">
                    {roadmap.overall_progress.completed} of {roadmap.overall_progress.total} tasks complete
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Target career</p>
                  <p className="mt-2 text-lg font-bold text-navy-900">{roadmap.career.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{roadmap.career.industry}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Priority skills</p>
                  <p className="mt-2 text-3xl font-bold text-navy-900">
                    {roadmap.priority_skills.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Skills driving this plan</p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
                  <h2 className="text-base font-semibold text-navy-900">Progress by phase</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Completed versus remaining tasks in each phase.
                  </p>
                  <div className="mt-5 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="completed" stackId="progress" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="remaining" stackId="progress" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
                  <h2 className="text-base font-semibold text-navy-900">Priority skills</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Skills ordered by gap priority.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {roadmap.priority_skills.map((skill) => (
                      <li
                        key={skill.skill}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-navy-900">
                          {skill.skill}
                        </span>
                        <Badge variant={skill.status === 'missing' ? 'warning' : 'primary'}>
                          Priority {skill.priority}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {roadmap.phases.map((phase) => (
                <section
                  key={phase.day}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-navy-900">
                        {phase.day}-day phase: {phase.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{phase.description}</p>
                    </div>
                    <Badge variant="neutral">
                      {phase.completed_count}/{phase.task_count} complete
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-3">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.resource_id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={task.difficulty === 'advanced' ? 'danger' : task.difficulty === 'intermediate' ? 'warning' : 'success'}>
                                {task.difficulty}
                              </Badge>
                              <p className="text-sm font-semibold text-navy-900">
                                {task.title}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {task.skill} · {task.provider} · ~{task.estimated_hours} hours
                            </p>
                            <a
                              href={task.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:text-brand-800"
                            >
                              Open resource
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={task.status}
                              disabled={updatingId === task.resource_id}
                              onChange={(event) =>
                                handleTaskStatus(task.resource_id, event.target.value)
                              }
                              className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-navy-800 disabled:opacity-60"
                              aria-label={`Status for ${task.title}`}
                            >
                              <option value="not_started">Not started</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        <ProgressBar
                          className="mt-3"
                          size="sm"
                          value={task.progress_percent}
                          label=""
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <Alert variant="info" title="How progress is tracked">
                {roadmap.disclaimer} Status and progress are saved per task in
                Supabase. Completed tasks update the phase and overall progress.
              </Alert>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
              <Map className="mx-auto size-8 text-brand-700" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold text-navy-900">
                No roadmap available
              </h2>
              <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                {roadmap?.message || 'Generate recommendations first, then create a roadmap.'}
              </p>
            </div>
          )}
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-brand-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-900">
                How the roadmap works
              </h2>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. Choose a recommended career.</li>
              <li>2. Review the skills that are missing or partial.</li>
              <li>3. Complete beginner tasks in the 30-day phase.</li>
              <li>4. Move to intermediate and advanced tasks.</li>
              <li>5. Mark each task complete to track real progress.</li>
            </ol>
          </section>
        </div>
        <div className="space-y-6">
          <ProfileInputsCard profile={profile} />
        </div>
      </div>
    </div>
  )
}

function recalculateProgress(phases, updatedResourceId, updatedStatus) {
  let completed = 0
  let total = 0
  phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      total += 1
      if (task.resource_id === updatedResourceId) {
        if (updatedStatus === 'completed') completed += 1
      } else if (task.status === 'completed') {
        completed += 1
      }
    })
  })
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 1000) / 10 : 0,
  }
}

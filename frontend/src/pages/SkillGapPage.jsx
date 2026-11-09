import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Layers3,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { buttonClasses } from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import ProfileInputsCard from '../components/dashboard/ProfileInputsCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { recommendationsApi } from '../api/recommendations'
import { skillGapApi } from '../api/skillGap'
import { parseApiError } from '../utils/errors'
import { formatSkillName, proficiencyLabel } from '../utils/profile'

const STATUS_COLORS = {
  available: '#10b981',
  partial: '#f59e0b',
  missing: '#f43f5e',
}

export default function SkillGapPage() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const skills = profile?.technical_skills || []

  const [gap, setGap] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function loadGap(generate = false) {
    setError('')
    try {
      const data = await skillGapApi.get(generate)
      setGap(data)
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not load skill gap analysis.')
      setError(parsed.message)
    }
  }

  useEffect(() => {
    loadGap(false)
  }, [])

  async function handleGenerateRecommendations() {
    setGenerating(true)
    setError('')
    try {
      await recommendationsApi.generate()
      await loadGap(false)
      addToast({
        type: 'success',
        title: 'Recommendations generated',
        message: 'Skill gaps were calculated from your new recommendation batch.',
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not generate recommendations.')
      setError(parsed.message)
    } finally {
      setGenerating(false)
    }
  }

  const careers = gap?.careers || []
  const prioritySkills = gap?.priority_skills || []

  const readinessChartData = careers.map((career) => ({
    name: career.career.title.length > 16 ? `${career.career.title.slice(0, 16)}…` : career.career.title,
    readiness: career.readiness_score,
    score: career.recommendation_score_percent,
  }))

  const statusCounts = careers.reduce(
    (counts, career) => {
      counts.available += career.available_skills.length
      counts.partial += career.partial_skills.length
      counts.missing += career.missing_skills.length
      return counts
    },
    { available: 0, partial: 0, missing: 0 },
  )

  const statusChartData = [
    { name: 'Available', value: statusCounts.available, color: STATUS_COLORS.available },
    { name: 'Partial', value: statusCounts.partial, color: STATUS_COLORS.partial },
    { name: 'Missing', value: statusCounts.missing, color: STATUS_COLORS.missing },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career intelligence"
        title="Skill Gap Analysis"
        description="Compare your saved skills with the requirements of your recommended careers and see what to learn first."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!gap?.has_recommendations ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
          <Target className="mx-auto size-8 text-brand-700" aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold text-navy-900">
            Generate recommendations first
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
            Skill gap analysis needs a recommendation batch. Generate one from your
            current profile, then this page will compare your skills with each
            recommended career.
          </p>
          <Button className="mt-5" onClick={handleGenerateRecommendations} loading={generating}>
            Generate recommendations
          </Button>
          <Link
            to="/profile"
            className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-3' })}
          >
            Strengthen my profile
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Overall readiness
              </p>
              <p className="mt-2 text-3xl font-bold text-navy-900">
                {gap.overall_readiness}%
              </p>
              <ProgressBar className="mt-3" value={gap.overall_readiness} />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Recommended careers
              </p>
              <p className="mt-2 text-3xl font-bold text-navy-900">{careers.length}</p>
              <p className="mt-2 text-xs text-slate-500">Top careers from your latest batch</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Priority skills
              </p>
              <p className="mt-2 text-3xl font-bold text-navy-900">{prioritySkills.length}</p>
              <p className="mt-2 text-xs text-slate-500">Skills to strengthen first</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-base font-semibold text-navy-900">
                Career readiness
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Weighted coverage: earned importance divided by required importance.
              </p>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={readinessChartData} margin={{ top: 8, right: 8, left: 0, bottom: 36 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="readiness" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-base font-semibold text-navy-900">
                Skill status across recommended careers
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Available, partial, and missing required skills.
              </p>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
                {statusChartData.map((entry) => (
                  <span key={entry.name} className="inline-flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}: {entry.value}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-navy-900">
                  Skills to learn first
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ranked by total required importance across your recommended careers.
                </p>
              </div>
              <Badge variant="warning" dot>
                {prioritySkills.length} priority
              </Badge>
            </div>

            {prioritySkills.length ? (
              <ul className="mt-5 space-y-3">
                {prioritySkills.map((skill) => (
                  <li
                    key={skill.skill}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy-900">
                          {formatSkillName(skill.skill)}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {skill.reason} Required by {skill.career_count} recommended
                          career{skill.career_count === 1 ? '' : 's'}; total
                          importance {skill.total_importance}.
                        </p>
                      </div>
                      <Badge variant={skill.status === 'missing' ? 'warning' : 'primary'}>
                        {skill.status === 'missing' ? 'Missing' : 'Partial'}
                      </Badge>
                    </div>
                    <ProgressBar
                      className="mt-3"
                      size="sm"
                      value={skill.proficiency}
                      max={5}
                      label=""
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                You already cover the required skills for your recommended careers.
              </p>
            )}
          </section>

          <div className="space-y-6">
            {careers.map((careerGap) => (
              <section
                key={careerGap.career.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-navy-900">
                      {careerGap.career.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Readiness {careerGap.readiness_score}% · recommendation score{' '}
                      {Math.round((careerGap.recommendation_score || 0) * 100)}%
                    </p>
                  </div>
                  <Badge variant="neutral">
                    {careerGap.available_skills.length} available
                  </Badge>
                </div>

                <ProgressBar className="mt-4" value={careerGap.readiness_score} />

                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <SkillStatusList
                    title="Available"
                    skills={careerGap.available_skills}
                    empty="No required skills are fully covered yet."
                    badgeVariant="success"
                  />
                  <SkillStatusList
                    title="Partial"
                    skills={careerGap.partial_skills}
                    empty="No partially developed required skills."
                    badgeVariant="warning"
                  />
                  <SkillStatusList
                    title="Missing"
                    skills={careerGap.missing_skills}
                    empty="No required skills are missing."
                    badgeVariant="danger"
                  />
                </div>
              </section>
            ))}
          </div>

          <Alert variant="info" title="How readiness is calculated">
            {gap.disclaimer} Available means proficiency is at least the skill's
            required importance. Partial means the skill exists but is below that
            level.
          </Alert>
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Layers3 className="size-5 text-brand-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-900">
                Your current skill baseline
              </h2>
            </div>
            {skills.length ? (
              <ul className="mt-4 space-y-3">
                {skills.map((skill) => (
                  <li key={skill.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {formatSkillName(skill.name)}
                      </p>
                      <Badge variant="primary">{proficiencyLabel(skill.proficiency_level)}</Badge>
                    </div>
                    <ProgressBar
                      className="mt-2"
                      size="sm"
                      value={skill.proficiency_level}
                      max={5}
                      label=""
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Add skills on your profile to build a stronger baseline.
              </p>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <ProfileInputsCard profile={profile} />
        </div>
      </div>
    </div>
  )
}

function SkillStatusList({ title, skills, empty, badgeVariant }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
        <Badge variant={badgeVariant}>{skills.length}</Badge>
      </div>
      {skills.length ? (
        <ul className="mt-3 space-y-2">
          {skills.map((skill) => (
            <li
              key={skill.skill}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-navy-900">
                  {formatSkillName(skill.skill)}
                </span>
                <span className="text-xs text-slate-500">
                  {skill.proficiency}/5 · imp {skill.importance}/5
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </div>
  )
}

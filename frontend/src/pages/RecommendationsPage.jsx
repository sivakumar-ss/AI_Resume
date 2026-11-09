import { useEffect, useState } from 'react'
import {
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react'

import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import ProfileInputsCard from '../components/dashboard/ProfileInputsCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { recommendationsApi } from '../api/recommendations'
import { parseApiError } from '../utils/errors'

export default function RecommendationsPage() {
  const { profile } = useAuth()
  const { addToast } = useToast()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadLatest() {
      try {
        const data = await recommendationsApi.getLatest()
        if (active) setResult(data)
      } catch (apiError) {
        const status = apiError?.response?.status
        if (status !== 404) {
          const parsed = parseApiError(apiError, 'We could not load saved recommendations.')
          if (active) setError(parsed.message)
        }
      } finally {
        if (active) setInitialLoading(false)
      }
    }

    loadLatest()
    return () => {
      active = false
    }
  }, [])

  async function handleGenerate() {
    setError('')
    setLoading(true)
    try {
      const data = await recommendationsApi.generate()
      setResult(data)
      addToast({
        type: 'success',
        title: 'Recommendations ready',
        message: `${data.recommendations.length} career matches generated from your profile.`,
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not generate recommendations. Please try again.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  const recommendations = result?.recommendations || []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career intelligence"
        title="Career Recommendations"
        description="Careers ranked against your skills, interests, assessments, and education. Scores measure similarity, not the probability of career success."
        actions={
          <Button onClick={handleGenerate} loading={loading} loadingText="Generating…">
            <Sparkles className="size-4" aria-hidden="true" />
            Generate recommendations
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          {initialLoading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto size-5 animate-spin text-brand-700" aria-hidden="true" />
              <p className="mt-3">Loading saved recommendations…</p>
            </div>
          ) : recommendations.length ? (
            <div className="space-y-4">
              {recommendations.map((item, index) => (
                <article
                  key={`${item.career.id}-${index}`}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary">#{index + 1}</Badge>
                        <h2 className="text-base font-semibold text-navy-900">
                          {item.career.title}
                        </h2>
                        <Badge variant="neutral">{item.career.industry}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.career.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold tracking-tight text-navy-900">
                        {item.score_percent}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        match score
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                      style={{ width: `${item.score_percent}%` }}
                    />
                  </div>

                  {item.matched_skills?.length ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Matching skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.matched_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.missing_skills?.length ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Missing skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.missing_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.explanation ? (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{item.explanation}</p>
                  ) : null}

                  {item.career.learning_path ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Beginner learning path
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.career.learning_path}
                      </p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
              <Sparkles className="mx-auto size-8 text-brand-700" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold text-navy-900">
                No recommendations yet
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Generate a recommendation batch from your current profile. Results
                are saved so you can revisit them later.
              </p>
              <Button className="mt-5" onClick={handleGenerate} loading={loading}>
                Generate recommendations
              </Button>
            </div>
          )}

          {result?.disclaimer ? (
            <Alert variant="info" title="How to read these scores">
              {result.disclaimer}
            </Alert>
          ) : null}
        </div>

        <div className="space-y-6">
          <ProfileInputsCard profile={profile} />
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-brand-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-900">Scoring model</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>50% skill similarity using TF-IDF and cosine similarity</li>
              <li>20% interest match</li>
              <li>20% assessment score, when available</li>
              <li>10% education and background match</li>
            </ul>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Missing student data is excluded and the remaining weights are
              renormalized instead of being treated as zero.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

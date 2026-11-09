import { useEffect, useState } from 'react'
import {
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Gauge,
  XCircle,
} from 'lucide-react'

import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import { useToast } from '../context/ToastContext'
import { assessmentsApi } from '../api/assessments'
import { parseApiError } from '../utils/errors'

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export default function SkillAssessmentPage() {
  const { addToast } = useToast()

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [questionsData, setQuestionsData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [categoryResults, setCategoryResults] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [categoriesData, resultsData] = await Promise.all([
          assessmentsApi.getCategories(),
          assessmentsApi.getResults(),
        ])
        if (active) {
          setCategories(categoriesData.categories || [])
          setCategoryResults(resultsData.results || [])
        }
      } catch (apiError) {
        const parsed = parseApiError(apiError, 'We could not load assessments.')
        if (active) setError(parsed.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!questionsData || result || submitting) return
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [timeLeft, questionsData, result, submitting])

  async function startAssessment(categoryId) {
    setError('')
    setResult(null)
    setAnswers({})
    setQuestionsData(null)
    setLoading(true)
    try {
      const data = await assessmentsApi.getQuestions(categoryId)
      setQuestionsData(data)
      setSelectedCategory(categoryId)
      setTimeLeft(data.time_limit_seconds)
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not load this assessment.')
      setError(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(autoSubmitted = false) {
    if (submitting || !questionsData || result) return
    setSubmitting(true)
    setError('')
    try {
      const timeTaken = questionsData.time_limit_seconds - timeLeft
      const data = await assessmentsApi.submit(
        selectedCategory,
        answers,
        autoSubmitted ? questionsData.time_limit_seconds : timeTaken,
      )
      setResult(data)
      const resultsData = await assessmentsApi.getResults()
      setCategoryResults(resultsData.results || [])
      addToast({
        type: 'success',
        title: 'Assessment saved',
        message: `${data.name}: ${data.score}%`,
      })
    } catch (apiError) {
      const parsed = parseApiError(apiError, 'We could not submit this assessment.')
      setError(parsed.message)
    } finally {
      setSubmitting(false)
    }
  }

  function selectOption(questionId, optionIndex) {
    if (result) return
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }))
  }

  const selectedCategoryMeta = categories.find((item) => item.id === selectedCategory)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Know your starting point"
        title="Skill Assessment"
        description="Measure your current skills with timed multiple-choice assessments. Scores are validated and saved on the server."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!questionsData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const latest = categoryResults.find((item) => item.category === category.id)
              return (
                <Card key={category.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
                      <BrainCircuit className="size-5" aria-hidden="true" />
                    </span>
                    <Badge variant={latest?.attempted ? 'success' : 'neutral'}>
                      {latest?.attempted ? `${latest.score}%` : 'Not taken'}
                    </Badge>
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-navy-900">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {category.question_count} questions · {Math.round(category.time_limit_seconds / 60)} minutes
                  </p>
                  {latest?.completed_at ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Last attempt: {new Date(latest.completed_at).toLocaleDateString()}
                    </p>
                  ) : null}
                  <Button
                    className="mt-4 w-full"
                    onClick={() => startAssessment(category.id)}
                    loading={loading}
                  >
                    <ClipboardCheck className="size-4" aria-hidden="true" />
                    {latest?.attempted ? 'Retake assessment' : 'Start assessment'}
                  </Button>
                </Card>
              )
            })}
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-brand-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-900">
                Category-wise results
              </h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {categoryResults.map((item) => (
                <div key={item.category} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-sm font-semibold text-navy-900">{item.name}</p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">
                    {item.attempted ? `${item.score}%` : '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.attempted ? `${item.question_count} questions` : 'Not attempted'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-navy-900">
                {selectedCategoryMeta?.name} assessment
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Answer all questions before the timer ends. Correct answers are checked on the server.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-navy-900">
              <Clock3 className="size-4 text-brand-700" aria-hidden="true" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {result ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {result.name} result
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      {result.correct_count} of {result.total_questions} correct
                    </p>
                  </div>
                  <p className="text-4xl font-bold text-emerald-900">{result.score}%</p>
                </div>
              </div>

              <ul className="space-y-3">
                {result.details.map((detail, index) => (
                  <li
                    key={detail.question_id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {detail.correct ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy-900">
                          Question {index + 1}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Your answer: option {(detail.selected ?? -1) + 1} · Correct option:{' '}
                          {detail.correct_index + 1}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {detail.explanation}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuestionsData(null)
                  setResult(null)
                  setAnswers({})
                }}
              >
                Back to assessments
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {questionsData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <p className="text-sm font-semibold text-navy-900">
                      {index + 1}. {question.prompt}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option, optionIndex) => {
                        const selected = answers[question.id] === optionIndex
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => selectOption(question.id, optionIndex)}
                            className={
                              selected
                                ? 'rounded-xl border border-brand-300 bg-brand-50 px-3 py-2 text-left text-sm font-medium text-brand-800'
                                : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-600 hover:border-brand-200'
                            }
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Answered {Object.keys(answers).length} of {questionsData.questions.length}
                </p>
                <Button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  loading={submitting}
                  disabled={Object.keys(answers).length !== questionsData.questions.length}
                >
                  <ClipboardCheck className="size-4" aria-hidden="true" />
                  Submit assessment
                </Button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

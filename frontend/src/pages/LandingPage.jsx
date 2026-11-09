import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  Layers3,
  Map,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import { buttonClasses } from '../components/ui/Button'

const features = [
  {
    icon: Sparkles,
    title: 'Personalised recommendations',
    description:
      'Rank career paths against your skills, interests and academic context, with an explanation for every match.',
  },
  {
    icon: Target,
    title: 'Skill gap analysis',
    description:
      'See exactly which capabilities separate you from a target role and what to strengthen first.',
  },
  {
    icon: FileSearch,
    title: 'Resume analyzer',
    description:
      'Turn resume text into structured skill signals, then confirm what belongs on your profile.',
  },
  {
    icon: Map,
    title: 'Learning roadmap',
    description:
      'Follow a focused plan that connects each skill gap to practical learning resources and milestones.',
  },
  {
    icon: ClipboardCheck,
    title: 'Skill assessment',
    description:
      'Capture your current proficiency with guided assessments instead of guessing your own level.',
  },
  {
    icon: BarChart3,
    title: 'Admin oversight',
    description:
      'Give administrators a clear, aggregated view of platform adoption, profiles and career content.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Build your profile',
    description:
      'Add your education, department, college, graduation year, technical skills, interests and experience level.',
    icon: GraduationCap,
  },
  {
    number: '02',
    title: 'Understand your direction',
    description:
      'Turn a structured profile into career signals: strengths, interests and the gaps that matter most.',
    icon: BrainCircuit,
  },
  {
    number: '03',
    title: 'Take the next step',
    description:
      'Use explainable recommendations and a focused roadmap to move from exploration to action.',
    icon: Target,
  },
]

const securityPoints = [
  'JWT sessions with server-side revocation on logout',
  'Students can only read and update their own profile',
  'Administrator routes are protected by role-based access',
]

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard'
  const primaryPath = isAuthenticated ? dashboardPath : '/register'

  return (
    <div>
      <section className="hero-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-soft opacity-40" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI-powered career intelligence for students
            </span>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
              Navigate your career with{' '}
              <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
                clarity.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Bring your academics, skills and interests into one professional
              profile. CareerCompass helps you understand where you fit, what to
              learn next, and how to get there.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={primaryPath}
                className={buttonClasses({ size: 'lg', className: 'group' })}
              >
                {isAuthenticated ? 'Open my dashboard' : 'Build my profile'}
                <ArrowRight
                  className="size-[18px] transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to={isAuthenticated ? '/recommendations' : '/login'}
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                {isAuthenticated ? 'Explore career tools' : 'Sign in to continue'}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                Structured student profile
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                Explainable career signals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                Secure role-based access
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mr-0">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-300/30 via-sky-200/20 to-transparent blur-2xl"
              aria-hidden="true"
            />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-lifted backdrop-blur-xl">
              <div className="overflow-hidden rounded-[1.55rem] bg-navy-950 p-5 text-white sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-brand-300">
                      <Sparkles className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Career intelligence</p>
                      <p className="text-[11px] text-navy-400">A guided career workspace</p>
                    </div>
                  </div>
                  <Badge variant="navy" className="border-white/10 bg-white/10 text-navy-100">
                    Preview
                  </Badge>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-navy-100">Your foundation</p>
                    <Layers3 className="size-4 text-brand-300" aria-hidden="true" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Academic profile', 'Education, college and graduation year'],
                      ['Skill signals', 'Technical skills with proficiency levels'],
                      ['Career interests', 'The work you want to explore'],
                    ].map(([title, description], index) => (
                      <div key={title} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-200">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{title}</p>
                          <p className="mt-0.5 text-[11px] leading-5 text-navy-400">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-transparent p-4">
                    <Target className="size-5 text-brand-300" aria-hidden="true" />
                    <p className="mt-3 text-xs font-semibold text-white">Skill gaps</p>
                    <p className="mt-1 text-[11px] leading-5 text-navy-300">
                      Focus on the capabilities that move you forward.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/15 to-transparent p-4">
                    <Map className="size-5 text-sky-300" aria-hidden="true" />
                    <p className="mt-3 text-xs font-semibold text-white">Learning path</p>
                    <p className="mt-1 text-[11px] leading-5 text-navy-300">
                      Turn insight into a practical next step.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[11px] text-navy-300">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-400" aria-hidden="true" />
                    Private student workspace
                  </span>
                  <span className="text-navy-500">CareerCompass</span>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-16 hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lifted sm:block">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-navy-900">Explainable</p>
                  <p className="text-[10px] text-slate-500">Every signal has a reason</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Designed around the student journey
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="size-4 text-brand-600" aria-hidden="true" />
              Academic context
            </span>
            <span className="inline-flex items-center gap-2">
              <BrainCircuit className="size-4 text-brand-600" aria-hidden="true" />
              Skill intelligence
            </span>
            <span className="inline-flex items-center gap-2">
              <Target className="size-4 text-brand-600" aria-hidden="true" />
              Actionable direction
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
              Secure by design
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50/80 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              One connected workspace
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Everything you need to move forward
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              CareerCompass connects the dots between your profile, your skills and
              the opportunities you want to pursue.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lifted"
                >
                  <span className="inline-flex rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700 transition group-hover:bg-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-navy-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                From profile to plan, without the guesswork.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Start with what you already know about yourself. Each step adds
                structure, then turns that structure into a useful next move.
              </p>
              <Link
                to={primaryPath}
                className={buttonClasses({ variant: 'outline', className: 'mt-6' })}
              >
                {isAuthenticated ? 'Continue your journey' : 'Start with your profile'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <article
                    key={step.number}
                    className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7"
                  >
                    <span
                      className="absolute right-5 top-4 text-5xl font-extrabold tracking-tighter text-slate-100"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-brand-300">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                          Step {step.number}
                        </p>
                        <h3 className="mt-1.5 text-lg font-semibold text-navy-900">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="bg-navy-950 py-20 text-white lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              Built for trust
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A workspace that treats your data with care.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-navy-300 sm:text-base">
              Career guidance only works when students feel safe sharing context.
              The platform uses a protected API, hashed passwords and ownership-aware
              profile access.
            </p>
            <ul className="mt-7 space-y-3">
              {securityPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-navy-200">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span className="leading-6">{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-navy-300">
              {['React + Vite', 'Flask API', 'Supabase PostgreSQL', 'SQLAlchemy'].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: 'Ownership enforced',
                text: 'Profile and skill endpoints derive the student from the JWT, never a client-supplied user ID.',
              },
              {
                icon: Layers3,
                title: 'Normalised skills',
                text: 'A shared skill catalogue keeps student skills clean and comparable across profiles.',
              },
              {
                icon: BrainCircuit,
                title: 'Explainable direction',
                text: 'The roadmap connects profile signals to career insights so students understand the why.',
              },
              {
                icon: GraduationCap,
                title: 'Student-first',
                text: 'Every screen is built to help a student take one more confident step.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <span className="inline-flex rounded-xl bg-brand-500/15 p-2.5 text-brand-300">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-navy-300">{item.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 px-6 py-12 text-center shadow-lifted sm:px-10 lg:px-16 lg:py-16">
            <div className="absolute inset-0 bg-grid-soft opacity-[0.08]" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Start with what you have
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your next step starts with a clearer profile.
              </h2>
              <p className="mt-4 text-sm leading-7 text-brand-100 sm:text-base">
                Create your student account, add your academic context and skills,
                and build the foundation for personalised career guidance.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to={primaryPath}
                  className={buttonClasses({
                    variant: 'light',
                    size: 'lg',
                  })}
                >
                  {isAuthenticated ? 'Open dashboard' : 'Create your profile'}
                  <ArrowRight className="size-[18px]" aria-hidden="true" />
                </Link>
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className={buttonClasses({
                      variant: 'onDark',
                      size: 'lg',
                    })}
                  >
                    Sign in
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

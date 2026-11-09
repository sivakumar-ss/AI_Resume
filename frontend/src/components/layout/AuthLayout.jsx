import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <div className="auth-glow min-h-[calc(100vh-72px)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lifted lg:grid-cols-[1.05fr_1.15fr]">
        <section className="relative hidden overflow-hidden bg-navy-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            className="absolute inset-0 bg-grid-soft opacity-[0.07]"
            aria-hidden="true"
          />
          <div
            className="absolute -right-20 top-10 size-72 rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 size-72 rounded-full bg-sky-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-navy-200">
              <Sparkles className="size-3.5 text-brand-300" aria-hidden="true" />
              Career intelligence, made personal
            </span>
            <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Build a career direction you can defend.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-navy-300">
              Bring your academics, skills and interests into one structured
              profile. CareerCompass turns that foundation into clearer, more
              useful next steps.
            </p>

            <ul className="mt-8 space-y-4 text-sm text-navy-100">
              {[
                'A profile built around your real academic journey',
                'Skills and interests organised for better recommendations',
                'A secure workspace backed by role-aware authentication',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-brand-300"
                    aria-hidden="true"
                  />
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-10 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-navy-400">
            <ShieldCheck className="size-4 text-navy-300" aria-hidden="true" />
            Password hashing, JWT sessions and role-based access
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-700"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Back to home
            </Link>

            {eyebrow ? (
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            ) : null}

            <div className="mt-7">{children}</div>

            {footer ? (
              <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

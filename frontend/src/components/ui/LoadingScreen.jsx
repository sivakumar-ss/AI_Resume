import { Compass } from 'lucide-react'

import Spinner from './Spinner'

export default function LoadingScreen({ message = 'Preparing your workspace…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-3xl bg-brand-500/30 blur-2xl" aria-hidden="true" />
        <span className="relative flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lifted backdrop-blur">
          <Compass className="size-8" aria-hidden="true" />
        </span>
      </div>
      <p className="text-lg font-semibold text-white">CareerCompass</p>
      <p className="mt-1 text-sm text-navy-200">{message}</p>
      <Spinner size="lg" className="mt-6 text-brand-300" label={message} />
    </div>
  )
}

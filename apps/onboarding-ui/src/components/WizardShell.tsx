import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { WizardNav } from './WizardNav'
import { WizardProgress } from './WizardProgress'

interface WizardShellProps {
  currentIndex: number
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  hideNext?: boolean
  nextLabel?: string
  children: ReactNode
}

export function WizardShell({
  currentIndex,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  hideNext,
  nextLabel,
  children,
}: WizardShellProps) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(15,23,42,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_50%,#f1f5f9_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto flex min-h-full max-w-4xl flex-col px-6 py-10 md:px-10 md:py-14">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 space-y-3"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Opik contributor path</p>
          <h1 className="font-display text-4xl tracking-tight text-slate-950 md:text-5xl">Onboarding</h1>
          <p className="max-w-xl text-sm text-slate-500">
            From local stack to first pull request, one focused step at a time.
          </p>
        </motion.header>

        <WizardProgress currentIndex={currentIndex} />

        <main className="mt-8 flex flex-1 flex-col">
          <div className="flex-1">{children}</div>
          <WizardNav
            onBack={onBack}
            onNext={onNext}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            hideNext={hideNext}
            nextLabel={nextLabel}
          />
        </main>
      </div>
    </div>
  )
}

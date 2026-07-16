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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(46,133,85,0.12),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f7faf8_50%,#f3f6f4_100%)]"
      />

      <div className="relative mx-auto flex min-h-full max-w-4xl flex-col px-6 py-10 md:px-10 md:py-14">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 space-y-4"
        >
          <a
            href="https://www.comet.com/docs/opik/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
            data-testid="opik-brand-logo"
          >
            <img
              src="/opik-logo.svg"
              alt="Opik"
              className="h-7 w-auto"
              height={28}
            />
          </a>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Contributor onboarding
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              From local stack to first pull request
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              One focused step at a time, built for the Opik open-source community.
            </p>
          </div>
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

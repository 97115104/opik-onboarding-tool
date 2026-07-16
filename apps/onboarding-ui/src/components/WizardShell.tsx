import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { attestation } from '../content/attestation'
import { WizardNav } from './WizardNav'
import { WizardProgress } from './WizardProgress'

interface WizardShellProps {
  currentIndex: number
  maxReachedIndex: number
  onGoToStep: (index: number) => void
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  hideNext?: boolean
  nextLabel?: string
  navCenter?: ReactNode
  children: ReactNode
}

export function WizardShell({
  currentIndex,
  maxReachedIndex,
  onGoToStep,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  hideNext,
  nextLabel,
  navCenter,
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

        <WizardProgress
          currentIndex={currentIndex}
          maxReachedIndex={maxReachedIndex}
          onGoToStep={onGoToStep}
        />

        <main className="mt-8 flex flex-1 flex-col">
          <div className="flex-1">{children}</div>
          <WizardNav
            onBack={onBack}
            onNext={onNext}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            hideNext={hideNext}
            nextLabel={nextLabel}
            center={navCenter}
          />
          <footer className="mt-6 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3 text-[11px] leading-relaxed text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="sm:flex-1">
              Built with <span aria-hidden>♥</span> for{' '}
              <a
                href="https://github.com/comet-ml/opik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Opik Community
              </a>{' '}
              by{' '}
              <a
                href="https://links.97115104.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Austin H
              </a>
            </div>
            <div
              data-testid="footer-powered-by"
              className="sm:flex-1 sm:text-center"
            >
              Inference by{' '}
              <a
                href="https://ollama.com/library/llama3.1:8b"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Llama 3.1 8B
              </a>{' '}
              via local{' '}
              <a
                href="https://github.com/ollama/ollama"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Ollama
              </a>
            </div>
            <div className="sm:flex-1 sm:text-right">
              Made with{' '}
              <a
                href={attestation.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
              >
                Cursor Agent (Auto)
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

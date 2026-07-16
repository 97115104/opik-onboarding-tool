import type { ReactNode } from 'react'

interface WizardNavProps {
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  hideNext?: boolean
  nextLabel?: string
  center?: ReactNode
}

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  hideNext = false,
  nextLabel = 'Next',
  center,
}: WizardNavProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--color-border)] pt-6 max-[400px]:gap-1">
      <button
        type="button"
        data-testid="wizard-back"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35 max-[400px]:px-3"
      >
        Back
      </button>
      <div className="min-w-0 overflow-x-auto [scrollbar-width:none]">{center}</div>
      {hideNext ? (
        <span className="justify-self-end h-10 w-px" aria-hidden />
      ) : (
        <button
          type="button"
          data-testid="wizard-next"
          onClick={onNext}
          disabled={!canGoNext}
          className="justify-self-end rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-[var(--color-accent-hover)] hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-35 max-[400px]:px-3"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

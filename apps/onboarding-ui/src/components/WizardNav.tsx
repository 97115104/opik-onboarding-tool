interface WizardNavProps {
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  hideNext?: boolean
  nextLabel?: string
}

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  hideNext = false,
  nextLabel = 'Next',
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
      <button
        type="button"
        data-testid="wizard-back"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
      >
        Back
      </button>
      {hideNext ? (
        <span className="h-10 w-px" aria-hidden />
      ) : (
        <button
          type="button"
          data-testid="wizard-next"
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

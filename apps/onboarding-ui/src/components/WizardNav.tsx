interface WizardNavProps {
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  nextLabel?: string
}

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  nextLabel = 'Next',
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
      <button
        type="button"
        data-testid="wizard-back"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
      >
        Back
      </button>
      <button
        type="button"
        data-testid="wizard-next"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-full bg-sky-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {nextLabel}
      </button>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { CONTENT_STEP_COUNT, WIZARD_STEPS } from '../wizard/steps'

interface WizardProgressProps {
  currentIndex: number
  maxReachedIndex: number
  onGoToStep: (index: number) => void
}

export function WizardProgress({
  currentIndex,
  maxReachedIndex,
  onGoToStep,
}: WizardProgressProps) {
  const step = WIZARD_STEPS[currentIndex]
  const isFinish = step?.id === 'finish'
  const activePillRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activePillRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>
          {isFinish
            ? 'Complete'
            : `Step ${currentIndex + 1} of ${CONTENT_STEP_COUNT}`}
        </span>
        <span>{isFinish ? '✓ Finish' : step?.label}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-200" aria-hidden>
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, ((currentIndex + 1) / CONTENT_STEP_COUNT) * 100)}%` }}
        />
      </div>
      <nav
        data-testid="wizard-step-nav"
        aria-label="Wizard steps"
        className="overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%_-_1rem),transparent)] [scrollbar-width:none]"
      >
        <div className="flex w-max min-w-full flex-nowrap gap-1.5 px-3">
          {WIZARD_STEPS.map((wizardStep, index) => {
            const isCurrent = index === currentIndex
            const reached = index <= maxReachedIndex
            return (
              <button
                key={wizardStep.id}
                ref={isCurrent ? activePillRef : undefined}
                type="button"
                data-testid={`wizard-step-${wizardStep.id}`}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={wizardStep.label}
                title={wizardStep.label}
                disabled={!reached}
                onClick={() => onGoToStep(index)}
                className={`shrink-0 rounded-md px-2 py-1 text-left text-[11px] leading-snug transition ${
                  isCurrent
                    ? 'bg-[var(--color-accent)] font-semibold text-white'
                    : reached
                      ? 'border border-[var(--color-border)] bg-white text-slate-700 hover:border-[var(--color-accent)] hover:text-slate-950'
                      : 'cursor-not-allowed border border-transparent bg-slate-100 text-slate-400'
                }`}
              >
                {wizardStep.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

interface ProgressDotsProps {
  currentIndex: number
  total: number
  maxReachedIndex: number
  onGoTo: (index: number) => void
  testIdPrefix: string
  label: string
}

/**
 * Keeps step and slide progress visually identical while preserving their
 * separate navigation rules.
 */
export function ProgressDots({
  currentIndex,
  total,
  maxReachedIndex,
  onGoTo,
  testIdPrefix,
  label,
}: ProgressDotsProps) {
  return (
    <div
      className="flex w-max min-w-full items-center justify-center gap-1.5"
      role="group"
      aria-label={label}
    >
      {Array.from({ length: total }, (_, index) => {
        const reached = index <= maxReachedIndex
        const current = index === currentIndex

        return (
          <button
            key={index}
            type="button"
            aria-current={current ? 'step' : undefined}
            aria-label={`${label} ${index + 1}`}
            data-testid={`${testIdPrefix}-${index}`}
            disabled={!reached}
            onClick={() => onGoTo(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              current
                ? 'bg-[var(--color-accent)]'
                : reached
                  ? 'bg-slate-300 hover:bg-slate-400'
                  : 'cursor-not-allowed bg-slate-200'
            }`}
          />
        )
      })}
    </div>
  )
}

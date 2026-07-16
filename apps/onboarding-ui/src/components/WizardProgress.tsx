import { motion } from 'framer-motion'
import { CONTENT_STEP_COUNT, WIZARD_STEPS } from '../wizard/steps'

interface WizardProgressProps {
  currentIndex: number
}

export function WizardProgress({ currentIndex }: WizardProgressProps) {
  const step = WIZARD_STEPS[currentIndex]
  const isFinish = step?.id === 'finish'
  const progress = isFinish
    ? 100
    : ((Math.min(currentIndex + 1, CONTENT_STEP_COUNT) / CONTENT_STEP_COUNT) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>
          {isFinish
            ? 'Complete'
            : `Step ${currentIndex + 1} of ${CONTENT_STEP_COUNT}`}
        </span>
        <span>{step?.label}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

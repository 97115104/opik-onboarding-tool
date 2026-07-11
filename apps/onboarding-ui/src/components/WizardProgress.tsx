import { motion } from 'framer-motion'
import { WIZARD_STEPS } from '../wizard/steps'

interface WizardProgressProps {
  currentIndex: number
}

export function WizardProgress({ currentIndex }: WizardProgressProps) {
  const progress = ((currentIndex + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
        <span>
          Step {currentIndex + 1} of {WIZARD_STEPS.length}
        </span>
        <span>{WIZARD_STEPS[currentIndex]?.label}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

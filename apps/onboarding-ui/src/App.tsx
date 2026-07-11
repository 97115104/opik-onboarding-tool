import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useCallback, useMemo, useState, type ReactNode } from 'react'
import { WizardShell } from '@/components/WizardShell'
import { ContributionProvider } from '@/features/issues/ContributionContext'
import { STEP_REGISTRY } from '@/wizard/stepRegistry'
import { WIZARD_STEPS } from '@/wizard/steps'

function StepFallback() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-sm text-slate-500">
      Loading step…
    </div>
  )
}

function StepTransition({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const step = STEP_REGISTRY[currentIndex]
  const StepComponent = step?.Component

  const canGoBack = currentIndex > 0
  const canGoNext = currentIndex < STEP_REGISTRY.length - 1
  const isLastStep = currentIndex === STEP_REGISTRY.length - 1

  const goBack = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(STEP_REGISTRY.length - 1, index + 1))
  }, [])

  const stepKey = useMemo(() => WIZARD_STEPS[currentIndex]?.id ?? 'unknown', [currentIndex])

  return (
    <ContributionProvider>
      <WizardShell
        currentIndex={currentIndex}
        onBack={goBack}
        onNext={goNext}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        nextLabel={isLastStep ? 'Finish' : 'Next'}
      >
        <AnimatePresence mode="wait">
          {StepComponent ? (
            <StepTransition stepKey={stepKey}>
              {step?.lazy ? (
                <Suspense fallback={<StepFallback />}>
                  <StepComponent />
                </Suspense>
              ) : (
                <StepComponent />
              )}
            </StepTransition>
          ) : null}
        </AnimatePresence>
      </WizardShell>
    </ContributionProvider>
  )
}

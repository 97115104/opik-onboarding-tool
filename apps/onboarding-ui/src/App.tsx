import { AnimatePresence, motion } from 'framer-motion'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { WizardShell } from '@/components/WizardShell'
import { ContributionProvider } from '@/features/issues/ContributionContext'
import { contributionStore } from '@/features/issues'
import {
  isQuizFinishedInStorage,
  PERSONA_CHANGED_EVENT,
  readPersona,
} from '@/lib/persona'
import {
  getWizardGatesSnapshot,
  subscribeWizardGates,
} from '@/lib/wizardGates'
import { STEP_REGISTRY } from '@/wizard/stepRegistry'
import { WIZARD_STEPS } from '@/wizard/steps'

function StepFallback() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-sm text-slate-500">
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

function usePersonaSelected() {
  const [persona, setPersona] = useState(() => readPersona())

  useEffect(() => {
    const sync = () => setPersona(readPersona())
    window.addEventListener(PERSONA_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(PERSONA_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return persona !== null
}

/**
 * Hide wizard Next on the quiz step until finished.
 * Prefer contributionStore.quizFinished / quizPassed; also accept localStorage
 * `opik-quiz-finished=1` and optional `opik-quiz-state` events.
 */
function useQuizFinished() {
  const snapshot = useSyncExternalStore(
    contributionStore.subscribe,
    contributionStore.getSnapshot,
    contributionStore.getSnapshot,
  )
  const [storageFinished, setStorageFinished] = useState(() => isQuizFinishedInStorage())

  useEffect(() => {
    const sync = () => setStorageFinished(isQuizFinishedInStorage())
    const onQuizState = (event: Event) => {
      const detail = (event as CustomEvent<{ finished?: boolean }>).detail
      if (detail?.finished) setStorageFinished(true)
      else sync()
    }
    window.addEventListener('storage', sync)
    window.addEventListener('opik-quiz-state', onQuizState)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('opik-quiz-state', onQuizState)
    }
  }, [])

  const storeFinished =
    snapshot.quizPassed ||
    ('quizFinished' in snapshot && Boolean((snapshot as { quizFinished?: boolean }).quizFinished))

  return storeFinished || storageFinished
}

function useWizardGates() {
  return useSyncExternalStore(
    subscribeWizardGates,
    getWizardGatesSnapshot,
    getWizardGatesSnapshot,
  )
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [boundaryKey, setBoundaryKey] = useState(0)
  const personaSelected = usePersonaSelected()
  const quizFinished = useQuizFinished()
  const gates = useWizardGates()

  const step = STEP_REGISTRY[currentIndex]
  const StepComponent = step?.Component
  const stepId = WIZARD_STEPS[currentIndex]?.id

  const canGoBack = currentIndex > 0
  const isFinishStep = stepId === 'finish'
  const isExtendStep = stepId === 'extend'
  const canGoNext = currentIndex < STEP_REGISTRY.length - 1

  // Gate Next: about requires persona; overview/graph/tour/contributing/verify/quiz hide until complete; issues require a pick.
  const hideNext =
    isFinishStep ||
    (stepId === 'about' && !personaSelected) ||
    (stepId === 'overview' && !gates.overview) ||
    (stepId === 'graph' && !gates.graph) ||
    (stepId === 'tour' && !gates.tour) ||
    (stepId === 'quiz' && !quizFinished) ||
    (stepId === 'contributing-overview' && !gates.contributingOverview) ||
    (stepId === 'verify' && !gates.verify)

  const issueSelected = useSyncExternalStore(
    contributionStore.subscribe,
    () => contributionStore.getSnapshot().selectedIssue !== null,
    () => contributionStore.getSnapshot().selectedIssue !== null,
  )

  const canAdvance =
    canGoNext &&
    !hideNext &&
    !(stepId === 'issues' && !issueSelected)

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
        canGoNext={canAdvance}
        hideNext={hideNext}
        nextLabel={isExtendStep ? 'Finish' : 'Next'}
      >
        <ErrorBoundary onReset={() => setBoundaryKey((value) => value + 1)}>
          <AnimatePresence mode="wait">
            {StepComponent ? (
              <StepTransition stepKey={`${stepKey}-${boundaryKey}`}>
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
        </ErrorBoundary>
      </WizardShell>
    </ContributionProvider>
  )
}

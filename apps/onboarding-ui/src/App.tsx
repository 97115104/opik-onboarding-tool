import { AnimatePresence, motion } from 'framer-motion'
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProgressDots } from '@/components/ProgressDots'
import { WizardShell } from '@/components/WizardShell'
import { ContributionProvider } from '@/features/issues/ContributionContext'
import { contributionStore } from '@/features/issues'
import {
  isContributingQuizFinishedInStorage,
  isQuizFinishedInStorage,
  PERSONA_CHANGED_EVENT,
  readPersona,
} from '@/lib/persona'
import {
  getSlideDeckSnapshot,
  setActiveSlideDeckStep,
  subscribeSlideDeck,
} from '@/lib/slideDeckNav'
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

/**
 * Hide wizard Next on the contributing quiz step until finished.
 * Prefer contributionStore.contributingQuizFinished; also accept localStorage
 * `opik-contributing-quiz-finished=1` and `opik-contributing-quiz-state` events.
 */
function useContributingQuizFinished() {
  const snapshot = useSyncExternalStore(
    contributionStore.subscribe,
    contributionStore.getSnapshot,
    contributionStore.getSnapshot,
  )
  const [storageFinished, setStorageFinished] = useState(() =>
    isContributingQuizFinishedInStorage(),
  )

  useEffect(() => {
    const sync = () => setStorageFinished(isContributingQuizFinishedInStorage())
    const onQuizState = (event: Event) => {
      const detail = (event as CustomEvent<{ finished?: boolean }>).detail
      if (detail?.finished) setStorageFinished(true)
      else sync()
    }
    window.addEventListener('storage', sync)
    window.addEventListener('opik-contributing-quiz-state', onQuizState)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('opik-contributing-quiz-state', onQuizState)
    }
  }, [])

  return Boolean(snapshot.contributingQuizFinished) || storageFinished
}

function useWizardGates() {
  return useSyncExternalStore(
    subscribeWizardGates,
    getWizardGatesSnapshot,
    getWizardGatesSnapshot,
  )
}

function useSlideDeckNav() {
  return useSyncExternalStore(subscribeSlideDeck, getSlideDeckSnapshot, getSlideDeckSnapshot)
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [maxReachedIndex, setMaxReachedIndex] = useState(0)
  const [boundaryKey, setBoundaryKey] = useState(0)
  const personaSelected = usePersonaSelected()
  const quizFinished = useQuizFinished()
  const contributingQuizFinished = useContributingQuizFinished()
  const gates = useWizardGates()
  const slideDeck = useSlideDeckNav()

  const step = STEP_REGISTRY[currentIndex]
  const StepComponent = step?.Component
  const stepId = WIZARD_STEPS[currentIndex]?.id

  const isSlideDeckStep = stepId === 'overview' || stepId === 'contributing-overview'

  useLayoutEffect(() => {
    setActiveSlideDeckStep(isSlideDeckStep ? stepId! : null)
    return () => setActiveSlideDeckStep(null)
  }, [isSlideDeckStep, stepId])

  useEffect(() => {
    setMaxReachedIndex((prev) => Math.max(prev, currentIndex))
  }, [currentIndex])

  const canGoBack = currentIndex > 0 || Boolean(isSlideDeckStep && slideDeck?.canPrevSlide)
  const isFinishStep = stepId === 'finish'
  const isExtendStep = stepId === 'extend'
  const canGoNext = currentIndex < STEP_REGISTRY.length - 1

  const slideDeckStepComplete =
    stepId === 'overview'
      ? gates.overview
      : stepId === 'contributing-overview'
        ? gates.contributingOverview
        : false

  const hideNext =
    isFinishStep ||
    (stepId === 'about' && !personaSelected) ||
    (stepId === 'graph' && !gates.graph) ||
    (stepId === 'tour' && !gates.tour) ||
    (stepId === 'quiz' && !quizFinished) ||
    (stepId === 'contributing-quiz' && !contributingQuizFinished) ||
    (stepId === 'verify' && !gates.verify)

  const issueSelected = useSyncExternalStore(
    contributionStore.subscribe,
    () => contributionStore.getSnapshot().selectedIssue !== null,
    () => contributionStore.getSnapshot().selectedIssue !== null,
  )

  const canAdvanceSlideDeck =
    isSlideDeckStep &&
    Boolean(
      slideDeck &&
        (slideDeck.canNextSlide || (slideDeck.atLastSlide && slideDeckStepComplete)),
    )

  const canAdvance =
    canGoNext &&
    !hideNext &&
    !(stepId === 'issues' && !issueSelected) &&
    (!isSlideDeckStep || canAdvanceSlideDeck)

  /** Clear quiz finished flags before entering a quiz step so stale localStorage cannot unlock Next during lazy Suspense. */
  function clearQuizGateForStep(nextId: string | undefined) {
    if (nextId === 'quiz') {
      contributionStore.setQuizFinished(false)
      contributionStore.setQuizPassed(false)
    }
    if (nextId === 'contributing-quiz') {
      contributionStore.setContributingQuizFinished(false)
    }
  }

  const goBackWizard = useCallback(() => {
    const nextIndex = Math.max(0, currentIndex - 1)
    clearQuizGateForStep(WIZARD_STEPS[nextIndex]?.id)
    setCurrentIndex(nextIndex)
  }, [currentIndex])

  const goNextWizard = useCallback(() => {
    const nextIndex = Math.min(STEP_REGISTRY.length - 1, currentIndex + 1)
    clearQuizGateForStep(WIZARD_STEPS[nextIndex]?.id)
    setCurrentIndex(nextIndex)
    setMaxReachedIndex((prev) => Math.max(prev, nextIndex))
  }, [currentIndex])

  /** Jump only to steps already reached; slide decks restore from wizardGates progress. */
  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index > maxReachedIndex || index === currentIndex) return
      clearQuizGateForStep(WIZARD_STEPS[index]?.id)
      setCurrentIndex(index)
    },
    [currentIndex, maxReachedIndex],
  )

  const handleBack = useCallback(() => {
    if (isSlideDeckStep && slideDeck?.canPrevSlide) {
      slideDeck.prevSlide()
      return
    }
    goBackWizard()
  }, [isSlideDeckStep, slideDeck, goBackWizard])

  const handleNext = useCallback(() => {
    if (isSlideDeckStep && slideDeck?.canNextSlide) {
      slideDeck.nextSlide()
      return
    }
    if (isSlideDeckStep && slideDeck && !slideDeck.canNextSlide) {
      if (slideDeck.atLastSlide && slideDeckStepComplete) {
        goNextWizard()
      }
      return
    }
    goNextWizard()
  }, [isSlideDeckStep, slideDeck, slideDeckStepComplete, goNextWizard])

  const stepKey = useMemo(() => WIZARD_STEPS[currentIndex]?.id ?? 'unknown', [currentIndex])
  const navCenter =
    isSlideDeckStep && slideDeck
      ? (
          <ProgressDots
            currentIndex={slideDeck.currentSlideIndex}
            total={slideDeck.totalSlides}
            maxReachedIndex={slideDeck.maxReachedSlideIndex}
            onGoTo={slideDeck.goToSlide}
            testIdPrefix={stepId === "contributing-overview" ? "contributing-slide-dot" : "overview-slide-dot"}
            label={`${step?.id === 'overview' ? 'Overview' : 'Contributing overview'} slides`}
          />
        )
      : (
          <ProgressDots
            currentIndex={currentIndex}
            total={WIZARD_STEPS.length}
            maxReachedIndex={maxReachedIndex}
            onGoTo={goToStep}
            testIdPrefix="wizard-progress-dot"
            label="Wizard steps"
          />
        )

  return (
    <ContributionProvider>
      <WizardShell
        currentIndex={currentIndex}
        maxReachedIndex={maxReachedIndex}
        onGoToStep={goToStep}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={canGoBack}
        canGoNext={canAdvance}
        hideNext={hideNext}
        nextLabel={isExtendStep ? 'Finish' : 'Next'}
        navCenter={navCenter}
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

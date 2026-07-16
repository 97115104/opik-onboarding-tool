export type SlideDeckNav = {
  canPrevSlide: boolean
  canNextSlide: boolean
  /** True when the deck is showing its final slide (distinct from canNextSlide=false on doc gates). */
  atLastSlide: boolean
  prevSlide: () => void
  nextSlide: () => void
}

type Listener = () => void

const decks = new Map<string, SlideDeckNav>()
const listeners = new Set<Listener>()

let snapshot: SlideDeckNav | null = null
let activeStepId: string | null = null

function emit() {
  for (const listener of listeners) listener()
}

function syncSnapshot() {
  snapshot = activeStepId ? (decks.get(activeStepId) ?? null) : null
}

export function registerSlideDeck(stepId: string, nav: SlideDeckNav): () => void {
  decks.set(stepId, nav)
  if (activeStepId === stepId) {
    syncSnapshot()
    emit()
  }
  return () => {
    decks.delete(stepId)
    if (activeStepId === stepId) {
      syncSnapshot()
      emit()
    }
  }
}

export function setActiveSlideDeckStep(stepId: string | null) {
  if (activeStepId === stepId) return
  activeStepId = stepId
  syncSnapshot()
  emit()
}

export function getSlideDeckSnapshot(): SlideDeckNav | null {
  return snapshot
}

export function subscribeSlideDeck(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

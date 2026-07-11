export type WizardGateId = 'overview' | 'graph' | 'tour'

type Listener = () => void

const gates: Record<WizardGateId, boolean> = {
  overview: false,
  graph: false,
  tour: false,
}

/** Cached snapshot for useSyncExternalStore (must be referentially stable). */
let gatesSnapshot: Record<WizardGateId, boolean> = { ...gates }

/** Persisted across step remounts so Back does not wipe gated progress. */
export type OverviewProgress = {
  slideIndex: number
  reachedLast: boolean
}

export type TourProgress = {
  done: Record<string, boolean>
  revealedCount: number
}

let overviewProgress: OverviewProgress = { slideIndex: 0, reachedLast: false }
let graphReviewedIds: string[] = []
let tourProgress: TourProgress = { done: {}, revealedCount: 1 }

const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

function syncGate(id: WizardGateId, complete: boolean) {
  if (gates[id] === complete) return
  gates[id] = complete
  gatesSnapshot = { ...gates }
  emit()
}

export function getWizardGate(id: WizardGateId): boolean {
  return gates[id]
}

export function getWizardGatesSnapshot(): Record<WizardGateId, boolean> {
  return gatesSnapshot
}

export function subscribeWizardGates(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getOverviewProgress(): OverviewProgress {
  return { ...overviewProgress }
}

export function setOverviewProgress(next: OverviewProgress) {
  overviewProgress = { ...next }
  syncGate('overview', overviewProgress.reachedLast)
}

export function getGraphReviewedIds(): string[] {
  return [...graphReviewedIds]
}

export function setGraphReviewedIds(ids: Iterable<string>, totalNodes: number) {
  graphReviewedIds = [...new Set(ids)]
  syncGate('graph', totalNodes > 0 && graphReviewedIds.length >= totalNodes)
}

export function getTourProgress(): TourProgress {
  return {
    done: { ...tourProgress.done },
    revealedCount: tourProgress.revealedCount,
  }
}

export function setTourProgress(
  done: Record<string, boolean>,
  itemIds: string[],
  revealedCount: number,
) {
  tourProgress = { done: { ...done }, revealedCount }
  syncGate('tour', itemIds.length > 0 && itemIds.every((id) => Boolean(done[id])))
}

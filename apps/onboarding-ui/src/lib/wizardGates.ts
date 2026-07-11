export type WizardGateId =
  | 'overview'
  | 'graph'
  | 'tour'
  | 'contributingOverview'
  | 'verify'

type Listener = () => void

const gates: Record<WizardGateId, boolean> = {
  overview: false,
  graph: false,
  tour: false,
  contributingOverview: false,
  verify: false,
}

/** Cached snapshot for useSyncExternalStore (must be referentially stable). */
let gatesSnapshot: Record<WizardGateId, boolean> = { ...gates }

/** Persisted across step remounts so Back does not wipe gated progress. */
export type OverviewProgress = {
  slideIndex: number
  reachedLast: boolean
}

export type ContributingOverviewProgress = {
  slideIndex: number
  reachedLast: boolean
}

export type TourProgress = {
  done: Record<string, boolean>
  revealedCount: number
}

export type VerifyProgress = {
  done: Record<string, boolean>
}

let overviewProgress: OverviewProgress = { slideIndex: 0, reachedLast: false }
let contributingOverviewProgress: ContributingOverviewProgress = {
  slideIndex: 0,
  reachedLast: false,
}
let graphReviewedIds: string[] = []
let tourProgress: TourProgress = { done: {}, revealedCount: 1 }
let verifyProgress: VerifyProgress = { done: {} }

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

export function getContributingOverviewProgress(): ContributingOverviewProgress {
  return { ...contributingOverviewProgress }
}

export function setContributingOverviewProgress(next: ContributingOverviewProgress) {
  contributingOverviewProgress = { ...next }
  syncGate('contributingOverview', contributingOverviewProgress.reachedLast)
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

export function getVerifyProgress(): VerifyProgress {
  return { done: { ...verifyProgress.done } }
}

export function setVerifyProgress(done: Record<string, boolean>, itemIds: string[]) {
  verifyProgress = { done: { ...done } }
  syncGate('verify', itemIds.length > 0 && itemIds.every((id) => Boolean(done[id])))
}

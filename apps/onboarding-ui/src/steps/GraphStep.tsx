import { useEffect, useMemo, useState } from 'react'
import graphData from '@content/knowledge-graph.json'
import { Modal } from '../components/Modal'
import { LearnMoreLink } from '../components/LearnMoreLink'
import { StepPanel } from '../components/StepPanel'
import { getGraphReviewedIds, setGraphReviewedIds } from '../lib/wizardGates'
import type { KnowledgeGraph } from '../types'

const graph = graphData as KnowledgeGraph

export function GraphStep() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(
    () => new Set(getGraphReviewedIds()),
  )

  const nodeIds = useMemo(() => graph.nodes.map((node) => node.id), [])
  const nextUnlockIndex = reviewedIds.size
  const allReviewed = reviewedIds.size >= nodeIds.length

  useEffect(() => {
    setGraphReviewedIds(reviewedIds, nodeIds.length)
  }, [reviewedIds, nodeIds.length])

  const selectedNode = useMemo(
    () => (selectedId ? (graph.nodes.find((node) => node.id === selectedId) ?? null) : null),
    [selectedId],
  )

  const relatedEdges = useMemo(
    () =>
      selectedId
        ? graph.edges.filter(
            (edge) => edge.source === selectedId || edge.target === selectedId,
          )
        : [],
    [selectedId],
  )

  function markReviewed(id: string) {
    setReviewedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  function isUnlocked(index: number) {
    return index <= nextUnlockIndex
  }

  function openNode(id: string, markPrevious = false) {
    const index = nodeIds.indexOf(id)
    if (index < 0 || !isUnlocked(index)) return
    if (markPrevious && selectedId && selectedId !== id) {
      markReviewed(selectedId)
    }
    setSelectedId(id)
    setModalOpen(true)
  }

  function closeModal() {
    if (selectedId) markReviewed(selectedId)
    setModalOpen(false)
  }

  return (
    <StepPanel testId="step-graph" title={graph.title}>
      <p
        data-testid="graph-empty-hint"
        className={`mb-4 text-sm text-slate-500 ${reviewedIds.size > 0 ? 'sr-only' : ''}`}
      >
        Open each feature in order to unlock the next
      </p>

      <p className="mb-4 text-sm text-slate-500" data-testid="graph-progress">
        {reviewedIds.size} of {nodeIds.length} features reviewed
        {allReviewed ? ' (complete)' : ''}
      </p>
      <div className="mb-4">
        <LearnMoreLink href="https://www.comet.com/docs/opik/v1/opik-university/overview">
          Explore Opik University
        </LearnMoreLink>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {graph.nodes.map((node, index) => {
          const reviewed = reviewedIds.has(node.id)
          const unlocked = isUnlocked(index)
          const current = unlocked && !reviewed && index === nextUnlockIndex
          const active = node.id === selectedId && modalOpen

          return (
            <li key={node.id} className="h-full">
              <button
                type="button"
                data-testid={`graph-node-${node.id}`}
                data-graph-state={reviewed ? 'reviewed' : current ? 'current' : unlocked ? 'unlocked' : 'locked'}
                disabled={!unlocked}
                onClick={() => openNode(node.id)}
                className={`flex h-full min-h-[7.5rem] w-full flex-col rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  !unlocked
                    ? 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400 opacity-55'
                    : active || current
                      ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-white text-slate-900'
                      : reviewed
                        ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-white text-slate-900'
                        : 'border-[var(--color-border)] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <span className="font-medium">{node.label}</span>
                <span className="mt-1 block flex-1 text-xs text-slate-500">
                  {!unlocked ? 'Locked until you review the previous feature' : node.summary}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <Modal
        open={modalOpen && selectedNode !== null}
        title={selectedNode?.label ?? ''}
        onClose={closeModal}
        testId="graph-detail-modal"
      >
        {selectedNode ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-600">{selectedNode.details}</p>

            {selectedNode.links.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Learn more</p>
                <ul className="space-y-1">
                  {selectedNode.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {relatedEdges.length > 0 ? (
              <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Connections</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {relatedEdges.map((edge) => {
                    const otherId = edge.source === selectedId ? edge.target : edge.source
                    const otherIndex = nodeIds.indexOf(otherId)
                    const otherUnlocked = otherIndex >= 0 && isUnlocked(otherIndex)
                    const otherLabel =
                      graph.nodes.find((n) => n.id === otherId)?.label ?? otherId

                    return (
                      <li key={`${edge.source}-${edge.target}-${edge.label}`}>
                        {edge.source === selectedId ? (
                          <>
                            {edge.label}{' '}
                            {otherUnlocked ? (
                              <button
                                type="button"
                                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                                onClick={() => openNode(edge.target, true)}
                              >
                                {otherLabel}
                              </button>
                            ) : (
                              <span className="text-slate-400">{otherLabel} (locked)</span>
                            )}
                          </>
                        ) : (
                          <>
                            {otherUnlocked ? (
                              <button
                                type="button"
                                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                                onClick={() => openNode(edge.source, true)}
                              >
                                {otherLabel}
                              </button>
                            ) : (
                              <span className="text-slate-400">{otherLabel} (locked)</span>
                            )}{' '}
                            {edge.label} this topic
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </StepPanel>
  )
}

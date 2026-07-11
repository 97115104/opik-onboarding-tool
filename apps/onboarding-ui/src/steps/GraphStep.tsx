import { useMemo, useState } from 'react'
import graphData from '@content/knowledge-graph.json'
import { Modal } from '../components/Modal'
import { StepPanel } from '../components/StepPanel'
import { personaSubtitle } from '../lib/persona'
import type { KnowledgeGraph } from '../types'

const graph = graphData as KnowledgeGraph

export function GraphStep() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  function openNode(id: string) {
    setSelectedId(id)
    setModalOpen(true)
  }

  const subtitle = personaSubtitle({
    default: graph.description,
    engineer: 'Explore how Opik pieces connect before you dig into the stack.',
    pm: 'Browse the product map in plain language. Click a topic for more detail.',
    support: 'A simple map of Opik topics you can reference while helping contributors.',
    external: 'Click topics to learn how Opik fits together before the local tour.',
  })

  return (
    <StepPanel testId="step-graph" title={graph.title} subtitle={subtitle}>
      <p
        data-testid="graph-empty-hint"
        className={`mb-4 text-sm text-slate-500 ${selectedId ? 'sr-only' : ''}`}
      >
        Select an aspect of Opik to learn more
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {graph.nodes.map((node) => {
          const active = node.id === selectedId
          return (
            <li key={node.id} className="h-full">
              <button
                type="button"
                data-testid={`graph-node-${node.id}`}
                onClick={() => openNode(node.id)}
                className={`flex h-full min-h-[7.5rem] w-full flex-col rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? 'border-slate-900 ring-1 ring-slate-900 bg-white text-slate-900'
                    : 'border-[var(--color-border)] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <span className="font-medium">{node.label}</span>
                <span className="mt-1 block flex-1 text-xs text-slate-500">{node.summary}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <Modal
        open={modalOpen && selectedNode !== null}
        title={selectedNode?.label ?? ''}
        onClose={() => setModalOpen(false)}
        testId="graph-detail-modal"
      >
        {selectedNode ? (
          <div className="space-y-4">
            {selectedNode.detailBullets && selectedNode.detailBullets.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                {selectedNode.detailBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600">{selectedNode.details}</p>
            )}

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
                  {relatedEdges.map((edge) => (
                    <li key={`${edge.source}-${edge.target}-${edge.label}`}>
                      {edge.source === selectedId ? (
                        <>
                          {edge.label}{' '}
                          <button
                            type="button"
                            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                            onClick={() => openNode(edge.target)}
                          >
                            {graph.nodes.find((n) => n.id === edge.target)?.label ?? edge.target}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                            onClick={() => openNode(edge.source)}
                          >
                            {graph.nodes.find((n) => n.id === edge.source)?.label ?? edge.source}
                          </button>{' '}
                          {edge.label} this topic
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </StepPanel>
  )
}

import { useMemo, useState } from 'react'
import graphData from '@content/knowledge-graph.json'
import { StepPanel } from '../components/StepPanel'
import type { KnowledgeGraph } from '../types'

const graph = graphData as KnowledgeGraph

export function GraphStep() {
  const [selectedId, setSelectedId] = useState(graph.rootId)

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0],
    [selectedId],
  )

  const relatedEdges = useMemo(
    () =>
      graph.edges.filter(
        (edge) => edge.source === selectedId || edge.target === selectedId,
      ),
    [selectedId],
  )

  return (
    <StepPanel
      testId="step-graph"
      title={graph.title}
      subtitle={graph.description}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {graph.nodes.map((node) => {
            const active = node.id === selectedId
            return (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? 'border-sky-400/50 bg-sky-400/10 text-sky-100'
                      : 'border-[var(--color-border)] bg-slate-900/35 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="font-medium">{node.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{node.summary}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {selectedNode ? (
          <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-slate-950/40 p-5">
            <h3 className="font-display text-2xl text-slate-50">{selectedNode.label}</h3>
            <p className="text-sm leading-relaxed text-slate-300">{selectedNode.details}</p>

            {selectedNode.links.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Learn more</p>
                <ul className="space-y-1">
                  {selectedNode.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-sky-300 underline decoration-sky-400/30 underline-offset-4 hover:text-sky-200"
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
                <ul className="space-y-1 text-sm text-slate-400">
                  {relatedEdges.map((edge) => (
                    <li key={`${edge.source}-${edge.target}-${edge.label}`}>
                      {edge.source === selectedId ? (
                        <>
                          {edge.label}{' '}
                          <button
                            type="button"
                            className="text-sky-300 hover:text-sky-200"
                            onClick={() => setSelectedId(edge.target)}
                          >
                            {graph.nodes.find((n) => n.id === edge.target)?.label ?? edge.target}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="text-sky-300 hover:text-sky-200"
                            onClick={() => setSelectedId(edge.source)}
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
      </div>
    </StepPanel>
  )
}

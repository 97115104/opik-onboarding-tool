import { useCallback, useState } from 'react'
import { LearnMoreLink } from '../components/LearnMoreLink'
import { StepPanel } from '../components/StepPanel'

const SDK_SNIPPET = `bun add opik

import { Opik } from 'opik'

const opik = new Opik({ projectName: 'my-app' })`

export function AddingOpikStep() {
  const [copied, setCopied] = useState(false)

  const copySnippet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SDK_SNIPPET)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied in non-secure or embedded contexts.
    }
  }, [])

  return (
    <StepPanel
      testId="step-adding-opik"
      title="Add Opik to an app"
      subtitle="Instrument one request path first, then build from the trace data you collect."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-slate-900">Install and initialize the SDK</h3>
              <button
                type="button"
                data-testid="copy-sdk-snippet"
                onClick={() => void copySnippet()}
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-800"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">{SDK_SNIPPET}</pre>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900">See it in this repository</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              <code>apps/chat-demo/server/chat-handler.ts</code> creates an Opik client, opens a
              trace and span around the Ollama call, then ends them with the response.
            </p>
          </div>
        </div>

        <div className="lifecycle-flow rounded-xl border border-[var(--color-border)] bg-slate-50 p-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Request lifecycle
          </p>
          <svg viewBox="0 0 720 112" className="w-full" role="img" aria-label="App request is traced through Ollama to the local Opik UI">
            <defs>
              <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#2e8555" />
              </marker>
            </defs>
            <path className="lifecycle-path" d="M150 35 H275 M150 35 V85 H570 V55 M570 85 H445" />
            <g className="lifecycle-node">
              <rect x="16" y="15" width="134" height="40" rx="10" />
              <text x="83" y="40">App request</text>
            </g>
            <g className="lifecycle-node lifecycle-node-delay">
              <rect x="275" y="15" width="170" height="40" rx="10" />
              <text x="360" y="40">Ollama LLM</text>
            </g>
            <g className="lifecycle-node lifecycle-node-later">
              <rect x="503" y="15" width="134" height="40" rx="10" />
              <text x="570" y="40">Opik SDK</text>
            </g>
            <g className="lifecycle-node lifecycle-node-final">
              <rect x="275" y="67" width="170" height="36" rx="10" />
              <text x="360" y="90">Local Opik UI</text>
            </g>
          </svg>
          <ol
            className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600"
            data-testid="lifecycle-explanation"
          >
            <li>
              The browser sends your message to the chat-demo server (<code>POST /api/chat</code>).
              One request forks on the server: inference and observability run in parallel.
            </li>
            <li>
              Before calling the model, the server opens an Opik trace and LLM span with your
              message as input. This wraps the request and does not block the LLM call.
            </li>
            <li>The server calls Ollama and waits for the assistant reply.</li>
            <li>
              After the reply, the handler updates the span with output, token usage, and timing,
              ends the span and trace, and flushes to the Opik API.
            </li>
            <li>
              The reply returns to the browser and the trace appears in the local Opik UI under the{' '}
              <code>chat-demo</code> project (Traces tab).
            </li>
          </ol>
        </div>

        <LearnMoreLink href="https://www.comet.com/docs/opik/integrations/overview">
          Explore Opik integrations
        </LearnMoreLink>
      </div>
    </StepPanel>
  )
}

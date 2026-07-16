import { LearnMoreLink } from '../components/LearnMoreLink'
import { StepPanel } from '../components/StepPanel'

export function AddingOpikStep() {
  return (
    <StepPanel
      testId="step-adding-opik"
      title="Add Opik to an app"
      subtitle="Instrument one request path first, then build from the trace data you collect."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900">Install and initialize the SDK</h3>
            <pre className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">{`bun add opik

import { Opik } from 'opik'

const opik = new Opik({ projectName: 'my-app' })`}</pre>
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
              <rect x="570" y="15" width="134" height="40" rx="10" />
              <text x="637" y="40">Opik SDK</text>
            </g>
            <g className="lifecycle-node lifecycle-node-final">
              <rect x="275" y="67" width="170" height="36" rx="10" />
              <text x="360" y="90">Local Opik UI</text>
            </g>
          </svg>
        </div>

        <LearnMoreLink href="https://www.comet.com/docs/opik/integrations/overview">
          Explore Opik integrations
        </LearnMoreLink>
      </div>
    </StepPanel>
  )
}

import { useEffect, useState } from 'react'
import { StepPanel } from '../components/StepPanel'
import { checkStackHealth, STACK_POLL_MS } from '../lib/health'
import type { ServiceHealth } from '../types'

function statusLabel(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return 'Healthy'
    case 'unhealthy':
      return 'Unreachable'
    default:
      return 'Checking…'
  }
}

function statusClasses(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/25'
    case 'unhealthy':
      return 'bg-rose-400/15 text-rose-300 ring-rose-400/25'
    default:
      return 'bg-amber-400/15 text-amber-200 ring-amber-400/25'
  }
}

export function StackStep() {
  const [services, setServices] = useState<ServiceHealth[]>([])
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      setChecking(true)
      const results = await checkStackHealth()
      if (!cancelled) {
        setServices(results)
        setChecking(false)
      }
    }

    void poll()
    const interval = window.setInterval(() => {
      void poll()
    }, STACK_POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return (
    <StepPanel
      testId="step-stack"
      title="Local stack status"
      subtitle="Live health checks against Opik, Ollama, and the chat demo (refreshes every 5s)."
    >
      <ul className="space-y-3">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-slate-900/35 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-100">{service.name}</p>
              <p className="mt-1 font-mono text-xs text-slate-500">{service.url}</p>
              {service.detail ? (
                <p className="mt-1 text-xs text-slate-500">{service.detail}</p>
              ) : null}
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses(service.status)}`}
            >
              {statusLabel(service.status)}
            </span>
          </li>
        ))}
      </ul>

      {checking && services.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Probing services…</p>
      ) : null}
    </StepPanel>
  )
}

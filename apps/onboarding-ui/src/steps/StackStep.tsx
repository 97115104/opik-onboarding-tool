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
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'unhealthy':
      return 'bg-rose-50 text-rose-800 ring-rose-200'
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-200'
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
            className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{service.name}</p>
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

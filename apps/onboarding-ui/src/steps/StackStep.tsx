import { useEffect, useRef, useState } from 'react'
import { StepPanel } from '../components/StepPanel'
import { LearnMoreLink } from '../components/LearnMoreLink'
import {
  checkStackHealth,
  healService,
  serviceBlurb,
  STACK_POLL_MS,
  STACK_SERVICES,
  type HealthServiceId,
} from '../lib/health'
import type { ServiceHealth } from '../types'

type HealState = 'idle' | 'healing' | 'needs-fix' | 'failed'

/** Opik UI + API share one restart script; coalesce client-side too. */
function healGroup(id: HealthServiceId): string {
  if (id === 'opik-ui' || id === 'opik-api') return 'opik'
  return id
}

function initialServices(): ServiceHealth[] {
  return STACK_SERVICES.map((service) => ({
    id: service.id,
    name: service.name,
    url: service.url,
    status: 'checking' as const,
  }))
}

function statusLabel(status: ServiceHealth['status'], heal: HealState) {
  if (heal === 'healing') return 'Starting again…'
  if (heal === 'needs-fix' || heal === 'failed') return 'Still not ready'
  switch (status) {
    case 'healthy':
      return 'Ready'
    case 'unhealthy':
      return 'Not ready'
    default:
      return 'Checking…'
  }
}

function statusClasses(status: ServiceHealth['status'], heal: HealState) {
  if (heal === 'healing') return 'bg-amber-50 text-amber-800 ring-amber-200'
  if (heal === 'needs-fix' || heal === 'failed') return 'bg-rose-50 text-rose-800 ring-rose-200'
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
  const [services, setServices] = useState<ServiceHealth[]>(initialServices)
  const [checking, setChecking] = useState(true)
  const [healStates, setHealStates] = useState<Partial<Record<HealthServiceId, HealState>>>({})
  const autoHealedGroups = useRef<Set<string>>(new Set())
  const pollInFlight = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function applyHeal(ids: HealthServiceId[]) {
      const primary = ids[0]
      if (!primary) return
      for (const id of ids) {
        setHealStates((prev) => ({ ...prev, [id]: 'healing' }))
      }
      const healResult = await healService(primary)
      if (cancelled) return
      if (!healResult.ok) {
        for (const id of ids) {
          setHealStates((prev) => ({ ...prev, [id]: 'failed' }))
        }
        return
      }
      // Opik/Ollama can take well over a few seconds; keep "Starting again…" longer.
      await new Promise((r) => setTimeout(r, 8000))
      if (cancelled) return
      const refreshed = await checkStackHealth()
      if (cancelled) return
      setServices(refreshed)
      for (const id of ids) {
        const stillDown = refreshed.find((s) => s.id === id)?.status !== 'healthy'
        setHealStates((prev) => ({
          ...prev,
          [id]: stillDown ? 'needs-fix' : 'idle',
        }))
      }
    }

    async function poll() {
      if (pollInFlight.current) return
      pollInFlight.current = true
      setChecking(true)
      try {
        const results = await checkStackHealth()
        if (cancelled) return

        setServices(results)
        setChecking(false)

        const unhealthyOpik: HealthServiceId[] = []
        for (const service of results) {
          const id = service.id as HealthServiceId
          if (service.status === 'healthy') {
            setHealStates((prev) => {
              if (!prev[id] || prev[id] === 'idle' || prev[id] === 'healing') {
                // Do not clear healing mid-flight from a concurrent poll.
                if (prev[id] === 'healing') return prev
                return prev[id] ? { ...prev, [id]: 'idle' } : prev
              }
              return { ...prev, [id]: 'idle' }
            })
            continue
          }

          if (service.status !== 'unhealthy') continue
          if (id === 'opik-ui' || id === 'opik-api') {
            unhealthyOpik.push(id)
            continue
          }

          const group = healGroup(id)
          if (!autoHealedGroups.current.has(group)) {
            autoHealedGroups.current.add(group)
            void applyHeal([id])
          }
        }

        if (unhealthyOpik.length > 0 && !autoHealedGroups.current.has('opik')) {
          autoHealedGroups.current.add('opik')
          void applyHeal(unhealthyOpik)
        }
      } finally {
        pollInFlight.current = false
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

  async function onFix(serviceId: HealthServiceId) {
    const group = healGroup(serviceId)
    const ids =
      group === 'opik'
        ? (['opik-ui', 'opik-api'] as HealthServiceId[])
        : [serviceId]

    for (const id of ids) {
      setHealStates((prev) => ({ ...prev, [id]: 'healing' }))
    }
    const result = await healService(serviceId)
    if (!result.ok) {
      for (const id of ids) {
        setHealStates((prev) => ({ ...prev, [id]: 'failed' }))
      }
      return
    }
    await new Promise((r) => setTimeout(r, 8000))
    const refreshed = await checkStackHealth()
    setServices(refreshed)
    for (const id of ids) {
      const stillDown = refreshed.find((s) => s.id === id)?.status !== 'healthy'
      setHealStates((prev) => ({
        ...prev,
        [id]: stillDown ? 'needs-fix' : 'idle',
      }))
    }
  }

  return (
    <StepPanel
      testId="step-stack"
      title="Local stack status"
      subtitle="Live checks for Opik, Ollama, and the chat demo. Unready services try to restart on their own."
    >
      <ul className="space-y-3">
        {services.map((service) => {
          const id = service.id as HealthServiceId
          const heal = healStates[id] ?? 'idle'
          const showFix = service.status === 'unhealthy' && (heal === 'needs-fix' || heal === 'failed')

          return (
            <li
              key={service.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{service.name}</p>
                <p className="mt-1 text-sm text-slate-600">{serviceBlurb(service.id)}</p>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`stack-url-${service.id}`}
                  className="mt-1 inline-block text-sm text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  {service.url}
                </a>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses(service.status, heal)}`}
                >
                  {statusLabel(service.status, heal)}
                </span>
                {showFix ? (
                  <button
                    type="button"
                    data-testid={`stack-fix-${service.id}`}
                    onClick={() => void onFix(id)}
                    className="btn-primary px-3 py-1.5 text-xs font-medium"
                  >
                    Fix this
                  </button>
                ) : null}
                {heal === 'needs-fix' || heal === 'failed' ? (
                  <p className="text-xs text-slate-500">Still not ready. Click Fix this.</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {checking ? <p className="mt-4 text-sm text-slate-500">Checking services…</p> : null}
      <div className="mt-4">
        <LearnMoreLink href="https://www.comet.com/docs/opik/self-host/local_deployment">
          Read the local deployment guide
        </LearnMoreLink>
      </div>
    </StepPanel>
  )
}

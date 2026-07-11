import type { ServiceHealth } from '../types'

const OPIK_FRONTEND_URL = import.meta.env.VITE_OPIK_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const OPIK_API_URL = import.meta.env.VITE_OPIK_API_URL ?? 'http://127.0.0.1:5173/api'
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? 'http://127.0.0.1:11434'
const CHAT_DEMO_URL = import.meta.env.VITE_CHAT_DEMO_URL ?? 'http://127.0.0.1:4311'

export type HealthServiceId = 'opik-ui' | 'opik-api' | 'ollama' | 'chat-demo'

const SERVICE_BLURBS: Record<HealthServiceId, string> = {
  'opik-ui': 'The Opik dashboard where you browse traces and projects.',
  'opik-api': 'The backend that stores traces and powers the dashboard.',
  ollama: 'The local model runner used by the chat demo.',
  'chat-demo': 'A small chat app that sends traces into Opik so you can practice.',
}

async function probeViaProxy(serviceId: HealthServiceId): Promise<{ ok: boolean; detail: string }> {
  try {
    const response = await fetch(`/api/health/${serviceId}`)
    const data = (await response.json()) as { ok?: boolean; detail?: string; status?: number }
    const ok = Boolean(data.ok)
    return {
      ok,
      detail: data.detail ?? (ok ? `${data.status ?? response.status} OK` : 'Unreachable'),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unreachable'
    return { ok: false, detail: message }
  }
}

export const STACK_SERVICES = [
  {
    id: 'opik-ui' as const,
    name: 'Opik UI',
    url: OPIK_FRONTEND_URL,
    blurb: SERVICE_BLURBS['opik-ui'],
    probe: () => probeViaProxy('opik-ui'),
  },
  {
    id: 'opik-api' as const,
    name: 'Opik API',
    url: OPIK_API_URL,
    blurb: SERVICE_BLURBS['opik-api'],
    probe: () => probeViaProxy('opik-api'),
  },
  {
    id: 'ollama' as const,
    name: 'Ollama',
    url: OLLAMA_URL,
    blurb: SERVICE_BLURBS.ollama,
    probe: () => probeViaProxy('ollama'),
  },
  {
    id: 'chat-demo' as const,
    name: 'Chat demo',
    url: CHAT_DEMO_URL,
    blurb: SERVICE_BLURBS['chat-demo'],
    probe: () => probeViaProxy('chat-demo'),
  },
]

export async function checkStackHealth(): Promise<ServiceHealth[]> {
  const results = await Promise.all(
    STACK_SERVICES.map(async (service) => {
      const result = await service.probe()
      return {
        id: service.id,
        name: service.name,
        url: service.url,
        status: result.ok ? ('healthy' as const) : ('unhealthy' as const),
        detail: result.detail,
      }
    }),
  )
  return results
}

export async function healService(serviceId: HealthServiceId): Promise<{ ok: boolean; detail: string }> {
  try {
    const response = await fetch(`/api/heal/${serviceId}`, { method: 'POST' })
    const data = (await response.json()) as { ok?: boolean; detail?: string }
    return {
      ok: Boolean(data.ok) && response.ok,
      detail: data.detail ?? (response.ok ? 'Heal started' : 'Heal failed'),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Heal failed'
    return { ok: false, detail: message }
  }
}

export function serviceBlurb(serviceId: string): string {
  if (serviceId in SERVICE_BLURBS) {
    return SERVICE_BLURBS[serviceId as HealthServiceId]
  }
  return 'A local service used by this onboarding stack.'
}

export const STACK_POLL_MS = 5000

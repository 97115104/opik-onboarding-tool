import type { ServiceHealth } from '../types'

const OPIK_FRONTEND_URL = import.meta.env.VITE_OPIK_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const OPIK_API_URL = import.meta.env.VITE_OPIK_API_URL ?? 'http://127.0.0.1:5173/api'
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? 'http://127.0.0.1:11434'
const CHAT_DEMO_URL = import.meta.env.VITE_CHAT_DEMO_URL ?? 'http://127.0.0.1:4311'

type HealthServiceId = 'opik-ui' | 'opik-api' | 'ollama' | 'chat-demo'

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
    probe: () => probeViaProxy('opik-ui'),
  },
  {
    id: 'opik-api' as const,
    name: 'Opik API',
    url: OPIK_API_URL,
    probe: () => probeViaProxy('opik-api'),
  },
  {
    id: 'ollama' as const,
    name: 'Ollama',
    url: OLLAMA_URL,
    probe: () => probeViaProxy('ollama'),
  },
  {
    id: 'chat-demo' as const,
    name: 'Chat demo',
    url: CHAT_DEMO_URL,
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

export const STACK_POLL_MS = 5000

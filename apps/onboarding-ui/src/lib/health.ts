import type { ServiceHealth } from '../types'

const OPIK_FRONTEND_URL = import.meta.env.VITE_OPIK_FRONTEND_URL ?? 'http://localhost:5173'
const OPIK_API_URL = import.meta.env.VITE_OPIK_API_URL ?? 'http://localhost:5173/api'
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL ?? 'http://localhost:11434'
const CHAT_DEMO_URL = import.meta.env.VITE_CHAT_DEMO_URL ?? 'http://localhost:4311'

async function probe(
  url: string,
  options?: { method?: string; ok?: (response: Response) => boolean },
): Promise<{ ok: boolean; detail: string }> {
  try {
    const response = await fetch(url, {
      method: options?.method ?? 'GET',
      mode: 'cors',
    })
    const isOk = options?.ok ? options.ok(response) : response.ok
    return {
      ok: isOk,
      detail: isOk ? `${response.status} OK` : `${response.status} ${response.statusText}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unreachable'
    return { ok: false, detail: message }
  }
}

export const STACK_SERVICES = [
  {
    id: 'opik-ui',
    name: 'Opik UI',
    url: OPIK_FRONTEND_URL,
    probe: () => probe(OPIK_FRONTEND_URL),
  },
  {
    id: 'opik-api',
    name: 'Opik API',
    url: OPIK_API_URL,
    probe: () =>
      probe(`${OPIK_API_URL}/v1/private/projects`, {
        ok: (response) => response.status === 200 || response.status === 401,
      }),
  },
  {
    id: 'ollama',
    name: 'Ollama',
    url: OLLAMA_URL,
    probe: () => probe(`${OLLAMA_URL}/api/tags`),
  },
  {
    id: 'chat-demo',
    name: 'Chat demo',
    url: CHAT_DEMO_URL,
    probe: () => probe(CHAT_DEMO_URL),
  },
] as const

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

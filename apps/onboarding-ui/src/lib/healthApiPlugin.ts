import type { Connect, Plugin } from 'vite'

type HealthService = 'opik-ui' | 'opik-api' | 'ollama' | 'chat-demo'

function serviceTargets(): Record<HealthService, string> {
  const opikUi = process.env.OPIK_FRONTEND_URL ?? 'http://127.0.0.1:5173'
  const opikApi = process.env.OPIK_API_URL ?? 'http://127.0.0.1:5173/api'
  const ollama = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434'
  const chatDemo = process.env.CHAT_DEMO_URL ?? 'http://127.0.0.1:4311'

  return {
    'opik-ui': opikUi,
    'opik-api': `${opikApi.replace(/\/$/, '')}/v1/private/projects`,
    ollama: `${ollama.replace(/\/$/, '')}/api/tags`,
    'chat-demo': chatDemo,
  }
}

function isKnownService(value: string): value is HealthService {
  return value === 'opik-ui' || value === 'opik-api' || value === 'ollama' || value === 'chat-demo'
}

async function probe(url: string, service: HealthService): Promise<{ ok: boolean; status: number; detail: string }> {
  try {
    const response = await fetch(url, { method: 'GET' })
    const status = response.status
    const ok =
      service === 'opik-api' ? status === 200 || status === 401 : response.ok
    return {
      ok,
      status,
      detail: ok ? `${status} OK` : `${status} ${response.statusText || 'Error'}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unreachable'
    return { ok: false, status: 0, detail: message }
  }
}

function healthMiddleware(): Connect.NextHandleFunction {
  const targets = serviceTargets()

  return (req, res, next) => {
    const rawUrl = req.url ?? ''
    const pathOnly = rawUrl.split('?')[0] ?? ''
    const match = pathOnly.match(/^\/api\/health\/([^/]+)$/)
    if (!match) {
      next()
      return
    }

    if (req.method !== 'GET') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, status: 405, detail: 'Method not allowed' }))
      return
    }

    const service = match[1] ?? ''
    if (!isKnownService(service)) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, status: 404, detail: `Unknown service: ${service}` }))
      return
    }

    void probe(targets[service], service).then((result) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    })
  }
}

/** Same-origin health probes so the browser never CORS-fetches Opik/Ollama/chat-demo. */
export function healthApiPlugin(): Plugin {
  return {
    name: 'opik-health-api',
    configureServer(server) {
      server.middlewares.use(healthMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(healthMiddleware())
    },
  }
}

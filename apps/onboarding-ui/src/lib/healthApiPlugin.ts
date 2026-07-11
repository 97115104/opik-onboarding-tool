import { spawn } from 'node:child_process'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

type HealthService = 'opik-ui' | 'opik-api' | 'ollama' | 'chat-demo'

/** Coalesce Opik UI/API heals onto one in-flight restart. */
const healInFlight = new Map<string, Promise<{ ok: boolean; detail: string }>>()

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

function healKey(service: HealthService): string {
  if (service === 'opik-ui' || service === 'opik-api') return 'opik'
  return service
}

function healCommand(service: HealthService, toolRoot: string): { cmd: string; args: string[] } {
  const scripts = path.join(toolRoot, 'scripts')
  if (service === 'opik-ui' || service === 'opik-api') {
    return { cmd: 'bash', args: [path.join(scripts, 'start-opik.sh')] }
  }
  if (service === 'chat-demo') {
    return { cmd: 'bash', args: [path.join(scripts, 'start-chat-demo.sh')] }
  }
  // Light Ollama heal: start serve if down; skip pull/smoke (those belong in ensure-ollama).
  const ollamaUrl = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434'
  return {
    cmd: 'bash',
    args: [
      '-lc',
      `curl -fsS -o /dev/null "${ollamaUrl}/api/tags" 2>/dev/null || exec ollama serve`,
    ],
  }
}

function runHeal(service: HealthService, toolRoot: string): Promise<{ ok: boolean; detail: string }> {
  const key = healKey(service)
  const existing = healInFlight.get(key)
  if (existing) return existing

  const promise = new Promise<{ ok: boolean; detail: string }>((resolve) => {
    const { cmd, args } = healCommand(service, toolRoot)
    let settled = false
    const finish = (result: { ok: boolean; detail: string }) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      env: process.env,
    })
    child.on('error', (error) => {
      finish({ ok: false, detail: error.message })
    })
    // Allow spawn errors to surface briefly before claiming success.
    setTimeout(() => {
      finish({ ok: true, detail: 'Heal started' })
    }, 50)
    child.unref()
  }).finally(() => {
    healInFlight.delete(key)
  })

  healInFlight.set(key, promise)
  return promise
}

async function probe(
  url: string,
  service: HealthService,
): Promise<{ ok: boolean; status: number; detail: string }> {
  try {
    const response = await fetch(url, { method: 'GET' })
    const status = response.status
    const ok = service === 'opik-api' ? status === 200 || status === 401 : response.ok
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

function healthMiddleware(toolRoot: string): Connect.NextHandleFunction {
  const targets = serviceTargets()

  return (req, res, next) => {
    const rawUrl = req.url ?? ''
    const pathOnly = rawUrl.split('?')[0] ?? ''

    const healMatch = pathOnly.match(/^\/api\/heal\/([^/]+)$/)
    if (healMatch) {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: false, detail: 'Method not allowed' }))
        return
      }

      const service = healMatch[1] ?? ''
      if (!isKnownService(service)) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: false, detail: `Unknown service: ${service}` }))
        return
      }

      void runHeal(service, toolRoot).then((result) => {
        res.statusCode = result.ok ? 200 : 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: result.ok, service, detail: result.detail }))
      })
      return
    }

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

/** Same-origin health probes and heal restarts so the browser never CORS-fetches Opik/Ollama/chat-demo. */
export function healthApiPlugin(toolRoot: string): Plugin {
  return {
    name: 'opik-health-api',
    configureServer(server) {
      server.middlewares.use(healthMiddleware(toolRoot))
    },
    configurePreviewServer(server) {
      server.middlewares.use(healthMiddleware(toolRoot))
    },
  }
}

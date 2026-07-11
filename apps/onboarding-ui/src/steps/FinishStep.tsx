import { useEffect, useRef } from 'react'
import { StepPanel } from '../components/StepPanel'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const COLORS = [
  '#0f172a',
  '#1e293b',
  '#334155',
  '#0ea5e9',
  '#38bdf8',
  '#14b8a6',
  '#2dd4bf',
  '#e2e8f0',
  '#f8fafc',
]

const BURST_DURATION_MS = 9000

function burst(particles: Particle[], width: number, height: number) {
  const cx = width * (0.15 + Math.random() * 0.7)
  const cy = height * (0.15 + Math.random() * 0.45)
  const count = 48 + Math.floor(Math.random() * 28)
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 1.8 + Math.random() * 4.2
    const maxLife = 1.4 + Math.random() * 0.8
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.6,
      life: maxLife,
      maxLife,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: 1.8 + Math.random() * 3.2,
    })
  }
}

function fillAtmosphere(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#e0f2fe')
  gradient.addColorStop(0.45, '#f0fdfa')
  gradient.addColorStop(1, '#f8fafc')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function FinishStep() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const particles: Particle[] = []
    let lastBurst = 0
    const startedAt = performance.now()
    let lastTick = startedAt

    const resize = () => {
      const parent = canvas.parentElement
      const width = parent?.clientWidth ?? 640
      const height = 280
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)
    burst(particles, canvas.clientWidth, canvas.clientHeight)
    burst(particles, canvas.clientWidth, canvas.clientHeight)

    const tick = (time: number) => {
      if (!running) return
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      fillAtmosphere(ctx, width, height)

      const elapsed = time - startedAt
      const dt = Math.min(0.05, Math.max(0.001, (time - lastTick) / 1000))
      lastTick = time

      if (elapsed < BURST_DURATION_MS && time - lastBurst > 650) {
        burst(particles, width, height)
        if (Math.random() > 0.35) burst(particles, width, height)
        lastBurst = time
      }

      // Wall-clock motion/decay so high-refresh displays stay ~8–10s.
      const lifeDecayPerSec = 0.55
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!
        p.x += p.vx * dt * 60
        p.y += p.vy * dt * 60
        p.vy += 0.038 * dt * 60
        p.life -= lifeDecayPerSec * dt
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <StepPanel
      testId="step-finish"
      title="Well done"
      subtitle="Thanks for walking the Opik contributor path."
    >
      <div className="relative space-y-6">
        <div className="relative -mx-1 overflow-hidden rounded-2xl">
          <canvas
            ref={canvasRef}
            data-testid="finish-fireworks"
            className="block w-full"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent"
            aria-hidden
          />
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          You are ready to keep exploring Opik and ship your contribution. Star the project, open an
          issue, or reach out if you get stuck.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/comet-ml/opik"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="finish-opik-github"
            className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Opik on GitHub
          </a>
          <a
            href="mailto:support@97115104.com"
            data-testid="finish-support-email"
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-800 hover:border-slate-400"
          >
            Email support@97115104.com
          </a>
        </div>
      </div>
    </StepPanel>
  )
}

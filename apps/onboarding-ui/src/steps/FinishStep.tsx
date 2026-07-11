import { useEffect, useRef } from 'react'
import { StepPanel } from '../components/StepPanel'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#e2e8f0', '#38bdf8']

function burst(particles: Particle[], width: number, height: number) {
  const cx = width * (0.25 + Math.random() * 0.5)
  const cy = height * (0.2 + Math.random() * 0.35)
  const count = 28 + Math.floor(Math.random() * 18)
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const speed = 1.5 + Math.random() * 3.5
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: 1.5 + Math.random() * 2.5,
    })
  }
}

export function FinishStep() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf = 0
    let running = true
    const particles: Particle[] = []
    let lastBurst = 0

    const resize = () => {
      const parent = canvas.parentElement
      const width = parent?.clientWidth ?? 640
      const height = 220
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

    const tick = (time: number) => {
      if (!running) return
      frame += 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      if (time - lastBurst > 900 && frame < 180) {
        burst(particles, width, height)
        lastBurst = time
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.045
        p.life -= 0.012
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = Math.max(0, p.life)
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
      title="You made it"
      subtitle="Thanks for walking the Opik contributor path."
    >
      <div className="space-y-6">
        <canvas
          ref={canvasRef}
          data-testid="finish-fireworks"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-slate-50 to-white"
          aria-hidden
        />

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

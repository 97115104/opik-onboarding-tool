import type { ReactNode } from 'react'

interface StepPanelProps {
  testId: string
  title: string
  subtitle?: string
  children: ReactNode
}

export function StepPanel({ testId, title, subtitle, children }: StepPanelProps) {
  return (
    <section data-testid={testId} className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight text-slate-950 md:text-4xl">{title}</h2>
        {subtitle ? <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-8">
        {children}
      </div>
    </section>
  )
}

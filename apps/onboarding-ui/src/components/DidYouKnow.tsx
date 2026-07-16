interface DidYouKnowProps {
  body: string
  title?: string
}

/** Plain-language aside for non-technical terms on walkthrough slides. */
export function DidYouKnow({ body, title = 'Did you know' }: DidYouKnowProps) {
  return (
    <aside
      data-testid="slide-did-you-know"
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{body}</p>
    </aside>
  )
}

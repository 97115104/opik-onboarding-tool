import { useEffect, useRef, useState } from 'react'
import { Markdown } from './Markdown'

type AgreeDocumentPanelProps = {
  markdown: string
  docName: string
  githubHref: string
  agreed: boolean
  onAgreedChange: (agreed: boolean) => void
  testIdPrefix: string
}

/** Scrollable markdown reader; checkbox unlocks after scrolling to the bottom. */
export function AgreeDocumentPanel({
  markdown,
  docName,
  githubHref,
  agreed,
  onAgreedChange,
  testIdPrefix,
}: AgreeDocumentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(agreed)

  useEffect(() => {
    if (agreed) setScrolledToBottom(true)
  }, [agreed])

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const markIfAtBottom = () => {
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 4
      if (atBottom) setScrolledToBottom(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setScrolledToBottom(true)
      },
      { root, threshold: 0.9 },
    )
    observer.observe(sentinel)
    root.addEventListener('scroll', markIfAtBottom, { passive: true })
    markIfAtBottom()
    return () => {
      observer.disconnect()
      root.removeEventListener('scroll', markIfAtBottom)
    }
  }, [markdown])

  const checkboxId = `${testIdPrefix}-agree-input`

  return (
    <div className="space-y-3" data-testid={`${testIdPrefix}-panel`}>
      <div
        ref={scrollRef}
        data-testid={`${testIdPrefix}-document`}
        className="markdown-body max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700"
      >
        <Markdown>{markdown}</Markdown>
        <div ref={sentinelRef} data-testid={`${testIdPrefix}-sentinel`} className="h-px" aria-hidden />
      </div>

      <p className="text-xs text-slate-500">
        Open on{' '}
        <a
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
        >
          GitHub
        </a>{' '}
        for the canonical file. Agreeing here prepares you for onboarding; GitHub&apos;s CLA bot still
        applies when you open a pull request.
      </p>

      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
          scrolledToBottom
            ? 'border-[var(--color-border)] bg-white'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
        }`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          data-testid={`${testIdPrefix}-agree`}
          checked={agreed}
          disabled={!scrolledToBottom}
          onChange={(event) => {
            const checked = event.target.checked
            if (!checked) {
              setScrolledToBottom(false)
              if (scrollRef.current) scrollRef.current.scrollTop = 0
            }
            onAgreedChange(checked)
          }}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--color-accent)] disabled:cursor-not-allowed"
        />
        <span className="text-sm text-slate-700">
          I have read and agree to the {docName}.
        </span>
      </label>
    </div>
  )
}

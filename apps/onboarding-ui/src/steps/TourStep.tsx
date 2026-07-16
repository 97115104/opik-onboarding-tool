import { useEffect, useMemo, useState } from 'react'
import { StepPanel } from '../components/StepPanel'
import { LearnMoreLink } from '../components/LearnMoreLink'
import { opikProjectRedirectUrl, OPIK_TOUR_PROJECT_NAME } from '../lib/opikUrls'
import { personaSubtitle } from '../lib/persona'
import { getTourProgress, setTourProgress } from '../lib/wizardGates'

const CHAT_URL = import.meta.env.VITE_CHAT_DEMO_URL ?? 'http://127.0.0.1:4311'

type TourItem = {
  id: string
  title: string
  instruction: string
  hint?: string
  cta?: { label: string; href: string; testId: string }
}

const TOUR_ITEMS: TourItem[] = [
  {
    id: 'open-opik',
    title: 'Open the Opik dashboard',
    instruction: 'Open Opik in a new tab. You should see your local projects and a place to browse traces.',
    cta: {
      label: 'Open Opik UI',
      href: opikProjectRedirectUrl(OPIK_TOUR_PROJECT_NAME),
      testId: 'tour-open-opik',
    },
  },
  {
    id: 'send-chat',
    title: 'Send a chat demo message',
    instruction: 'Open the chat demo and send a short message, such as "What is Opik?". Wait for a reply.',
    cta: { label: 'Open chat demo', href: CHAT_URL, testId: 'tour-open-chat' },
  },
  {
    id: 'find-trace',
    title: 'Open the trace and check Metadata and Token usage',
    instruction:
      'Back in Opik, open Traces and click the newest row from the chat demo. In the trace view, check Metadata and Token usage. Duration is a useful secondary signal for how long the request took.',
    hint: 'A new row means your app sent work to Opik. Metadata and Token usage show what ran and how much it cost; duration shows speed.',
    cta: {
      label: 'Open traces',
      href: opikProjectRedirectUrl(OPIK_TOUR_PROJECT_NAME),
      testId: 'tour-open-traces',
    },
  },
]

const TOUR_IDS = TOUR_ITEMS.map((item) => item.id)

export function TourStep() {
  const saved = getTourProgress()
  const [done, setDone] = useState<Record<string, boolean>>(() => saved.done)
  const [revealedCount, setRevealedCount] = useState(() => saved.revealedCount)
  const [tracesUrl, setTracesUrl] = useState(() => opikProjectRedirectUrl(OPIK_TOUR_PROJECT_NAME))

  useEffect(() => {
    setTourProgress(done, TOUR_IDS, revealedCount)
  }, [done, revealedCount])

  useEffect(() => {
    // Resolve after the traces step is revealed; poll until chat-demo exists.
    if (revealedCount < TOUR_ITEMS.length) return

    const controller = new AbortController()
    let pollTimer: ReturnType<typeof setTimeout> | undefined

    async function resolveTracesUrl(): Promise<boolean> {
      try {
        const response = await fetch(
          `/api/opik/project-url?project_name=${encodeURIComponent(OPIK_TOUR_PROJECT_NAME)}&destination=logs`,
          { signal: controller.signal },
        )
        if (!response.ok) return false
        const result = (await response.json()) as { found?: boolean; url?: unknown }
        if (typeof result.url === 'string') setTracesUrl(result.url)
        return result.found === true
      } catch {
        return false
      }
    }

    void (async () => {
      const found = await resolveTracesUrl()
      if (found || controller.signal.aborted) return

      const poll = async () => {
        const resolved = await resolveTracesUrl()
        if (!resolved && !controller.signal.aborted) {
          pollTimer = setTimeout(() => {
            void poll()
          }, 3000)
        }
      }
      pollTimer = setTimeout(() => {
        void poll()
      }, 3000)
    })()

    return () => {
      controller.abort()
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, [revealedCount])

  const subtitle = personaSubtitle({
    default: 'Hands-on walkthrough.',
    engineer: 'Confirm traces land before the quiz and issue pick.',
    pm: 'Hands-on walkthrough.',
    support: 'See what a healthy local setup looks like so you can help others.',
    external: 'Try the local stack once, then continue to the quiz.',
  })

  const visibleItems = useMemo(
    () => TOUR_ITEMS.slice(0, revealedCount),
    [revealedCount],
  )

  const completedCount = TOUR_ITEMS.filter((item) => done[item.id]).length

  function markDone(id: string) {
    setDone((prev) => {
      if (prev[id]) return prev
      return { ...prev, [id]: true }
    })
    const index = TOUR_ITEMS.findIndex((item) => item.id === id)
    if (index >= 0) {
      setRevealedCount((count) => Math.max(count, Math.min(TOUR_ITEMS.length, index + 2)))
    }
  }

  function onCtaClick(id: string) {
    markDone(id)
  }

  return (
    <StepPanel testId="step-tour" title="Try Opik" subtitle={subtitle}>
      <p className="mb-4 text-sm text-slate-500" data-testid="tour-progress">
        {completedCount} of {TOUR_ITEMS.length} steps done
      </p>

      <ol className="space-y-4" data-testid="tour-checklist">
        {visibleItems.map((item, index) => (
          <li
            key={item.id}
            data-testid={`tour-item-${item.id}`}
            className="rounded-xl border border-[var(--color-border)] bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <input
                id={`tour-check-${item.id}`}
                type="checkbox"
                data-testid={`tour-check-${item.id}`}
                checked={Boolean(done[item.id])}
                onChange={(event) => {
                  if (event.target.checked) markDone(item.id)
                  else setDone((prev) => ({ ...prev, [item.id]: false }))
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={`tour-check-${item.id}`} className="block text-sm font-medium text-slate-900">
                  {index + 1}. {item.title}
                </label>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.instruction}</p>
                {item.hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.hint}</p> : null}
                {item.cta ? (
                  <a
                    href={item.id === 'find-trace' ? tracesUrl : item.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={item.cta.testId}
                    onClick={() => onCtaClick(item.id)}
                    className="mt-3 inline-flex btn-primary px-3 py-1.5"
                  >
                    {item.cta.label}
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4">
        <LearnMoreLink href="https://www.comet.com/docs/opik/quickstart">
          Read the Opik quickstart
        </LearnMoreLink>
      </div>
    </StepPanel>
  )
}

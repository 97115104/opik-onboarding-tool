import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { OVERVIEW_SLIDES, type OverviewBullet } from '../content/overviewSlides'
import { DidYouKnow } from '../components/DidYouKnow'
import { StepPanel } from '../components/StepPanel'
import { getOverviewProgress, setOverviewProgress } from '../lib/wizardGates'
import { registerSlideDeck } from '../lib/slideDeckNav'

function renderBullet(bullet: OverviewBullet, index: number) {
  if (typeof bullet === 'string') {
    return <li key={bullet}>{bullet}</li>
  }
  if (bullet.href) {
    return (
      <li key={`${bullet.text}-${index}`}>
        <a
          href={bullet.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
        >
          {bullet.text}
        </a>
      </li>
    )
  }
  return <li key={bullet.text}>{bullet.text}</li>
}

export function OverviewStep() {
  const saved = getOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const total = OVERVIEW_SLIDES.length
  const slide = OVERVIEW_SLIDES[slideIndex]!
  const isLast = slideIndex === total - 1

  useEffect(() => {
    const prev = getOverviewProgress()
    setOverviewProgress({
      slideIndex,
      reachedLast: prev.reachedLast || isLast,
    })
  }, [slideIndex, isLast])

  const goPrev = useCallback(() => {
    setSlideIndex((index) => Math.max(0, index - 1))
    setExpandedRole(null)
  }, [])

  const goNext = useCallback(() => {
    setSlideIndex((index) => Math.min(total - 1, index + 1))
    setExpandedRole(null)
  }, [total])

  useLayoutEffect(() => {
    return registerSlideDeck('overview', {
      canPrevSlide: slideIndex > 0,
      canNextSlide: !isLast,
      atLastSlide: isLast,
      prevSlide: goPrev,
      nextSlide: goNext,
    })
  }, [slideIndex, isLast, goPrev, goNext])

  return (
    <StepPanel testId="step-overview" title="Product overview">
      <div className="space-y-5" data-testid="overview-slides">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Slide {slideIndex + 1} of {total}
        </p>

        <div
          key={slide.id}
          data-testid={`overview-slide-${slide.id}`}
          className="min-h-[10rem] space-y-3"
        >
          <h3 className="font-display text-2xl font-semibold text-slate-950">{slide.title}</h3>
          {slide.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}

          {slide.roles && slide.roles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {slide.roles.map((role) => {
                const expanded = expandedRole === role.id
                return (
                  <div
                    key={role.id}
                    data-testid={`overview-role-${role.id}`}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      expanded
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpandedRole(expanded ? null : role.id)}
                      className="w-full text-left"
                    >
                      <p className="font-medium text-slate-900">{role.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{role.summary}</p>
                    </button>
                    {expanded ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{role.detail}</p>
                    ) : null}
                    {expanded && role.href ? (
                      <p className="mt-2 text-sm">
                        <a
                          href={role.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                        >
                          {role.hrefLabel ?? role.href}
                        </a>
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}

          {slide.bullets && slide.bullets.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {slide.bullets.map((bullet, index) => renderBullet(bullet, index))}
            </ul>
          ) : null}

          {slide.didYouKnow ? (
            <DidYouKnow title={slide.didYouKnow.title} body={slide.didYouKnow.body} />
          ) : null}
        </div>
      </div>
    </StepPanel>
  )
}

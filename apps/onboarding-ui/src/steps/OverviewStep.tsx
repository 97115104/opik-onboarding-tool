import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  OVERVIEW_SLIDES,
  type OverviewBullet,
  type OverviewParagraph,
  type OverviewRole,
} from '../content/overviewSlides'
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

function renderParagraph(paragraph: OverviewParagraph, index: number) {
  if (typeof paragraph === 'string') {
    return (
      <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
        {paragraph}
      </p>
    )
  }

  return (
    <p key={index} className="text-sm leading-relaxed text-slate-600">
      {paragraph.map((part, partIndex) =>
        part.href ? (
          <a
            key={`${part.text}-${partIndex}`}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
          >
            {part.text}
          </a>
        ) : (
          <span key={`${part.text}-${partIndex}`}>{part.text}</span>
        ),
      )}
    </p>
  )
}

export function OverviewStep() {
  const saved = getOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
  const [selectedRole, setSelectedRole] = useState<OverviewRole | null>(null)
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
    setSelectedRole(null)
  }, [])

  const goNext = useCallback(() => {
    setSlideIndex((index) => Math.min(total - 1, index + 1))
    setSelectedRole(null)
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
          {slide.paragraphs.map(renderParagraph)}

          {slide.roles && slide.roles.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 pt-1">
              {slide.roles.map((role) => {
                const active = selectedRole?.id === role.id
                return (
                  <li key={role.id} className="h-full">
                    <div
                      className={`flex h-full min-h-[7.5rem] w-full flex-col rounded-xl border transition ${
                        active
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-white shadow-sm'
                      }`}
                    >
                      <button
                        type="button"
                        data-testid={`overview-role-${role.id}`}
                        aria-pressed={active}
                        aria-expanded={active}
                        onClick={() =>
                          setSelectedRole((current) => (current?.id === role.id ? null : role))
                        }
                        className="w-full px-4 py-3.5 text-left hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        <span className="font-medium text-slate-900">{role.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                          {role.summary}
                        </span>
                      </button>

                      {active ? (
                        <div data-testid="overview-role-detail" className="space-y-2 px-4 pb-3.5">
                          <p className="text-sm leading-relaxed text-slate-700">{role.detail}</p>
                          {role.href ? (
                            <a
                              href={role.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex text-sm text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                            >
                              {role.hrefLabel ?? role.href}
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
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

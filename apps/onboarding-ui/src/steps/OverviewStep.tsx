import { useEffect, useState } from 'react'
import { OVERVIEW_SLIDES } from '../content/overviewSlides'
import { StepPanel } from '../components/StepPanel'
import { personaSubtitle } from '../lib/persona'
import { getOverviewProgress, setOverviewProgress } from '../lib/wizardGates'

export function OverviewStep() {
  const saved = getOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
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

  const subtitle = personaSubtitle({
    default: 'A short walkthrough of Opik and this wizard.',
    engineer: 'A short product map before you touch the local stack.',
    pm: 'A plain-language look at Opik before you pick an issue.',
    support: 'A quick product briefing before you guide a contribution.',
    external: 'What Opik is, then how this wizard gets you to a first PR.',
  })

  return (
    <StepPanel testId="step-overview" title="Product overview" subtitle={subtitle}>
      <div className="space-y-5" data-testid="overview-slides">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Slide {slideIndex + 1} of {total}
        </p>

        <div
          key={slide.id}
          data-testid={`overview-slide-${slide.id}`}
          className="min-h-[10rem] space-y-3"
        >
          <h3 className="font-display text-2xl text-slate-950">{slide.title}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{slide.body}</p>
          {slide.bullets && slide.bullets.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            data-testid="overview-slide-prev"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Previous slide
          </button>
          <button
            type="button"
            data-testid="overview-slide-next"
            disabled={isLast}
            onClick={() => setSlideIndex((index) => Math.min(total - 1, index + 1))}
            className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {isLast ? 'Last slide' : 'Next slide'}
          </button>
        </div>
      </div>
    </StepPanel>
  )
}

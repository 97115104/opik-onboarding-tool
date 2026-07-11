import { useEffect, useState } from 'react'
import { CONTRIBUTING_SLIDES } from '../content/contributingSlides'
import { StepPanel } from '../components/StepPanel'
import {
  getContributingOverviewProgress,
  setContributingOverviewProgress,
} from '../lib/wizardGates'

export function ContributingOverviewStep() {
  const saved = getContributingOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
  const total = CONTRIBUTING_SLIDES.length
  const slide = CONTRIBUTING_SLIDES[slideIndex]!
  const isLast = slideIndex === total - 1

  useEffect(() => {
    const prev = getContributingOverviewProgress()
    setContributingOverviewProgress({
      slideIndex,
      reachedLast: prev.reachedLast || isLast,
    })
  }, [slideIndex, isLast])

  return (
    <StepPanel testId="step-contributing-overview" title="Contributing overview">
      <div className="space-y-5" data-testid="contributing-slides">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Slide {slideIndex + 1} of {total}
        </p>

        <div
          key={slide.id}
          data-testid={`contributing-slide-${slide.id}`}
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
            data-testid="contributing-slide-prev"
            disabled={slideIndex === 0}
            onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Previous slide
          </button>
          {!isLast ? (
            <button
              type="button"
              data-testid="contributing-slide-next"
              onClick={() => setSlideIndex((index) => Math.min(total - 1, index + 1))}
              className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
            >
              Next slide
            </button>
          ) : null}
        </div>
      </div>
    </StepPanel>
  )
}

import { useEffect, useState, type MouseEvent } from 'react'
import { CONTRIBUTING_SLIDES } from '../content/contributingSlides'
import { StepPanel } from '../components/StepPanel'
import {
  getContributingOverviewProgress,
  setContributingOverviewProgress,
} from '../lib/wizardGates'

export function ContributingOverviewStep() {
  const saved = getContributingOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
  const [claOpened, setClaOpened] = useState(saved.claOpened)
  const [claAcknowledged, setClaAcknowledged] = useState(saved.claAcknowledged)
  const total = CONTRIBUTING_SLIDES.length
  const slide = CONTRIBUTING_SLIDES[slideIndex]!
  const isLast = slideIndex === total - 1
  const isFirst = slideIndex === 0
  // Must open CLA and check the Verify-style acknowledgment before leaving slide 1.
  const nextDisabled = isFirst && !(claOpened && claAcknowledged)

  useEffect(() => {
    const prev = getContributingOverviewProgress()
    setContributingOverviewProgress({
      slideIndex,
      reachedLast: prev.reachedLast || isLast,
      claOpened: prev.claOpened || claOpened,
      // Honor-system: allow unchecking to re-lock Next slide.
      claAcknowledged,
    })
  }, [slideIndex, isLast, claOpened, claAcknowledged])

  function markClaOpened() {
    setClaOpened(true)
  }

  function onClaAuxClick(event: MouseEvent<HTMLAnchorElement>) {
    // Middle-click also opens the CLA; count it as viewed.
    if (event.button === 1) markClaOpened()
  }

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
          <h3 className="font-display text-2xl font-semibold text-slate-950">{slide.title}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{slide.body}</p>
          {slide.cta ? (
            <div className="space-y-3">
              <a
                href={slide.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={slide.cta.testId}
                onClick={markClaOpened}
                onAuxClick={onClaAuxClick}
                className={`inline-flex items-center gap-2 px-3 py-1.5 ${
                  claOpened
                    ? 'rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-sm font-medium text-[var(--color-accent-hover)]'
                    : 'btn-primary'
                }`}
              >
                {claOpened ? (
                  <span aria-hidden className="text-[var(--color-accent)]">
                    ✓
                  </span>
                ) : null}
                {slide.cta.label}
              </a>
              {!claOpened ? (
                <button
                  type="button"
                  data-testid="contributing-cla-opened-elsewhere"
                  onClick={markClaOpened}
                  className="text-sm text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                >
                  I opened the CLA in another tab
                </button>
              ) : (
                <ul className="space-y-3" data-testid="contributing-cla-checklist">
                  <li className="flex items-start gap-3">
                    <input
                      id="contributing-check-cla"
                      type="checkbox"
                      data-testid="contributing-check-cla"
                      checked={claAcknowledged}
                      onChange={(event) => setClaAcknowledged(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-[var(--color-accent)]"
                    />
                    <label htmlFor="contributing-check-cla" className="text-sm text-slate-700">
                      I have viewed and read the CLA.
                    </label>
                  </li>
                </ul>
              )}
            </div>
          ) : null}
          {slide.links && slide.links.length > 0 ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {slide.links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ', ' : null}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                  >
                    {link.label}
                  </a>
                </span>
              ))}
              .
            </p>
          ) : null}
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
              disabled={nextDisabled}
              onClick={() => setSlideIndex((index) => Math.min(total - 1, index + 1))}
              className="btn-primary px-3 py-1.5"
            >
              Next slide
            </button>
          ) : null}
        </div>
      </div>
    </StepPanel>
  )
}

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import claMarkdown from '@content/cla.md?raw'
import guidelinesMarkdown from '@content/contributing-guidelines.md?raw'
import { CONTRIBUTING_SLIDES } from '../content/contributingSlides'
import { AgreeDocumentPanel } from '../components/AgreeDocumentPanel'
import { DidYouKnow } from '../components/DidYouKnow'
import { StepPanel } from '../components/StepPanel'
import {
  getContributingOverviewProgress,
  setContributingOverviewProgress,
} from '../lib/wizardGates'
import { registerSlideDeck } from '../lib/slideDeckNav'

const CLA_GITHUB = 'https://github.com/comet-ml/opik/blob/main/CLA.md'
const GUIDELINES_GITHUB = 'https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md'

export function ContributingOverviewStep() {
  const saved = getContributingOverviewProgress()
  const [slideIndex, setSlideIndex] = useState(saved.slideIndex)
  const [claAgreed, setClaAgreed] = useState(saved.claAgreed)
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(saved.guidelinesAgreed)
  const total = CONTRIBUTING_SLIDES.length
  const slide = CONTRIBUTING_SLIDES[slideIndex]!
  const isLast = slideIndex === total - 1
  const slideId = slide.id
  const maxReachedSlideIndex = Math.max(
    slideIndex,
    saved.maxReachedSlideIndex ?? saved.slideIndex,
  )

  const claSlideBlocked = slideId === 'what-contributing-means' && !claAgreed
  const guidelinesSlideBlocked = slideId === 'contributing-guidelines' && !guidelinesAgreed

  useEffect(() => {
    const prev = getContributingOverviewProgress()
    setContributingOverviewProgress({
      slideIndex,
      maxReachedSlideIndex: Math.max(prev.maxReachedSlideIndex ?? 0, slideIndex),
      reachedLast: prev.reachedLast || isLast,
      claAgreed,
      guidelinesAgreed,
    })
  }, [slideIndex, isLast, claAgreed, guidelinesAgreed])

  const claSlideIndex = CONTRIBUTING_SLIDES.findIndex((entry) => entry.embedCla)
  const guidelinesSlideIndex = CONTRIBUTING_SLIDES.findIndex((entry) => entry.embedGuidelines)

  // Cap jumps so dots cannot bypass agree-to-continue even after leaving a gate slide.
  let gateCap = total - 1
  if (!claAgreed && claSlideIndex >= 0) gateCap = Math.min(gateCap, claSlideIndex)
  if (!guidelinesAgreed && guidelinesSlideIndex >= 0) {
    gateCap = Math.min(gateCap, guidelinesSlideIndex)
  }
  const maxJumpableSlideIndex = Math.min(maxReachedSlideIndex, gateCap)

  const goPrev = useCallback(() => {
    setSlideIndex((index) => Math.max(0, index - 1))
  }, [])

  const goNext = useCallback(() => {
    setSlideIndex((index) => Math.min(total - 1, index + 1))
  }, [total])

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index > maxJumpableSlideIndex || index === slideIndex) return
      setSlideIndex(index)
    },
    [maxJumpableSlideIndex, slideIndex],
  )

  useLayoutEffect(() => {
    const canNextSlide = !isLast && !claSlideBlocked && !guidelinesSlideBlocked
    return registerSlideDeck('contributing-overview', {
      canPrevSlide: slideIndex > 0,
      canNextSlide,
      atLastSlide: isLast,
      prevSlide: goPrev,
      nextSlide: goNext,
    })
  }, [slideIndex, isLast, claSlideBlocked, guidelinesSlideBlocked, goPrev, goNext])

  const paragraphs = slide.paragraphs ?? (slide.body ? [slide.body] : [])

  return (
    <StepPanel testId="step-contributing-overview" title="Contributing overview">
      <div className="space-y-5" data-testid="contributing-slides">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Slide {slideIndex + 1} of {total}
          </p>
          <div
            data-testid="contributing-slide-nav"
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Contributing overview slides"
          >
            {CONTRIBUTING_SLIDES.map((entry, index) => {
              const reached = index <= maxJumpableSlideIndex
              const current = index === slideIndex
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={current}
                  aria-label={`Slide ${index + 1}`}
                  data-testid={`contributing-slide-dot-${index}`}
                  disabled={!reached}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    current
                      ? 'bg-[var(--color-accent)]'
                      : reached
                        ? 'bg-slate-300 hover:bg-slate-400'
                        : 'cursor-not-allowed bg-slate-200'
                  }`}
                />
              )
            })}
          </div>
        </div>

        <div
          key={slide.id}
          data-testid={`contributing-slide-${slide.id}`}
          className="min-h-[10rem] space-y-3"
        >
          <h3 className="font-display text-2xl font-semibold text-slate-950">{slide.title}</h3>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}

          {slide.embedCla ? (
            <AgreeDocumentPanel
              markdown={claMarkdown}
              docName="Contributor License Agreement (CLA)"
              githubHref={CLA_GITHUB}
              agreed={claAgreed}
              onAgreedChange={setClaAgreed}
              testIdPrefix="contributing-cla"
            />
          ) : null}

          {slide.embedGuidelines ? (
            <AgreeDocumentPanel
              markdown={guidelinesMarkdown}
              docName="contributing guidelines"
              githubHref={GUIDELINES_GITHUB}
              agreed={guidelinesAgreed}
              onAgreedChange={setGuidelinesAgreed}
              testIdPrefix="contributing-guidelines"
            />
          ) : null}

          {slide.items && slide.items.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {slide.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                    >
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {slide.links && slide.links.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {slide.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {slide.bullets && slide.bullets.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {slide.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
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

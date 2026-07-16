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

  const claSlideBlocked = slideId === 'what-contributing-means' && !claAgreed
  const guidelinesSlideBlocked = slideId === 'contributing-guidelines' && !guidelinesAgreed

  useEffect(() => {
    const prev = getContributingOverviewProgress()
    setContributingOverviewProgress({
      slideIndex,
      reachedLast: prev.reachedLast || isLast,
      claAgreed,
      guidelinesAgreed,
    })
  }, [slideIndex, isLast, claAgreed, guidelinesAgreed])

  const goPrev = useCallback(() => {
    setSlideIndex((index) => Math.max(0, index - 1))
  }, [])

  const goNext = useCallback(() => {
    setSlideIndex((index) => Math.min(total - 1, index + 1))
  }, [total])

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
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Slide {slideIndex + 1} of {total}
        </p>

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

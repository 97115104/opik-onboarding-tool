import { LearnMoreLink } from '../components/LearnMoreLink'
import { StepPanel } from '../components/StepPanel'

export function VideoStep() {
  return (
    <StepPanel
      testId="step-video"
      title="See Opik in a few minutes"
      subtitle="A short overview of how Opik helps you observe and improve LLM applications."
    >
      <div className="space-y-4">
        <div
          data-testid="opik-intro-video"
          className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-slate-950"
        >
          <iframe
            width="100%"
            style={{ aspectRatio: '16 / 9', height: 'auto', minHeight: 280 }}
            src="https://www.youtube-nocookie.com/embed/TO9ar6-OJj4?rel=0"
            title="Opik onboarding overview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <LearnMoreLink href="https://www.comet.com/docs/opik/v1/opik-university/overview">
          Explore Opik University
        </LearnMoreLink>
      </div>
    </StepPanel>
  )
}

import ReactMarkdown from 'react-markdown'
import tourMd from '@content/onboarding-tour.md?raw'
import { StepPanel } from '../components/StepPanel'
import { personaSubtitle } from '../lib/persona'

export function TourStep() {
  const subtitle = personaSubtitle({
    default: 'Walk through the local stack before the quiz and issue assignment.',
    engineer: 'Confirm the local stack layout before the quiz and issue pick.',
    pm: 'A short tour of what is running locally, without deep tooling jargon.',
    support: 'See what a healthy local setup looks like so you can help others.',
    external: 'Walk the local stack once, then continue to the quiz.',
  })

  return (
    <StepPanel testId="step-tour" title="Onboarding tour" subtitle={subtitle}>
      <article className="markdown-body">
        <ReactMarkdown>{tourMd}</ReactMarkdown>
      </article>
    </StepPanel>
  )
}

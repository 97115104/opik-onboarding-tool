import ReactMarkdown from 'react-markdown'
import tourMd from '@content/onboarding-tour.md?raw'
import { StepPanel } from '../components/StepPanel'

export function TourStep() {
  return (
    <StepPanel
      testId="step-tour"
      title="Onboarding tour"
      subtitle="Walk through the local stack before the quiz and issue assignment."
    >
      <article className="markdown-body">
        <ReactMarkdown>{tourMd}</ReactMarkdown>
      </article>
    </StepPanel>
  )
}

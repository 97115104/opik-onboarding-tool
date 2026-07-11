import ReactMarkdown from 'react-markdown'
import overviewMd from '@content/overview.md?raw'
import { StepPanel } from '../components/StepPanel'

export function OverviewStep() {
  return (
    <StepPanel
      testId="step-overview"
      title="Product overview"
      subtitle="What Opik is and what this wizard prepares you to do."
    >
      <article className="markdown-body">
        <ReactMarkdown>{overviewMd}</ReactMarkdown>
      </article>
    </StepPanel>
  )
}

import ReactMarkdown from 'react-markdown'
import overviewMd from '@content/overview.md?raw'
import { StepPanel } from '../components/StepPanel'
import { personaSubtitle } from '../lib/persona'

export function OverviewStep() {
  const subtitle = personaSubtitle({
    default: 'What Opik is and what this wizard prepares you to do.',
    engineer: 'A short product map before you touch the local stack and code.',
    pm: 'A plain-language look at Opik before you pick an issue to shepherd.',
    support: 'A quick product briefing so you can guide a contribution with confidence.',
    external: 'What Opik is, then how this wizard gets you to a first pull request.',
  })

  return (
    <StepPanel testId="step-overview" title="Product overview" subtitle={subtitle}>
      <article className="markdown-body">
        <ReactMarkdown>{overviewMd}</ReactMarkdown>
      </article>
    </StepPanel>
  )
}

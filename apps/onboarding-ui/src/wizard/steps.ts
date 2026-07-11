import type { WizardStepConfig } from '../types'

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'about', label: 'About you', testId: 'step-about', owner: 'B' },
  { id: 'overview', label: 'Overview', testId: 'step-overview', owner: 'B' },
  { id: 'graph', label: 'Opik Features', testId: 'step-graph', owner: 'B' },
  { id: 'stack', label: 'Local stack', testId: 'step-stack', owner: 'B' },
  { id: 'tour', label: 'Try Opik', testId: 'step-tour', owner: 'B' },
  { id: 'quiz', label: 'Quiz', testId: 'step-quiz', owner: 'C' },
  {
    id: 'contributing-overview',
    label: 'Contributing overview',
    testId: 'step-contributing-overview',
    owner: 'C',
  },
  {
    id: 'contributing-quiz',
    label: 'Contributing quiz',
    testId: 'step-contributing-quiz',
    owner: 'C',
  },
  { id: 'issues', label: 'Issues', testId: 'step-issues', owner: 'C' },
  { id: 'prompt', label: 'Cursor prompt', testId: 'step-prompt', owner: 'C' },
  { id: 'verify', label: 'Verify', testId: 'step-verify', owner: 'C' },
  { id: 'pr-help', label: 'PR help', testId: 'step-pr-help', owner: 'C' },
  { id: 'extend', label: 'Extend', testId: 'step-extend', owner: 'B' },
  { id: 'finish', label: 'Finish', testId: 'step-finish', owner: 'B' },
]

/** Content steps before the celebration Finish screen. */
export const CONTENT_STEP_COUNT = WIZARD_STEPS.filter((step) => step.id !== 'finish').length

export const B_STEP_COUNT = WIZARD_STEPS.filter((step) => step.owner === 'B').length

import type { WizardStepConfig } from '../types'

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'overview', label: 'Overview', testId: 'step-overview', owner: 'B' },
  { id: 'graph', label: 'Graph', testId: 'step-graph', owner: 'B' },
  { id: 'stack', label: 'Stack', testId: 'step-stack', owner: 'B' },
  { id: 'tour', label: 'Tour', testId: 'step-tour', owner: 'B' },
  { id: 'quiz', label: 'Quiz', testId: 'step-quiz', owner: 'C' },
  { id: 'issues', label: 'Issues', testId: 'step-issues', owner: 'C' },
  { id: 'prompt', label: 'Prompt', testId: 'step-prompt', owner: 'C' },
  { id: 'checklist', label: 'Checklist', testId: 'step-checklist', owner: 'C' },
  { id: 'extend', label: 'Extend', testId: 'step-extend', owner: 'B' },
]

export const B_STEP_COUNT = WIZARD_STEPS.filter((step) => step.owner === 'B').length

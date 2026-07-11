import type { ComponentType } from 'react'
import { ExtendStep } from '@/steps/ExtendStep'
import { GraphStep } from '@/steps/GraphStep'
import { OverviewStep } from '@/steps/OverviewStep'
import { StackStep } from '@/steps/StackStep'
import { TourStep } from '@/steps/TourStep'
import {
  ChecklistStep,
  IssuesStep,
  PromptStep,
  QuizStep,
} from '@/wizard/lazyFeatures'

export interface StepEntry {
  id: string
  Component: ComponentType
  lazy?: boolean
}

export const STEP_REGISTRY: StepEntry[] = [
  { id: 'overview', Component: OverviewStep },
  { id: 'graph', Component: GraphStep },
  { id: 'stack', Component: StackStep },
  { id: 'tour', Component: TourStep },
  { id: 'quiz', Component: QuizStep, lazy: true },
  { id: 'issues', Component: IssuesStep, lazy: true },
  { id: 'prompt', Component: PromptStep, lazy: true },
  { id: 'checklist', Component: ChecklistStep, lazy: true },
  { id: 'extend', Component: ExtendStep },
]

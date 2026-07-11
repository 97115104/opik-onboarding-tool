import type { ComponentType } from 'react'
import { AboutYouStep } from '@/steps/AboutYouStep'
import { ContributingOverviewStep } from '@/steps/ContributingOverviewStep'
import { ExtendStep } from '@/steps/ExtendStep'
import { FinishStep } from '@/steps/FinishStep'
import { GraphStep } from '@/steps/GraphStep'
import { OverviewStep } from '@/steps/OverviewStep'
import { StackStep } from '@/steps/StackStep'
import { TourStep } from '@/steps/TourStep'
import {
  ContributingQuizStep,
  IssuesStep,
  PrHelpStep,
  PromptStep,
  QuizStep,
  VerifyStep,
} from '@/wizard/lazyFeatures'

export interface StepEntry {
  id: string
  Component: ComponentType
  lazy?: boolean
}

export const STEP_REGISTRY: StepEntry[] = [
  { id: 'about', Component: AboutYouStep },
  { id: 'overview', Component: OverviewStep },
  { id: 'graph', Component: GraphStep },
  { id: 'stack', Component: StackStep },
  { id: 'tour', Component: TourStep },
  { id: 'quiz', Component: QuizStep, lazy: true },
  { id: 'contributing-overview', Component: ContributingOverviewStep },
  { id: 'contributing-quiz', Component: ContributingQuizStep, lazy: true },
  { id: 'issues', Component: IssuesStep, lazy: true },
  { id: 'prompt', Component: PromptStep, lazy: true },
  { id: 'verify', Component: VerifyStep, lazy: true },
  { id: 'pr-help', Component: PrHelpStep, lazy: true },
  { id: 'extend', Component: ExtendStep },
  { id: 'finish', Component: FinishStep },
]

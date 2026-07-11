/**
 * Integration hooks for workstream B (onboarding UI shell).
 *
 * B should register contributionApiPlugin in vite.config.ts:
 *   import { contributionApiPlugin } from '@/features/issues/contributionApiPlugin'
 *   plugins: [react(), tailwindcss(), contributionApiPlugin()]
 *
 * Lazy imports in lazyFeatures.ts should use:
 *   () => import('@/features/quiz/QuizStep')
 *   () => import('@/features/issues/IssuesStep')
 *   () => import('@/features/prompt/PromptStep')
 *   () => import('@/features/checklist/ChecklistStep')
 */
import type { ComponentType } from "react";
import ChecklistStep from "../checklist/ChecklistStep";
import IssuesStep from "./IssuesStep";
import QuizStep from "../quiz/QuizStep";
import PromptStep from "../prompt/PromptStep";

export interface WizardStepDefinition {
  key: string;
  label: string;
  testId: string;
  Component: ComponentType;
}

export const CONTRIBUTION_WIZARD_STEPS: WizardStepDefinition[] = [
  { key: "quiz", label: "Quiz", testId: "step-quiz", Component: QuizStep },
  { key: "issues", label: "Issues", testId: "step-issues", Component: IssuesStep },
  { key: "prompt", label: "Cursor prompt", testId: "step-prompt", Component: PromptStep },
  { key: "checklist", label: "PR checklist", testId: "step-checklist", Component: ChecklistStep },
];

export { BRANCH_NAME_PATTERN, DEFAULT_OPIK_PATH } from "./types";
export type { ContributionState, RankedIssue } from "./types";

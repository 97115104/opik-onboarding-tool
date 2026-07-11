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
 *   () => import('@/features/verify/VerifyStep')
 *   () => import('@/features/checklist/ChecklistStep')  // PrHelpStep / ChecklistStep
 */

export interface WizardStepDefinition {
  key: string;
  label: string;
  testId: string;
}

/** Metadata only. Most C step components are lazy-loaded by B via lazyFeatures.ts; contributing-overview is eager. */
export const CONTRIBUTION_WIZARD_STEPS: WizardStepDefinition[] = [
  { key: "quiz", label: "Quiz", testId: "step-quiz" },
  {
    key: "contributing-overview",
    label: "Contributing",
    testId: "step-contributing-overview",
  },
  { key: "issues", label: "Issues", testId: "step-issues" },
  { key: "prompt", label: "Cursor prompt", testId: "step-prompt" },
  { key: "verify", label: "Verify", testId: "step-verify" },
  { key: "pr-help", label: "PR help", testId: "step-pr-help" },
];

export { BRANCH_NAME_PATTERN, DEFAULT_OPIK_PATH } from "./types";
export type { ContributionState, Persona, RankedIssue } from "./types";

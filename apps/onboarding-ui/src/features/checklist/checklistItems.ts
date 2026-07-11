export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

/** PR-help guidance aligned with Opik CONTRIBUTING.md fast path and AI rules. */
export const PR_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "tracked-issue",
    label: "Tracked issue linked in PR (Fixes #… or Resolves #…)",
    detail: "Open or confirm a tracked issue before contributing.",
  },
  {
    id: "branch-name",
    label: "Branch follows Opik naming convention",
    detail:
      "Opik {username}/{ticket}-{summary} ({username} = your GitHub handle; ticket = issue-{N} or NA)",
  },
  {
    id: "draft-pr",
    label: "Draft PR opened via gh pr create --draft",
  },
  {
    id: "pr-template",
    label: "Fill .github/pull_request_template.md completely",
  },
  {
    id: "quality",
    label: "Run formatters, linters, and tests for touched area",
    detail: "make precommit or component-specific checks per CONTRIBUTING.md",
  },
  {
    id: "ai-disclosure",
    label: "AI assistance disclosed in PR template if used",
    detail: "Include the PR template AI watermark/disclosure block when applicable.",
  },
  {
    id: "attestation",
    label: "Human attestation: you are accountable for the contribution",
    detail: "Never submit unreviewed AI output; verify correctness and security.",
  },
  {
    id: "contributing-link",
    label: "Reviewed Opik CONTRIBUTING.md fast path",
    detail: "https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md#fast-path",
  },
];

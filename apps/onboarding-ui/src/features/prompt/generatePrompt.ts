import type { Persona, RankedIssue } from "../issues/types";
import { DEFAULT_OPIK_PATH } from "../issues/types";

export function openCursorCommands(opikPath: string): string {
  return `cursor "${opikPath}"
# fallback if the cursor CLI is not on PATH:
cd "${opikPath}" && cursor .`;
}

export function generateCursorPrompt(
  issue: RankedIssue,
  branchName: string,
  opikPath: string = DEFAULT_OPIK_PATH,
  persona: Persona | null = null,
): string {
  const simple = persona === "pm" || persona === "support";

  if (simple) {
    return `You are helping me contribute a code change to Opik (comet-ml/opik). I may not know the codebase deeply. Guide me step by step.

## Issue
- #${issue.number}: ${issue.title}
- ${issue.url}

## Repo and branch
- Clone path: ${opikPath}
- Branch: ${branchName}

## What to do
1. Open the repo in Cursor (or cd into ${opikPath}) and checkout ${branchName}.
2. Read the issue and the Opik CONTRIBUTING fast path: https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md#fast-path
3. Make the smallest change that fixes the issue. Explain what you change in plain language.
4. Run the relevant checks/tests for the files you touched.
5. Commit referencing the issue (Fixes #${issue.number} or Resolves #${issue.number}).
6. Open a draft PR: gh pr create --draft
7. Fill .github/pull_request_template.md, including AI disclosure if AI helped.

## Accountability
Disclose AI assistance in the PR template. A human remains accountable for correctness, licensing, and security.
`;
  }

  return `Implement a contribution to Opik (comet-ml/opik).

## Issue
- #${issue.number}: ${issue.title}
- ${issue.url}

## Branch and path
- Branch: ${branchName}
- OPIK_PATH: ${opikPath}

## Steps
1. cd "${opikPath}" and checkout ${branchName} (create from origin/main if needed).
2. Read the issue and https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md#fast-path
3. Implement a focused fix for the issue.
4. Run formatters, linters, and tests for touched code.
5. Commit with Fixes #${issue.number} or Resolves #${issue.number}.
6. Open a draft PR: gh pr create --draft
7. Fill .github/pull_request_template.md completely, including AI disclosure if applicable.

## AI disclosure
Disclose AI assistance in the PR template. Human author remains accountable. Do not submit unreviewed AI output.
`;
}

export function generatePrHelpPrompt(
  issue: RankedIssue | null,
  branchName: string | null,
  opikPath: string = DEFAULT_OPIK_PATH,
): string {
  const issueLine = issue
    ? `Issue #${issue.number} (${issue.title}) at ${issue.url}`
    : "Use the issue already assigned in this onboarding session";
  const branch = branchName ?? "opik-onboarding-tool-97115104-contribution-<N>";

  return `Help me open a draft pull request for my Opik contribution.

## Context
- ${issueLine}
- Branch: ${branch}
- Repo path: ${opikPath}

## Walk me through
1. cd "${opikPath}" and checkout ${branch}.
2. Run formatters, linters, and tests for the files I changed.
3. Confirm the commit message links the issue (Fixes #… or Resolves #…).
4. Create a draft PR: gh pr create --draft
5. Fill .github/pull_request_template.md completely.
6. Disclose AI assistance if used.
7. Confirm human attestation: I remain accountable for correctness, licensing, and security.

Keep instructions short and actionable. Point out anything still missing before I submit.
`;
}

export const CURSOR_PROMPT_BRANCH_REGEX =
  /opik-onboarding-tool-97115104-contribution-\d+/;

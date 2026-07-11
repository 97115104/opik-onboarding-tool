import type { Persona, RankedIssue } from "../issues/types";
import { BRANCH_NAME_MATCH, DEFAULT_OPIK_PATH } from "../issues/types";

/** Official Cursor deeplink URL length budget (scheme + path + query). */
export const CURSOR_DEEPLINK_MAX_URL_LENGTH = 8000;

export function openCursorCommands(opikPath: string): string {
  return `cursor "${opikPath}"
# fallback if the cursor CLI is not on PATH:
cd "${opikPath}" && cursor .`;
}

/**
 * Build a Cursor prompt deeplink. If the full URL would exceed the limit,
 * shorten the embedded text and return truncated=true so the UI can keep Copy.
 */
export function buildCursorPromptDeeplink(prompt: string): {
  href: string;
  truncated: boolean;
} {
  const prefix = "cursor://anysphere.cursor-deeplink/prompt?text=";
  const full = `${prefix}${encodeURIComponent(prompt)}`;
  if (full.length <= CURSOR_DEEPLINK_MAX_URL_LENGTH) {
    return { href: full, truncated: false };
  }

  // Binary-search a prefix of the prompt that fits after encoding.
  let lo = 0;
  let hi = prompt.length;
  let best = "";
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = `${prompt.slice(0, mid)}\n\n[Prompt truncated for deeplink. Paste the full prompt from the onboarding UI.]`;
    const url = `${prefix}${encodeURIComponent(candidate)}`;
    if (url.length <= CURSOR_DEEPLINK_MAX_URL_LENGTH) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return {
    href: `${prefix}${encodeURIComponent(best || "Open the onboarding UI and copy the full prompt.")}`,
    truncated: true,
  };
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
4. Commit referencing the issue (Fixes #${issue.number} or Resolves #${issue.number}).
5. Stop when the fix is ready to verify. Do not open a PR yet; the next onboarding step covers checks and draft PR help.

## Accountability
Disclose AI assistance later in the PR template. A human remains accountable for correctness, licensing, and security.
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
4. Commit with Fixes #${issue.number} or Resolves #${issue.number}.
5. Stop when the fix is ready to verify. Do not open a PR yet; the next onboarding steps cover local checks and draft PR help.

## AI disclosure
Disclose AI assistance later in the PR template. Human author remains accountable. Do not submit unreviewed AI output.
`;
}

export function generateVerifyPrompt(
  issue: RankedIssue,
  branchName: string,
  plan: {
    area: string;
    rationale: string;
    localCommands: string[];
    workflows: { name: string; url: string }[];
    contributingUrl: string;
  },
  opikPath: string = DEFAULT_OPIK_PATH,
): string {
  const commands = plan.localCommands.map((c) => `- \`${c}\``).join("\n");
  const workflows = plan.workflows.map((w) => `- ${w.name}: ${w.url}`).join("\n");

  return `Verify my Opik contribution against the issue before I open a draft PR.

## Issue
- #${issue.number}: ${issue.title}
- ${issue.url}

## Branch and path
- Branch: ${branchName}
- OPIK_PATH: ${opikPath}

## Detected area
- Area: ${plan.area}
- Why: ${plan.rationale}
- CONTRIBUTING: ${plan.contributingUrl}

## What to do
1. cd "${opikPath}" and checkout ${branchName}.
2. Inspect the diff vs origin/main and confirm it matches the issue.
3. Run these local checks (adapt if paths differ):
${commands}
4. Report pass/fail for each command with short evidence.
5. List GitHub Actions workflows to watch on the PR:
${workflows}
6. Do not open a PR yet unless I ask; summarize what is still missing.

Keep the report short and actionable.
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
  const branch = branchName ?? "{username}/issue-<N>-onboarding";

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

export const CURSOR_PROMPT_BRANCH_REGEX = BRANCH_NAME_MATCH;

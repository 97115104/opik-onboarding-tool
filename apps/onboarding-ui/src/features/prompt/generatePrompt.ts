import type { RankedIssue } from "../issues/types";
import { DEFAULT_OPIK_PATH } from "../issues/types";

export function generateCursorPrompt(
  issue: RankedIssue,
  branchName: string,
  opikPath: string = DEFAULT_OPIK_PATH,
): string {
  return `You are implementing a contribution to Opik (comet-ml/opik).

## Assigned issue
- Number: #${issue.number}
- Title: ${issue.title}
- URL: ${issue.url}

## Branch
Work on branch \`${branchName}\` (must match pattern \`opik-onboarding-tool-97115104-contribution-\\d+\`).

## Opik clone
\`OPIK_PATH=${opikPath}\`

## Steps
1. \`cd "${opikPath}"\` and checkout \`${branchName}\` (create from origin/main if needed).
2. Read the issue and Opik CONTRIBUTING.md fast path: https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md#fast-path
3. Implement the fix scoped to the requested area.
4. Run relevant formatters, linters, and tests for touched code (\`make precommit\` or component-specific checks).
5. Commit with message referencing the issue (\`Fixes #${issue.number}\` or \`Resolves #${issue.number}\`).
6. Open a **draft** PR: \`gh pr create --draft\`
7. Fill \`.github/pull_request_template.md\` completely, including AI disclosure if applicable.

## AI disclosure & attestation
- Disclose any AI assistance used in the PR template watermark block.
- Human author remains accountable for correctness, licensing, and security.
- Never submit unreviewed AI output; run tests/linters before opening the PR.

## PR checklist reference
- Tracked issue linked (\`Fixes #...\` or \`Resolves #...\`)
- Branch name follows Opik conventions or onboarding branch pattern above
- Draft PR via \`gh pr create --draft\`
- PR template filled completely
- Formatters/linters/tests run for touched area
- AI assistance disclosed if used
- Human attestation: you are accountable for the contribution
`;
}

export const CURSOR_PROMPT_BRANCH_REGEX =
  /opik-onboarding-tool-97115104-contribution-\d+/;

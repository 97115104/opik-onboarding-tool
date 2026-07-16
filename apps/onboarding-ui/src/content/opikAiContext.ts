export const OPIK_LLM_CONTEXT = {
  llmsTxt: 'https://www.comet.com/docs/opik/llms.txt',
  llmsFullTxt: 'https://www.comet.com/docs/opik/llms-full.txt',
  mcpServer: 'https://www.comet.com/docs/opik/_mcp/server',
  contributingAiSection:
    'https://www.comet.com/docs/opik/latest/contributing/overview#developer-tooling--ai-assistance',
  featureRequests:
    'https://github.com/comet-ml/opik/issues?q=is%3Aissue+is%3Aopen+label%3A%22feature+request%22',
} as const

/** Concise Opik AI context block for Cursor prompts (watch deeplink budget). */
export function buildOpikAiContextBlock(): string {
  return `## Opik AI context (read before coding)
- General docs: ${OPIK_LLM_CONTEXT.llmsTxt}
- Deep context: ${OPIK_LLM_CONTEXT.llmsFullTxt}
- MCP server: ${OPIK_LLM_CONTEXT.mcpServer} (connect in Cursor for live docs)
- Guidelines: ${OPIK_LLM_CONTEXT.contributingAiSection}
- Review related issues and PRs before implementing.
- Disclose AI assistance in the PR template when used; human author stays accountable.
- Do not submit unreviewed AI output.`
}

/** Exact ## AI Assistance block for PR descriptions (omit when no AI used). */
export function buildAiAssistancePrBlock(issueNumber?: number): string {
  const scope = issueNumber != null ? `implementation and tests for #${issueNumber}` : 'implementation and tests for this issue'
  return `## AI Assistance
- Tool/model: Cursor (Auto) / <your model>
- Scope: ${scope}
- Human verification: reviewed diff, ran local checks, confirmed issue linkage
- Attestation: <paste attest verify or short URL from attest-client>`
}

/** Prompt-only attest-client CLI steps (no server API, no npm dep in onboarding-ui). */
export function buildAttestPrInstructions(issueNumber?: number): string {
  const contentName =
    issueNumber != null ? `opik-pr-issue-${issueNumber}` : 'opik-pr-issue-<N>'
  return `## Attestation (if AI was used)
1. From the Opik repo root, run:
   npx attest-client --content "${contentName}" --model "<your-model>" --role collaborated --platform Cursor --json
2. Use the exact shortUrl/verifyUrl from the JSON output (do not construct URLs manually).
3. Paste the verify or short URL into the ## AI Assistance section of the PR description.

Alternative (import):
import { attest } from 'attest-client'
const { urls } = await attest({ content_name: '${contentName}', model: 'auto', role: 'collaborated', platform: 'Cursor' })`
}

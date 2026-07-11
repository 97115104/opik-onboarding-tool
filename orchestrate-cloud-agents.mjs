#!/usr/bin/env node
/**
 * Launch cloud agents in parallel for open workstream issues — one command, no manual kickoffs.
 *
 * Usage:
 *   export CURSOR_API_KEY="cursor_..."   # https://cursor.com/dashboard → Integrations
 *   node scripts/orchestrate-cloud-agents.mjs              # all claimable implement issues
 *   node scripts/orchestrate-cloud-agents.mjs --label workstream:A
 *   node scripts/orchestrate-cloud-agents.mjs --issues 2,3,4,5,6
 *   node scripts/orchestrate-cloud-agents.mjs --dry-run
 *
 * Requires: gh CLI authenticated, node 18+
 */

import { execSync } from "node:child_process";

const REPO = "97115104/opik-onboarding-tool";
const REPO_URL = `https://github.com/${REPO}`;
const API = "https://api.cursor.com/v1/agents";
const DEFAULT_MODEL = "composer-2.5";

function parseArgs(argv) {
  const opts = { labels: [], issues: [], dryRun: false, model: DEFAULT_MODEL };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--label" && argv[i + 1]) opts.labels.push(argv[++i]);
    else if (a === "--issues" && argv[i + 1])
      opts.issues = argv[++i].split(",").map(Number);
    else if (a === "--model" && argv[i + 1]) opts.model = argv[++i];
    else if (a === "--help") {
      console.log(`Usage: node scripts/orchestrate-cloud-agents.mjs [--label workstream:A] [--issues 2,3] [--model composer-2.5] [--dry-run]`);
      process.exit(0);
    }
  }
  if (opts.labels.length === 0 && opts.issues.length === 0) {
    opts.labels = ["workstream:A", "workstream:B", "workstream:C", "workstream:D", "workstream:E"];
  }
  return opts;
}

function ghJson(cmd) {
  return JSON.parse(execSync(cmd, { encoding: "utf8" }));
}

function listIssues(opts) {
  if (opts.issues.length > 0) {
    return opts.issues.map((n) => {
      const issue = ghJson(`gh issue view ${n} --repo ${REPO} --json number,title,body,labels,state`);
      if (issue.state !== "OPEN") throw new Error(`Issue #${n} is not open`);
      return issue;
    });
  }
  const labelFilter = opts.labels.map((l) => `--label "${l}"`).join(" ");
  return ghJson(`gh issue list --repo ${REPO} --state open ${labelFilter} --json number,title,body,labels --limit 50`);
}

function buildPrompt(issue) {
  return `You own GitHub issue #${issue.number} ONLY on ${REPO}: "${issue.title}".

Before coding:
1. Read issue #${issue.number} Owned paths — refuse all other paths.
2. Read AGENT_KICKOFF.md, ARCHITECTURE.md, CONTRACTS.md on main.

Issue body:
---
${issue.body}
---

While working:
- Comment \`claimed\` + your cloud agent URL on issue #${issue.number} via gh.
- No destructive git (no stash, reset --hard).
- Fix code; no paragraph-long workarounds.
- Commit to main with message referencing Fixes #${issue.number}.

When done:
- Comment completion summary + changed file list on issue #${issue.number}.
- Leave issue open for adversarial review.
- Do NOT self-review.`;
}

async function launchAgent(apiKey, issue, model, dryRun) {
  const prompt = buildPrompt(issue);
  if (dryRun) {
    console.log(`\n--- DRY RUN issue #${issue.number}: ${issue.title} ---\n${prompt.slice(0, 400)}...\n`);
    return { issue: issue.number, dryRun: true };
  }

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: { text: prompt },
      model: { id: model },
      repos: [{ url: REPO_URL, startingRef: "main" }],
      target: { skipReviewerRequest: true },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Issue #${issue.number}: HTTP ${res.status} ${JSON.stringify(body)}`);
  }

  const agentId = body.agent?.id ?? body.id;
  const agentUrl = agentId?.startsWith("bc-")
    ? `https://cursor.com/agents/${agentId}`
    : body.agent?.url ?? body.url ?? "(see dashboard)";

  execSync(
    `gh issue comment ${issue.number} --repo ${REPO} --body "🤖 **Orchestrator launched cloud agent**\\n\\nAgent: ${agentUrl}\\nModel: ${model}"`,
    { stdio: "inherit" },
  );

  return { issue: issue.number, agentId, agentUrl };
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey && !opts.dryRun) {
    console.error("Set CURSOR_API_KEY (https://cursor.com/dashboard → Integrations)");
    process.exit(1);
  }

  const issues = listIssues(opts);
  if (issues.length === 0) {
    console.log("No open issues matched.");
    process.exit(0);
  }

  console.log(`Launching ${issues.length} cloud agent(s) in parallel: #${issues.map((i) => i.number).join(", #")}`);

  const results = await Promise.allSettled(
    issues.map((issue) => launchAgent(apiKey, issue, opts.model, opts.dryRun)),
  );

  for (const r of results) {
    if (r.status === "fulfilled") console.log("OK:", JSON.stringify(r.value));
    else console.error("FAIL:", r.reason.message ?? r.reason);
  }

  const failed = results.filter((r) => r.status === "rejected").length;
  process.exit(failed > 0 ? 1 : 0);
}

main();

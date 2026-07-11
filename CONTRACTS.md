# Contracts — Opik Onboarding Tool

**Locked decisions.** Implementers read this file; only Prep (or an explicit reopen issue) may edit it while workstreams are open.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPIK_PATH` | `<parent-of-tool>/opik` | Absolute path to Opik clone |
| `ONBOARDING_UI_PORT` | `4310` | Onboarding wizard dev server |
| `CHAT_DEMO_PORT` | `4311` | Chat demo dev server |
| `OPIK_FRONTEND_URL` | `http://127.0.0.1:5173` | Opik UI (from `opik.sh`) |
| `OPIK_API_URL` | `http://127.0.0.1:5173/api` | Opik API via frontend proxy |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama HTTP API |
| `OLLAMA_MODEL` | `llama3.1:latest` | Chat model |
| `GITHUB_REPO` | `comet-ml/opik` | Issue source for ranking |
| `CONTRIBUTOR_ID` | `97115104` | Embedded in branch names |
| `BRANCH_PREFIX` | `opik-onboarding-tool-97115104-contribution` | Opik branch prefix |

Resolve tool root:

```bash
TOOL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # from scripts/
# or
TOOL_ROOT="$(cd "$(dirname "$0")" && pwd)"                     # from deploy-locally.sh
```

Default Opik path when unset:

```bash
OPIK_PATH="${OPIK_PATH:-$(dirname "$TOOL_ROOT")/opik}"
```

## Port map

| Service | Port | Health check |
|---------|------|--------------|
| Opik frontend | 5173 | `GET /` → 200 |
| Opik API | 5173/api | `GET /api/v1/private/projects` (200 or 401 = healthy) |
| Ollama | 11434 | `GET /api/tags` → 200 |
| Onboarding UI | 4310 | `GET /` → 200 |
| Chat demo | 4311 | `GET /` → 200 |

## Health proxy (onboarding UI)

Browser clients must **not** CORS-fetch Opik/Ollama/chat-demo directly. The Vite dev server exposes:

```
GET /api/health/:service
```

`:service` is one of: `opik-ui`, `opik-api`, `ollama`, `chat-demo`.

Server-side probe uses the env URLs above (prefer `127.0.0.1`). Response JSON:

```json
{ "ok": true, "status": 200, "detail": "200 OK" }
```

Opik API: treat HTTP 200 or 401 as healthy.

## CLI flags (`deploy-locally.sh`)

| Flag | Effect |
|------|--------|
| `--noninteractive` | Skip `open-browsers.sh`; require existing gh auth |
| `--skip-e2e` | Skip `run-e2e.sh` (debug only) |
| `--opik-path=PATH` | Set `OPIK_PATH` for this run |

## Path ownership (exclusive while issue open)

### Prep (closed before implement workstreams start)

- `ARCHITECTURE.md`
- `CONTRACTS.md`
- `AGENT_KICKOFF.md`

### Workstream A — deploy + scripts + chat-demo

```
deploy-locally.sh
scripts/install-deps.sh
scripts/ensure-gh-auth.sh
scripts/clone-opik.sh
scripts/ensure-ollama.sh
scripts/start-opik.sh
scripts/start-chat-demo.sh
scripts/start-onboarding-ui.sh
scripts/verify-opik-wiring.sh
scripts/open-browsers.sh
apps/chat-demo/**
```

### Workstream B — onboarding UI shell

```
apps/onboarding-ui/**
```

**Except** these C-owned paths (B must not edit):

```
apps/onboarding-ui/src/features/quiz/**
apps/onboarding-ui/src/features/issues/**
apps/onboarding-ui/src/features/prompt/**
apps/onboarding-ui/src/features/checklist/**
```

B owns health client (`lib/health.ts`) and a separate health Vite plugin (not C's contribution API plugin).

### Workstream C — contribution brain

```
apps/onboarding-ui/src/features/quiz/**
apps/onboarding-ui/src/features/issues/**
apps/onboarding-ui/src/features/prompt/**
apps/onboarding-ui/src/features/checklist/**
scripts/rank-issues.sh
scripts/create-contribution-branch.sh
```

Checklist feature folder is repurposed as **PR-help** (same path prefix; UX is a second Cursor prompt, not multi-checkbox busywork).

### Workstream D — docs + content

```
README.md
CONTRIBUTING.md
content/**
docs/**
```

### Workstream E — Playwright e2e

```
e2e/**
scripts/run-e2e.sh
```

### Read-only for all implementers

- `ARCHITECTURE.md`, `CONTRACTS.md`, `AGENT_KICKOFF.md` (after Prep closes)
- Other workstreams' owned paths

## Persona + contribution snapshot

```ts
type Persona = 'engineer' | 'pm' | 'support' | 'external'

interface ContributionSnapshot {
  persona: Persona | null
  /** Derived: persona === 'engineer' || persona === 'external' */
  isEngineer: boolean
  selectedIssue: RankedIssue | null
  branchName: string | null
  quizPassed: boolean
}
```

- About you step sets `persona` and persists it in `localStorage`.
- Everyone still walks contribution steps; non-engineers get simpler copy and easier issue ranking.

## Wizard step order

| Step | id | testId | Owner |
|------|-----|--------|-------|
| About you | `about` | `step-about` | B |
| Overview | `overview` | `step-overview` | B |
| Knowledge graph | `graph` | `step-graph` | B |
| Local stack | `stack` | `step-stack` | B |
| Tour | `tour` | `step-tour` | B |
| Quiz | `quiz` | `step-quiz` | C |
| Issues (1+2) | `issues` | `step-issues` | C |
| Cursor prompt | `prompt` | `step-prompt` | C |
| PR help | `pr-help` | `step-pr-help` | C |
| Extend | `extend` | `step-extend` | B |

## Script contracts

### `scripts/rank-issues.sh` (C)

```bash
# Usage: rank-issues.sh [--limit N] [--label LABEL] [--persona PERSONA]
# Output: JSON array to stdout
# [{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...], "plainExplanation": "..." }]
```

- Prefer `good first issue`, `help wanted`
- Penalize items with assignee
- `--persona=pm|support`: stronger weight on docs / good-first; deprioritize infra / Docker / hardware-style bugs
- `--persona=engineer|external`: current ranking with optional advanced labels
- Sort by score descending; default limit 10

Vite plugin: `GET /api/ranked-issues?limit=10&persona=pm` forwards `persona` to the script.

### `scripts/create-contribution-branch.sh` (C)

```bash
# Usage: create-contribution-branch.sh [--issue NUMBER]
# Output: branch name on stdout; creates branch in OPIK_PATH from origin/main
# Pattern: opik-onboarding-tool-97115104-contribution-{N}
```

### `scripts/run-e2e.sh` (E)

- `bunx playwright install chromium` if needed
- `cd e2e && bunx playwright test`
- Exit non-zero on failure

## UI data-testid contract (for e2e)

| Step / control | testid |
|----------------|--------|
| Wizard nav next | `wizard-next` |
| Wizard nav back | `wizard-back` |
| About you panel | `step-about` |
| Persona choice | `about-persona-engineer`, `about-persona-pm`, `about-persona-support`, `about-persona-external` |
| Overview panel | `step-overview` |
| Graph panel | `step-graph` |
| Stack status | `step-stack` |
| Tour panel | `step-tour` |
| Quiz panel | `step-quiz` |
| Quiz option | `quiz-option-{index}` |
| Quiz next question | `quiz-next-question` |
| Quiz results summary | `quiz-results` |
| Issue list | `issue-list` |
| Recommended issue | `issue-recommended` |
| Alternative issue | `issue-alternative-0`, `issue-alternative-1` |
| Issue select | `issue-select-{number}` |
| Open Cursor command | `open-cursor-command` |
| Cursor prompt | `cursor-prompt` |
| Copy prompt button | `copy-prompt` |
| PR help step | `step-pr-help` |
| PR help prompt | `pr-help-prompt` |
| Extend panel | `step-extend` |

**Retired (must not appear in UI):** `quiz-submit`, `engineer-flag`, `pr-checklist`, `step-checklist`.

Optional (may remain for wrong-answer UX): `quiz-show-answer`.

## Quiz contract (`content/quiz.json`)

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Shown after grading when wrong; brief confirm when right."
    }
  ],
  "passThreshold": 4,
  "totalQuestions": 5
}
```

Behavior:

- Selecting an option **auto-grades** immediately (no Submit).
- Primary in-quiz action: **Next question** (`quiz-next-question`), only after graded.
- After last question: results panel (`quiz-results`) with score, missed questions + explanations, pass/fail vs threshold.
- While quiz step is active and not finished, wizard footer **Next** (`wizard-next`) is hidden or disabled.
- After results, footer Next continues the wizard.

## Issues UI contract (C)

- Fetch ranked list (limit ~5–10).
- Present **1 recommended** (`issue-recommended`) + **2 alternatives** (`issue-alternative-0`, `issue-alternative-1`).
- Each item has a plain-language explanation (from title/labels; simpler for non-engineers).
- Hide raw score noise; labels only if useful.

## Cursor prompt template (C generates)

Primary prompt step must include:

- Copyable open-repo command (`open-cursor-command`), e.g. `cursor "$OPIK_PATH"` plus `cd` fallback, using real path from contribution API / env
- Assigned issue number, title, URL
- Branch name matching `opik-onboarding-tool-97115104-contribution-\d+`
- Opik clone path `OPIK_PATH`
- Steps: implement fix, run relevant tests, draft PR via `gh pr create --draft`
- AI disclosure + attestation checkbox reference
- Link to Opik CONTRIBUTING.md fast path
- Shorter body; simpler tone for PM/Support

## PR-help prompt (replaces checklist)

Step `pr-help` (`step-pr-help`):

1. Brief plain-language "What is a PR?" (2–3 sentences).
2. Secondary copy-paste Cursor prompt (`pr-help-prompt`) that walks: checkout branch, run checks, `gh pr create --draft`, fill template, AI disclosure, attestation.

No multi-checkbox busywork. Align guidance with Opik CONTRIBUTING:

1. Tracked issue linked (`Fixes #...` or `Resolves #...`)
2. Branch name: onboarding branch or `{username}/{ticket}-{summary}`
3. Draft PR: `gh pr create --draft`
4. Fill `.github/pull_request_template.md`
5. Run formatters/linters/tests for touched area
6. AI assistance disclosed if used
7. Attestation: human author accountable

## E2E test contract

| Spec | Minimum assertions |
|------|-------------------|
| `deploy-smoke.spec.ts` | HTTP 200 on ports 4310, 4311, 5173; `[data-testid=step-about]` visible |
| `chat-opik-wiring.spec.ts` | Send message; response received; Opik trace exists |
| `onboarding-wizard.spec.ts` | About you → quiz auto-grade → 1+2 issues → primary + PR-help prompts; branch regex on `[data-testid=cursor-prompt]` |

Playwright base URL for onboarding UI: `http://localhost:4310`.

## Copy rules

- No em dashes (`—`) in UI-facing strings or `content/*`.
- Prefer commas, periods, or colons.

## Bun package conventions

Each JS package (`apps/onboarding-ui`, `apps/chat-demo`, `e2e`) has:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

Root has no `package.json` — orchestration is Bash-only.

## Version

Contract version: **1.1.0** (UX-Prep / UX overhaul)

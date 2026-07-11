# Contracts — Opik Onboarding Tool

**Locked decisions.** Implementers read this file; only Prep (or an explicit reopen issue) may edit it while workstreams A–E are open.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPIK_PATH` | `<parent-of-tool>/opik` | Absolute path to Opik clone |
| `ONBOARDING_UI_PORT` | `4310` | Onboarding wizard dev server |
| `CHAT_DEMO_PORT` | `4311` | Chat demo dev server |
| `OPIK_FRONTEND_URL` | `http://localhost:5173` | Opik UI (from `opik.sh`) |
| `OPIK_API_URL` | `http://localhost:5173/api` | Opik API via frontend proxy |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama HTTP API |
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
| Opik API | 5173/api | `GET /api/v1/private/projects` or documented health |
| Ollama | 11434 | `GET /api/tags` → 200 |
| Onboarding UI | 4310 | `GET /` → 200 |
| Chat demo | 4311 | `GET /` → 200 |

## CLI flags (`deploy-locally.sh`)

| Flag | Effect |
|------|--------|
| `--noninteractive` | Skip `open-browsers.sh`; require existing gh auth |
| `--skip-e2e` | Skip `run-e2e.sh` (debug only) |
| `--opik-path=PATH` | Set `OPIK_PATH` for this run |

## Path ownership (exclusive while issue open)

### Prep (closed before A–E start)

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

**A also creates stub files** (executable, `--help` only) for C-owned scripts:

```
scripts/rank-issues.sh          → stub until C implements
scripts/create-contribution-branch.sh → stub until C implements
```

Stubs must exit 0 with message: `Not implemented — workstream C`.

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

B provides empty route placeholders / lazy imports for C features.

### Workstream C — contribution brain

```
apps/onboarding-ui/src/features/quiz/**
apps/onboarding-ui/src/features/issues/**
apps/onboarding-ui/src/features/prompt/**
apps/onboarding-ui/src/features/checklist/**
scripts/rank-issues.sh
scripts/create-contribution-branch.sh
```

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

## Script contracts

### `scripts/install-deps.sh`

- Detect Linux vs macOS
- Install Bun if missing: `curl -fsSL https://bun.sh/install | bash`
- Ensure `~/.bun/bin` on PATH; verify `bun --version`
- Install/verify Docker, `gh`, Ollama; Playwright OS libraries
- Run `bun install` in `apps/onboarding-ui`, `apps/chat-demo`, `e2e`

### `scripts/ensure-gh-auth.sh`

- If `gh auth status` fails → `gh auth login` (HTTPS, GitHub.com)
- Poll until auth succeeds; verify with `gh api user`
- Respect `--noninteractive`: fail fast if not authenticated

### `scripts/clone-opik.sh`

- Clone `https://github.com/comet-ml/opik.git` if `OPIK_PATH` missing/invalid
- Verify: `.git`, executable `opik.sh`, `git rev-parse HEAD`
- If exists: optional `git fetch`; never `reset --hard` or destroy work

### `scripts/ensure-ollama.sh`

- Install Ollama if needed; start `ollama serve` in background
- `ollama pull llama3.1:latest`
- Smoke: `ollama run llama3.1:latest "hi"` or API generate

### `scripts/start-opik.sh`

- `cd "$OPIK_PATH" && ./opik.sh` (background)
- Poll `OPIK_FRONTEND_URL` until 200 or timeout with logs

### `scripts/start-chat-demo.sh`

- `cd apps/chat-demo && bun run dev -- --port "$CHAT_DEMO_PORT"`
- Env: `OLLAMA_URL`, `OPIK_API_URL`, Opik project/workspace per SDK docs

### `scripts/start-onboarding-ui.sh`

- `cd apps/onboarding-ui && bun run dev -- --port "$ONBOARDING_UI_PORT"`

### `scripts/verify-opik-wiring.sh`

- POST chat message to chat-demo API or UI
- Assert trace appears in Opik (REST or UI scrape) within 60s

### `scripts/rank-issues.sh` (C)

```bash
# Usage: rank-issues.sh [--limit N] [--label LABEL]
# Output: JSON array to stdout
# [{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...] }]
```

Ranking heuristic (minimum):

- Prefer `good first issue`, `help wanted`
- Penalize items with assignee
- Sort by score descending; default limit 10

Uses `gh issue list --repo comet-ml/opik --json number,title,url,labels,assignees`.

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

| Step | testid |
|------|--------|
| Wizard nav next | `wizard-next` |
| Wizard nav back | `wizard-back` |
| Overview panel | `step-overview` |
| Graph panel | `step-graph` |
| Stack status | `step-stack` |
| Tour panel | `step-tour` |
| Quiz panel | `step-quiz` |
| Quiz option | `quiz-option-{index}` |
| Quiz submit | `quiz-submit` |
| Quiz show-answer | `quiz-show-answer` |
| Engineer flag toggle | `engineer-flag` |
| Issue list | `issue-list` |
| Issue select | `issue-select-{number}` |
| Cursor prompt | `cursor-prompt` |
| Copy prompt button | `copy-prompt` |
| PR checklist | `pr-checklist` |
| Extend panel | `step-extend` |

## Quiz contract (`content/quiz.json`)

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Shown after wrong answer or show-answer click."
    }
  ],
  "passThreshold": 4,
  "totalQuestions": 5
}
```

Wrong answer → show explanation; allow retry or "show answer" per question.

## Cursor prompt template (C generates)

Must include:

- Assigned issue number, title, URL
- Branch name matching `opik-onboarding-tool-97115104-contribution-\d+`
- Opik clone path `OPIK_PATH`
- Steps: implement fix, run relevant tests, draft PR via `gh pr create --draft`
- AI disclosure + attestation checkbox reference
- Link to Opik CONTRIBUTING.md fast path

## PR checklist items (align Opik CONTRIBUTING)

1. Tracked issue linked (`Fixes #...` or `Resolves #...`)
2. Branch name: `{username}/{ticket}-{summary}` or onboarding branch
3. Draft PR: `gh pr create --draft`
4. Fill `.github/pull_request_template.md`
5. Run formatters/linters/tests for touched area
6. AI assistance disclosed if used
7. Attestation: human author accountable

## E2E test contract

| Spec | Minimum assertions |
|------|-------------------|
| `deploy-smoke.spec.ts` | HTTP 200 on ports 4310, 4311, 5173; `[data-testid=step-overview]` visible |
| `chat-opik-wiring.spec.ts` | Send message; response received; Opik trace exists |
| `onboarding-wizard.spec.ts` | Full wizard through prompt; branch regex on `[data-testid=cursor-prompt]` |

Playwright base URL for onboarding UI: `http://localhost:4310`.

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

Contract version: **1.0.0** (Prep issue)

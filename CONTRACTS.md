# Contracts — Opik Onboarding Tool

**Locked decisions.** Implementers read this file; only Prep (or an explicit reopen issue) may edit it while workstreams are open.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPIK_PATH` | `<parent-of-tool>/opik` | Absolute path to Opik clone |
| `ONBOARDING_UI_PORT` | `4310` | Onboarding wizard dev server |
| `CHAT_DEMO_PORT` | `4311` | Chat demo dev server |
| `CHAT_DEMO_URL` | `http://127.0.0.1:4311` | Chat demo base URL (health proxy + clients) |
| `OPIK_FRONTEND_URL` | `http://127.0.0.1:5173` | Opik UI (from `opik.sh`) |
| `OPIK_API_URL` | `http://127.0.0.1:5173/api` | Opik API via frontend proxy |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama HTTP API |
| `OLLAMA_MODEL` | `llama3.1:latest` | Chat model |
| `GITHUB_REPO` | `comet-ml/opik` | Issue source for ranking |
| `CONTRIBUTOR_ID` | authenticated `gh` login | Opik branch `{username}` segment (override) |

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

Server-side probe map (prefer `127.0.0.1` env URLs):

| service | Probe URL |
|---------|-----------|
| `opik-ui` | `OPIK_FRONTEND_URL` `GET /` |
| `opik-api` | `OPIK_API_URL` `GET /v1/private/projects` (200 or 401 = healthy) |
| `ollama` | `OLLAMA_URL` `GET /api/tags` |
| `chat-demo` | `CHAT_DEMO_URL` `GET /` |

Response JSON (always HTTP 200 from the proxy itself):

```json
{ "ok": true, "status": 200, "detail": "200 OK" }
```

When the upstream is down: `{ "ok": false, "status": 0, "detail": "<error>" }`.
When upstream returns a non-healthy status: `{ "ok": false, "status": <code>, "detail": "..." }`.

Opik API: treat HTTP 200 or 401 as healthy.

## Opik project URL proxy (onboarding UI)

The tour resolves its `chat-demo` project through the same-origin Vite server:

```
GET /api/opik/project-url?project_name=chat-demo&destination=logs
```

The server sends `POST {OPIK_API_URL}/v1/private/projects/retrieve` with `{ "name": "<project_name>" }`. A resolved project returns:

```json
{ "found": true, "url": "http://127.0.0.1:5173/default/projects/<projectId>/logs?logsType=traces", "projectId": "<projectId>" }
```

If the project does not yet exist or Opik is unavailable, the endpoint still returns HTTP 200 with `{ "found": false, "url": "http://127.0.0.1:5173/default/redirect/projects?name=<project_name>" }`. The redirect lets the CTA work after the first chat trace creates the project.

## Heal endpoint (onboarding UI)

When a stack service is unhealthy, the wizard may auto-heal and expose a Fix button:

```
POST /api/heal/:service
```

`:service` is the same set as health: `opik-ui`, `opik-api`, `ollama`, `chat-demo`.

Server behavior (fire-and-forget spawn of repo scripts):

| service | Script |
|---------|--------|
| `opik-ui`, `opik-api` | `scripts/start-opik.sh` (coalesced: one in-flight heal for both) |
| `ollama` | Light serve restart (`ollama serve` if `/api/tags` fails); full pull/smoke stays in `ensure-ollama.sh` |
| `chat-demo` | `scripts/start-chat-demo.sh` |

Response JSON:

```json
{ "ok": true, "service": "ollama", "detail": "Heal started" }
```

Clients should re-poll `GET /api/health/:service` after a short delay.

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
apps/onboarding-ui/src/features/verify/**
apps/onboarding-ui/src/steps/ContributingOverviewStep.tsx
apps/onboarding-ui/src/content/contributingSlides.ts
```

B owns health client (`lib/health.ts`) and a separate health Vite plugin (not C's contribution API plugin).

### Workstream C — contribution brain

```
apps/onboarding-ui/src/features/quiz/**
apps/onboarding-ui/src/features/issues/**
apps/onboarding-ui/src/features/prompt/**
apps/onboarding-ui/src/features/checklist/**
apps/onboarding-ui/src/features/verify/**
apps/onboarding-ui/src/steps/ContributingOverviewStep.tsx
apps/onboarding-ui/src/content/contributingSlides.ts
scripts/rank-issues.sh
scripts/create-contribution-branch.sh
```

Checklist feature folder is repurposed as **PR-help** (same path prefix; UX is a second Cursor prompt, not multi-checkbox busywork). Verify sits between Cursor prompt and PR help.

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
  /** Derived: persona === 'engineer' || persona === 'external'; false when persona is null */
  isEngineer: boolean
  selectedIssue: RankedIssue | null
  branchName: string | null
  quizPassed: boolean
  /** True after quiz results panel; B hides wizard-next while quiz is active and this is false */
  quizFinished: boolean
  /** True after contributing quiz results; B hides wizard-next while that step is active and this is false */
  contributingQuizFinished: boolean
}
```

- About you step sets `persona` and persists it in `localStorage`.
- Everyone still walks contribution steps; non-engineers get simpler copy and easier issue ranking.

## Wizard step order

| Step | id | testId | Owner |
|------|-----|--------|-------|
| About you | `about` | `step-about` | B |
| Overview | `overview` | `step-overview` | B |
| Opik Features | `graph` | `step-graph` | B |
| Local stack | `stack` | `step-stack` | B |
| Try Opik | `tour` | `step-tour` | B |
| Quiz | `quiz` | `step-quiz` | C |
| Contributing overview | `contributing-overview` | `step-contributing-overview` | C |
| Contributing quiz | `contributing-quiz` | `step-contributing-quiz` | C |
| Issues (1+2) | `issues` | `step-issues` | C |
| Cursor prompt | `prompt` | `step-prompt` | C |
| Verify | `verify` | `step-verify` | C |
| PR help | `pr-help` | `step-pr-help` | C |
| Extend | `extend` | `step-extend` | B |
| Finish (celebration) | `finish` | `step-finish` | B |

### Wizard gating rules

| Step | Footer Next / Finish |
|------|----------------------|
| `about` | Hidden until a persona is selected |
| `overview` | Enabled on mid-deck slides via wizard Next; leaving the step requires the last overview slide (`reachedLast`) |
| `graph` | Hidden until every Opik Features node is reviewed (modal close) |
| `tour` | Hidden until all tour steps are done (CTA click auto-completes; checkbox still works) |
| `quiz` | Hidden until quiz results (`quizFinished`) |
| `contributing-overview` | Enabled on mid-deck slides via wizard Next; leaving the step requires the last slide **and** in-slide CLA agree **and** contributing guidelines agree (`claAgreed` + `guidelinesAgreed` + `reachedLast`) |
| `contributing-quiz` | Hidden until contributing quiz results (`contributingQuizFinished`); finish unlocks even if the score is below threshold |
| `issues` | Next disabled until an issue is confirmed |
| `verify` | Hidden until checklist (`verify-check-ran-local` + `verify-check-matches-issue`) |
| `extend` | Footer label is **Finish**; advances to celebration |
| `finish` | Footer Next/Finish hidden; Back returns to Extend; progress reads Complete |

Overview slides source: `apps/onboarding-ui/src/content/overviewSlides.ts` (keep `content/overview.md` aligned). Wizard footer Back/Next drives slide navigation (no in-card prev/next).

Contributing overview slides source: `apps/onboarding-ui/src/content/contributingSlides.ts` (keep `content/contributing-overview.md` aligned). Content describes upstream Opik (`comet-ml/opik`), not this onboarding-tool repo. Slide 1 embeds vendored `content/cla.md` with scroll-to-bottom agree (`contributing-cla-document`, `contributing-cla-agree`). Slide 2 embeds vendored `content/contributing-guidelines.md` with scroll-to-bottom agree (`contributing-guidelines-document`, `contributing-guidelines-agree`). Wizard Next on those slides stays disabled until the checkbox is checked after scrolling. Honor-system note: wizard agree prepares onboarding; GitHub CLA bot still applies on PRs.

Opik Features unlock: nodes unlock in `knowledge-graph.json` array order; locked nodes are greyed and not clickable.

## Script contracts

### `scripts/install-deps.sh` (A)

- Detect Linux vs macOS; install Bun if missing; ensure Docker, `gh`, Ollama, Playwright OS libs
- `bun install` in `apps/onboarding-ui`, `apps/chat-demo`, `e2e`

### `scripts/ensure-gh-auth.sh` (A)

- Block until `gh auth status` succeeds; `--noninteractive` fails fast if unauthenticated

### `scripts/clone-opik.sh` (A)

- Ensure `OPIK_PATH` is a valid Opik checkout; never `reset --hard` or destroy work

### `scripts/ensure-ollama.sh` (A)

- Serve Ollama; pull `llama3.1:latest`

### `scripts/start-opik.sh` (A)

- Run `./opik.sh` in `OPIK_PATH`; poll frontend until healthy

### `scripts/start-chat-demo.sh` (A)

- Start chat-demo on `CHAT_DEMO_PORT` with `OLLAMA_URL` / `OPIK_API_URL`

### `scripts/start-onboarding-ui.sh` (A)

- Start onboarding UI on `ONBOARDING_UI_PORT`
- May pass `OPIK_FRONTEND_URL`, `OPIK_API_URL`, `OLLAMA_URL`, `CHAT_DEMO_URL`, `OPIK_PROJECT_NAME` into the process env for the health proxy
- Maps server env to browser `VITE_*` vars: `VITE_OPIK_FRONTEND_URL`, `VITE_OPIK_API_URL`, `VITE_OLLAMA_URL`, `VITE_CHAT_DEMO_URL`, `VITE_OPIK_PROJECT_NAME`

### `scripts/verify-opik-wiring.sh` (A)

- Assert a chat-demo message produces an Opik trace within 60s

### `scripts/rank-issues.sh` (C)

```bash
# Usage: rank-issues.sh [--limit N] [--label LABEL] [--persona PERSONA]
# Output: JSON array to stdout
# [{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...], "plainExplanation": "...", "excerpt": "..." }]
```

- Prefer `good first issue`, `help wanted`, and docs for **all** personas (first-time contributor bias)
- Penalize items with assignee
- Harder penalty for infra / Docker / hardware, multi-SDK / ADK-style titles, and long integration bugs
- Soft prefer shorter issue bodies
- `--persona=pm|support`: plain-language explanations; same first-time ranking bias
- `--persona=engineer|external`: same first-time ranking bias; explanations may be more technical
- Sort by score descending; default limit 10
- Data source: `gh issue list --repo comet-ml/opik --json number,title,url,labels,assignees,body`
- Optional `excerpt`: issue body (up to ~4000 chars) for the issues detail modal (rendered as markdown)

Vite plugin: `GET /api/ranked-issues?limit=10&persona=pm` forwards `persona` to the script.

Vite plugin contribution APIs (C):

| Endpoint | Response | Notes |
|----------|----------|-------|
| `GET /api/contribution-branch?issue={N}&summary={slug}` | `{ branch }` | Creates/checks out Opik branch via `create-contribution-branch.sh` |
| `GET /api/contributor` | `{ username }` | `CONTRIBUTOR_ID` if set, else authenticated `gh` login |
| `GET /api/opik-path` | `{ path }` | Resolved `OPIK_PATH` |
| `GET /api/contribution-diff` | `{ paths, branch }` | Diff vs `origin/main` (see Verify step) |

### `scripts/create-contribution-branch.sh` (C)

```bash
# Usage: create-contribution-branch.sh [--issue NUMBER] [--summary SLUG]
# Output: branch name on stdout; creates branch in OPIK_PATH from origin/main
# Pattern: {username}/{ticket}-{summary} (Opik CONTRIBUTING)
#   username = CONTRIBUTOR_ID if set, else gh api user login
#   ticket   = issue-{NUMBER} when --issue is set, else NA
#   summary  = slug from --summary (default: onboarding)
# Idempotent: checkout local branch, or track origin/{branch} if remote-only, else create from origin/main
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
| Overview slides | `overview-slides` |
| Overview slide | `overview-slide-{id}` |
| Overview role tile | `overview-role-{id}` |
| Graph panel | `step-graph` |
| Graph empty hint | `graph-empty-hint` |
| Graph progress | `graph-progress` |
| Graph node button | `graph-node-{id}` |
| Graph detail modal | `graph-detail-modal` |
| Graph detail modal close | `graph-detail-modal-close` |
| Stack status | `step-stack` |
| Stack service URL | `stack-url-{service}` |
| Stack fix button | `stack-fix-{service}` |
| Tour panel | `step-tour` |
| Tour checklist | `tour-checklist` |
| Tour progress | `tour-progress` |
| Tour open Opik CTA | `tour-open-opik` |
| Tour open chat CTA | `tour-open-chat` |
| Tour open traces CTA | `tour-open-traces` |
| Tour checkbox | `tour-check-{id}` |
| Step error boundary | `step-error-boundary` |
| Step error retry | `step-error-retry` |
| Quiz panel | `step-quiz` |
| Quiz option | `quiz-option-{index}` |
| Quiz next question | `quiz-next-question` |
| Quiz results summary | `quiz-results` |
| Contributing overview panel | `step-contributing-overview` |
| Contributing slides | `contributing-slides` |
| Contributing slide | `contributing-slide-{id}` |
| Contributing CLA document panel | `contributing-cla-document` |
| Contributing CLA agree checkbox | `contributing-cla-agree` |
| Contributing guidelines document panel | `contributing-guidelines-document` |
| Contributing guidelines agree checkbox | `contributing-guidelines-agree` |
| Overview Did you know | `slide-did-you-know` |
| Opik brand logo (header) | `opik-brand-logo` |
| Contributing quiz panel | `step-contributing-quiz` |
| Contributing quiz option | `contributing-quiz-option-{index}` |
| Contributing quiz next question | `contributing-quiz-next-question` |
| Contributing quiz results | `contributing-quiz-results` |
| Issues panel | `step-issues` |
| Issue list | `issue-list` |
| Recommended issue | `issue-recommended` |
| Issue detail modal | `issue-detail-modal` |
| Issue excerpt | `issue-excerpt` |
| Issue time estimate | `issue-time-estimate` |
| Issue GitHub link | `issue-github-link` |
| Issue confirm select | `issue-confirm-select` |
| Alternative issue | `issue-alternative-0`, `issue-alternative-1` |
| Issue select | `issue-select-{number}` |
| Prompt panel | `step-prompt` |
| Open Cursor command | `open-cursor-command` |
| Open prompt in Cursor | `open-cursor-prompt` |
| Open prompt truncated notice | `open-cursor-prompt-truncated` |
| Cursor prompt | `cursor-prompt` |
| Copy prompt button | `copy-prompt` |
| Verify panel | `step-verify` |
| Verify area | `verify-area`, `verify-area-name`, `verify-area-rationale` |
| Verify commands | `verify-commands` |
| Verify workflows | `verify-workflows` |
| Verify prompt | `verify-prompt` |
| Open verify prompt in Cursor | `open-verify-prompt` |
| Open verify prompt truncated notice | `open-verify-prompt-truncated` |
| Copy verify prompt | `copy-verify-prompt` |
| Verify checklist | `verify-checklist` |
| Verify checklist items | `verify-check-ran-local`, `verify-check-matches-issue` |
| PR help step | `step-pr-help` |
| PR help prompt | `pr-help-prompt` |
| Extend panel | `step-extend` |
| Finish celebration | `step-finish` |
| Finish fireworks canvas | `finish-fireworks` |
| Finish Opik GitHub link | `finish-opik-github` |
| Finish support email | `finish-support-email` |

**Retired (must not appear in UI):** `quiz-submit`, `engineer-flag`, `pr-checklist`, `step-checklist`, `quiz-show-answer`, `graph-got-it`, `tour-open-spans`, `overview-slide-prev`, `overview-slide-next`, `contributing-slide-prev`, `contributing-slide-next`, `contributing-open-cla`, `contributing-cla-checklist`, `contributing-check-cla`, `contributing-cla-opened-elsewhere`.

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

## Contributing quiz contract (`content/contributing-quiz.json`)

Same JSON shape and auto-grade behavior as `content/quiz.json` (`passThreshold` 4, five questions). Topics cover CLA, `Fixes #...` issue linking, GitHub Actions in the SDLC, staying in the component area, and human accountability for AI-assisted work.

- Testids: `step-contributing-quiz`, `contributing-quiz-option-{index}`, `contributing-quiz-next-question`, `contributing-quiz-results`.
- Gate: `contributingQuizFinished` (contribution store + `opik-contributing-quiz-finished` localStorage). Finish unlocks footer Next even if the score is below threshold.

## Issues UI contract (C)

- Fetch ranked list (limit ~5–10).
- Present **1 recommended** (`issue-recommended`) + **2 alternatives** (`issue-alternative-0`, `issue-alternative-1`).
- Each item has a plain-language explanation (from title/labels; simpler for non-engineers).
- Issue detail modal renders `excerpt`/`body` as markdown (`issue-excerpt` via Markdown + remark-gfm).
- Hide raw score noise; labels only if useful.

## Cursor prompt template (C generates)

Primary prompt step must include:

- Primary CTA: **Open prompt in Cursor** (`open-cursor-prompt`) via `cursor://anysphere.cursor-deeplink/prompt?text=…` (URL length ≤ 8000; if over, shorten deeplink text and keep full prompt in Copy)
- Copyable open-repo command (`open-cursor-command`), e.g. `cursor "$OPIK_PATH"` plus `cd` fallback, using real path from contribution API / env
- Copy prompt button (`copy-prompt`) as fallback
- Assigned issue number, title, URL
- Branch name matching Opik `{username}/{ticket}-{summary}` (`ticket` = `issue-{N}`, `OPIK-{N}`, or `NA`; legacy `opik-onboarding-tool-*-contribution-\d+` still accepted in soft checks)
- Opik clone path `OPIK_PATH`
- Steps: implement fix and commit; stop before draft PR (verify + PR-help cover checks and `gh pr create --draft`)
- AI disclosure note (full disclosure happens in PR template)
- Link to Opik CONTRIBUTING.md fast path
- Shorter body; simpler tone for PM/Support
- Note: user confirms the prompt in Cursor; open the Opik folder first if the workspace is not already open

## Verify step (pre-PR checks)

Step `verify` (`step-verify`) sits between `prompt` and `pr-help`:

1. Classify contribution area from optional `GET /api/contribution-diff` paths (override) or issue labels/title.
2. Show area + rationale, copyable local commands, and GitHub Actions workflow links to watch.
3. Verify Cursor prompt (`verify-prompt` / `open-verify-prompt` / `copy-verify-prompt`) asking the agent to run those checks under `OPIK_PATH`.
4. Honor-system checklist gate: `verify-check-ran-local` + `verify-check-matches-issue` before footer Next.

Optional API: `GET /api/contribution-diff` returns `{ paths: string[], branch: string }` from `git diff --name-only origin/main...HEAD` (fallback `git status --porcelain`). No test execution.

## PR-help prompt (replaces checklist)

Step `pr-help` (`step-pr-help`):

1. Brief plain-language "What is a PR?" (2–3 sentences).
2. Secondary copy-paste Cursor prompt (`pr-help-prompt`) that walks: checkout branch, run checks, `gh pr create --draft`, fill template, AI disclosure, attestation.

No multi-checkbox busywork. Align guidance with Opik CONTRIBUTING:

1. Tracked issue linked (`Fixes #...` or `Resolves #...`)
2. Branch name: Opik `{username}/{ticket}-{summary}` where `{username}` is the contributor's GitHub handle (`CONTRIBUTOR_ID` override allowed)
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
| `onboarding-wizard.spec.ts` | About you → overview slides (wizard Next drives deck; last slide gates step leave) → Opik Features sequential unlock via modal close (Next gated) → stack URL → tour 3 progressive CTAs (Next gated) → Tour→Quiz stays alive (quiz Next hidden until finished) → quiz auto-grade → contributing overview slides (CLA + guidelines scroll-and-agree unlock wizard Next; step leave gated) → contributing quiz auto-grade (Next gated) → issue modal select → open-cursor-prompt → verify plan + checklist unlocks Next → PR-help prompts → Extend Finish → Well done celebration with ✓ Finish label; branch regex on `[data-testid=cursor-prompt]` |

Playwright base URL for onboarding UI: `http://127.0.0.1:4310`.

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

Contract version: **1.6.0** (unified slide nav, in-slide CLA/guidelines agree, overview polish)

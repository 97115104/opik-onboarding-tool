# Contributing to the Opik Onboarding Tool

Thank you for improving the onboarding experience. This repo orchestrates local Opik, demo apps, and a wizard. It does **not** merge Opik PRs itself. Contributions here make it easier for others to land their first Opik PR.

## Before you start

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONTRACTS.md](./CONTRACTS.md): ports, path ownership, and script/UI contracts are locked there.
2. Run `./deploy-locally.sh` locally so you can exercise the wizard end-to-end.
3. Pick or open a GitHub issue on [97115104/opik-onboarding-tool](https://github.com/97115104/opik-onboarding-tool) and respect **owned paths** listed in the issue body.

## What you can extend

### Content (`content/`)

| File | Purpose | Consumed by |
|------|---------|-------------|
| `overview.md` | Product overview markdown | Wizard overview step |
| `knowledge-graph.json` | Navigable concept graph | Wizard graph step |
| `onboarding-tour.md` | Guided tour copy | Wizard tour step |
| `quiz.json` | Five-question quiz | Wizard quiz step (see schema in CONTRACTS) |

**Adding a graph node:** Edit `knowledge-graph.json`: add a `nodes` entry with unique `id`, `label`, `summary`, and optional `details` / `links`. Connect it with an `edges` entry (`source` → `target`, optional `label`). Set `rootId` to the entry node for first paint.

**Adding quiz questions:** Keep `totalQuestions` and array length aligned. Schema:

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "...",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ],
  "passThreshold": 4,
  "totalQuestions": 5
}
```

**Tour sections:** Use markdown headings (`## Step N`) so the UI can split steps. Keep copy concise: one concept per section.

### Audience docs (`docs/audiences/`)

Add or update role guides (`core-engineer.md`, `pm.md`, `support.md`, `external-contributor.md`). Link new roles from README audience table.

### Onboarding UI (`apps/onboarding-ui/`)

Owned by the UI workstream. To add a wizard step:

1. Add route key and step component under `src/` (follow existing shell patterns).
2. Register the step in the wizard nav and add a `data-testid` per [CONTRACTS.md](./CONTRACTS.md#ui-data-testid-contract-for-e2e).
3. If the step reads new content, add the file under `content/` and load it from the step.
4. Extend Playwright in `e2e/tests/onboarding-wizard.spec.ts`.

Feature areas (`quiz`, `issues`, `prompt`, `checklist`) live under `src/features/`. Coordinate to avoid path conflicts.

### Scripts (`scripts/`)

Bash scripts are orchestrated by `deploy-locally.sh`. New scripts should:

- Accept `--help` and exit 0 with usage
- Source `TOOL_ROOT` / env vars as documented in CONTRACTS
- Fail fast with actionable stderr messages
- Stay idempotent where possible (safe to re-run)

### Chat demo (`apps/chat-demo/`)

Extend to demonstrate additional Opik SDK patterns (spans, feedback scores, datasets). Run `scripts/verify-opik-wiring.sh` after changes.

### E2e (`e2e/`)

Add specs when you add user-visible behavior. Base URL for the wizard: `http://localhost:4310`. Run via `scripts/run-e2e.sh`.

## Development loop

```bash
# Full stack (recommended)
./deploy-locally.sh

# UI only (after stack is up)
cd apps/onboarding-ui && bun run dev -- --port 4310

# E2e only
scripts/run-e2e.sh
```

Use `--skip-e2e` on deploy while iterating on non-UI scripts; run e2e before opening a PR.

## Pull request checklist

1. Link the tracking issue (`Fixes #N` or `Resolves #N`)
2. Touch only paths you own per the issue
3. Run `./deploy-locally.sh` or at minimum `scripts/run-e2e.sh` if UI/scripts changed
4. Update README or this file if you add content paths, env vars, or wizard steps
5. Disclose AI assistance if used; human author remains accountable

## Contract changes

Do **not** silently edit `CONTRACTS.md` or `ARCHITECTURE.md` during a feature issue. Open a Prep/fix issue if ports, schemas, or ownership need to change.

## Getting help

- Opik product docs: https://www.comet.com/docs/opik/
- Opik contributing: https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md
- This repo issues: https://github.com/97115104/opik-onboarding-tool/issues

# Core Engineer Guide

For backend, frontend, ML, and platform engineers contributing code to **comet-ml/opik** or integrating Opik into applications.

## Your path through the onboarding tool

1. Run `./deploy-locally.sh` — only sudo, GitHub device code, and (on Mac) Docker Desktop need manual attention
2. Complete **Overview**, **Knowledge graph**, and **Tour** — focus on tracing, spans, and SDK integration nodes
3. Pass the **Quiz** (4/5) to confirm you understand local stack wiring
4. Enable the **engineer flag** and accept a ranked GitHub issue
5. Copy the **Cursor prompt** — it includes `OPIK_PATH`, branch name, and PR steps
6. Implement in the **Opik repo** (`OPIK_PATH`), not this tool repo

## Local development essentials

| Component | Location / command |
|-----------|-------------------|
| Opik clone | `$OPIK_PATH` (default `../opik`) |
| Start Opik | `cd "$OPIK_PATH" && ./opik.sh` |
| Opik UI | http://localhost:5173 |
| API (via proxy) | http://localhost:5173/api |
| Chat demo source | `apps/chat-demo/` in this tool repo |

After changing Opik backend or frontend code, restart `./opik.sh` or the relevant Docker compose service. Use traces from the chat demo to validate SDK or API changes quickly.

## Tracing in your own code

**Python:**

```python
import opik

opik.configure(use_local=True)  # or project URL + API key for cloud

@opik.track
def my_llm_step(prompt: str) -> str:
    ...
```

**TypeScript:** follow the [TypeScript SDK docs](https://www.comet.com/docs/opik/tracing/sdk/typescript/) — the chat demo in this repo is a minimal reference implementation.

Prefer small, focused spans — one per LLM call, tool, or retrieval step — so trace trees remain readable.

## Picking and implementing an issue

The wizard ranks open Opik issues favoring `good first issue` and `help wanted`, deprioritizing assigned tickets.

When implementing:

1. Branch: `opik-onboarding-tool-97115104-contribution-{N}` (created for you) or `{username}/{ticket}-{summary}` per Opik CONTRIBUTING
2. Link the issue: `Fixes #1234` in commit/PR body
3. Run formatters, linters, and tests for touched packages
4. Open a **draft** PR: `gh pr create --draft`

## Testing expectations

| Area | Typical command |
|------|-----------------|
| Python SDK / backend | `pytest` in affected module (see Opik CONTRIBUTING) |
| Frontend | `npm`/`pnpm` scripts in Opik `apps/` as documented upstream |
| This tool's e2e | `scripts/run-e2e.sh` after changing integration surfaces |

Disclose AI assistance in the PR if you used Cursor or similar tools.

## Where to go deeper

- [Opik tracing](https://www.comet.com/docs/opik/tracing/)
- [Integrations](https://www.comet.com/docs/opik/integrations/overview/)
- [PyTest + evaluation CI](https://www.comet.com/docs/opik/testing/pytest_integration/)
- [Opik CONTRIBUTING](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md)

## Extending this tool

If you improve deploy scripts, chat demo wiring, or wizard steps, see [CONTRIBUTING.md](../../CONTRIBUTING.md) in this repo and respect CONTRACTS path ownership.

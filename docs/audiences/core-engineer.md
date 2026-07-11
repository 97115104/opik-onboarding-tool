# Engineer

For backend, frontend, ML, and platform engineers contributing code to **comet-ml/opik** or integrating Opik into applications.

## Focus in the wizard

- Overview, knowledge graph, and tour: prioritize tracing, spans, and SDK integration
- Pass the quiz (4/5), then pick a ranked GitHub issue
- Copy the Cursor prompt (includes `OPIK_PATH`, branch name, and PR steps)
- Implement in the **Opik repo** (`OPIK_PATH`), not this tool repo

## Local stack

- Opik clone: `$OPIK_PATH` (default `../opik`)
- Start: `cd "$OPIK_PATH" && ./opik.sh`
- UI: http://localhost:5173
- Chat demo source: `apps/chat-demo/` in this tool repo

## Contributing

1. Branch: `opik-onboarding-tool-97115104-contribution-{N}` (or Opik CONTRIBUTING naming)
2. Link the issue with `Fixes #1234`
3. Run formatters, linters, and tests for touched packages
4. Open a draft PR: `gh pr create --draft`
5. Disclose AI assistance if you used Cursor or similar tools

Prefer small, focused spans (one per LLM call, tool, or retrieval step) so trace trees stay readable.

## Deeper reading

- [Opik tracing](https://www.comet.com/docs/opik/v1/tracing/)
- [Integrations](https://www.comet.com/docs/opik/v1/integrations/overview/)
- [Opik CONTRIBUTING](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md)

# External Contributor

For open-source contributors joining **comet-ml/opik** through this onboarding tool. No prior Comet employment required.

## First-time setup

```bash
git clone https://github.com/97115104/opik-onboarding-tool.git
cd opik-onboarding-tool
./deploy-locally.sh
```

Manual steps only: sudo password (if needed), GitHub device code during `gh auth login`, and Docker Desktop on Mac.

When deploy succeeds, work through the wizard at http://localhost:4310.

## Wizard checklist

- Read Overview and explore the knowledge graph
- Confirm Local stack is green
- Complete the Tour (chat demo to trace in Opik UI)
- Pass the Quiz (4 of 5 correct)
- Select an assigned issue and copy the Cursor prompt
- Create work in the **Opik repo**, not this tool repo

## Where your code goes

- `97115104/opik-onboarding-tool`: this wizard (only change if improving onboarding)
- `comet-ml/opik`: your contribution lives here on branch `opik-onboarding-tool-97115104-contribution-{N}`

## Contribution norms

Follow [Opik CONTRIBUTING.md](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md):

1. Link the GitHub issue (`Fixes #…`)
2. Keep PRs focused: one issue per PR when possible
3. Run relevant tests and linters
4. Open as draft first: `gh pr create --draft`
5. Disclose AI tools if you used them; you remain accountable for the code

Good first issues often carry labels like `good first issue` or `help wanted`. The wizard ranking prefers those.

## Community

- [Opik GitHub](https://github.com/comet-ml/opik)
- [Documentation](https://www.comet.com/docs/opik/v1/)
- [Slack community](https://www.comet.com/slack/opik)

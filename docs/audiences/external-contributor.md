# External Contributor Guide

For open-source contributors joining **comet-ml/opik** through this onboarding tool — no prior Comet employment required.

## Welcome

Opik is Apache-2.0 licensed with 20k+ GitHub stars. This tool lowers the setup bar: one script starts Opik, Ollama, demo apps, and a wizard that assigns you a starter issue plus a Cursor-ready prompt.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Git | Clone this repo and eventually work in the Opik clone |
| Docker | Linux: Docker Engine; macOS: **Docker Desktop must be running** |
| GitHub account | `gh auth login` — paste the device code when deploy prompts you |
| ~8 GB RAM | Opik + Ollama + models |
| sudo (Linux) | Only for first-time package installs |

## First-time setup

```bash
git clone https://github.com/97115104/opik-onboarding-tool.git
cd opik-onboarding-tool
./deploy-locally.sh
```

Manual steps only:

1. **sudo password** when installing dependencies
2. **GitHub device code** during `gh auth login`
3. **Start Docker Desktop** on Mac before or during deploy

When deploy succeeds, work through the wizard at http://localhost:4310.

## Wizard checklist for contributors

- [ ] Read **Overview** and explore the **Knowledge graph**
- [ ] Confirm **Local stack** is green
- [ ] Complete the **Tour** (chat demo → trace in Opik UI)
- [ ] Pass the **Quiz** (4 of 5 correct)
- [ ] Enable **engineer flag** and select an assigned issue
- [ ] Copy the **Cursor prompt** and create work in the **Opik repo**

## Where your code goes

| Repo | Purpose |
|------|---------|
| `97115104/opik-onboarding-tool` | This wizard — only change if you're improving onboarding itself |
| `comet-ml/opik` | **Your contribution lives here** — branch `opik-onboarding-tool-97115104-contribution-{N}` |

The tool creates an Opik branch from `origin/main`. Implement your fix there, push to your fork if needed, and open a PR against `comet-ml/opik`.

## Opik contribution norms

Follow [Opik CONTRIBUTING.md](https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md):

1. Link the GitHub issue (`Fixes #…`)
2. Keep PRs focused — one issue per PR when possible
3. Run relevant tests and linters for touched areas
4. Open as **draft** first: `gh pr create --draft`
5. Fill the PR template completely
6. Disclose AI tools if you used them; you remain accountable for the code

Good first issues often carry labels like `good first issue` or `help wanted` — the wizard ranking prefers those.

## Fork workflow (optional)

If you cannot push directly to `comet-ml/opik`:

```bash
# On GitHub: fork comet-ml/opik to your account
cd "$OPIK_PATH"
git remote add fork git@github.com:YOUR_USER/opik.git
git push fork opik-onboarding-tool-97115104-contribution-1
gh pr create --repo comet-ml/opik --draft --head YOUR_USER:opik-onboarding-tool-97115104-contribution-1
```

Replace branch and username as appropriate.

## Getting unstuck

| Problem | Try |
|---------|-----|
| Deploy fails on Docker | Ensure Docker daemon is running; see README manual steps |
| `gh` auth loops | Run `gh auth logout` then `gh auth login` again |
| Ollama slow | First run pulls `llama3.1:latest` — wait several minutes |
| No traces | Re-run deploy; check chat demo and Opik health in wizard |
| Issue too hard | Pick another ranked issue or ask on [Opik Slack](https://www.comet.com/slack/opik) |

## Improving this onboarding tool

Found a doc bug or want clearer tour copy? Open an issue on **this** repo and see [CONTRIBUTING.md](../../CONTRIBUTING.md). Content changes often live in `content/` and `docs/audiences/` with low merge friction.

## Community

- [Opik GitHub](https://github.com/comet-ml/opik)
- [Documentation](https://www.comet.com/docs/opik/)
- [Slack community](https://www.comet.com/slack/opik)

Happy first contribution!

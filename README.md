# Opik Onboarding Tool

Guide contributors from zero to a first [Opik](https://github.com/comet-ml/opik) contribution. One command deploys the local stack, walks product knowledge, assigns a ranked GitHub issue, and generates a Cursor prompt with an Opik-repo branch.

## Quick start

```bash
git clone https://github.com/97115104/opik-onboarding-tool.git
cd opik-onboarding-tool
./deploy-locally.sh
```

When deploy finishes, open the onboarding wizard at **http://localhost:4310** and follow the steps.

### What you do manually

The script automates Bun install, Opik clone, Ollama, services, and Playwright checks. You only need to intervene for:

| Step | When | What to do |
|------|------|------------|
| **sudo** | First run on a fresh machine | Enter your password when `install-deps.sh` installs system packages (Docker, Playwright OS libs, etc.) |
| **GitHub auth** | If `gh` is not logged in | Complete `gh auth login` — paste the **device code** shown in the terminal when prompted |
| **Docker Desktop (macOS)** | Before or during deploy | Install [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/) and **start it** so the Opik stack can run |

Everything else — cloning Opik, pulling `llama3.1:latest`, starting services, running e2e, opening browser tabs — is handled by the script.

### Deploy flags

| Flag | Use |
|------|-----|
| `--noninteractive` | Skip opening browsers; requires existing `gh` auth |
| `--skip-e2e` | Skip Playwright (debug only) |
| `--opik-path=PATH` | Override Opik clone location (default: sibling `../opik`) |

### Services after deploy

| Service | URL |
|---------|-----|
| Onboarding wizard | http://localhost:4310 |
| Chat demo (Ollama + Opik traces) | http://localhost:4311 |
| Opik UI | http://localhost:5173 |

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONTRACTS.md](./CONTRACTS.md) for ports, env vars, and script contracts.

## Wizard flow

1. **Overview** — What Opik is and why it matters
2. **Knowledge graph** — Navigate core product concepts
3. **Local stack** — Health of Opik, Ollama, and demo apps
4. **Tour** — Guided walkthrough of key workflows
5. **Quiz** — Five questions to confirm understanding
6. **Issue assignment** — Ranked `comet-ml/opik` issues via `gh`
7. **Cursor prompt** — Copy-paste prompt with branch `opik-onboarding-tool-97115104-contribution-{N}`
8. **PR checklist** — Tests, CI, draft PR, AI disclosure
9. **Extend** — How to improve this tool ([CONTRIBUTING.md](./CONTRIBUTING.md))

Content lives in [`content/`](./content/). Role-specific guides are in [`docs/audiences/`](./docs/audiences/).

## Audience guides

Pick the path that matches your role:

| Role | Guide | Focus |
|------|-------|-------|
| **Core engineer** | [docs/audiences/core-engineer.md](./docs/audiences/core-engineer.md) | Tracing, evaluation, local dev, first code contribution |
| **PM** | [docs/audiences/pm.md](./docs/audiences/pm.md) | Dashboards, metrics, stakeholder demos |
| **Support** | [docs/audiences/support.md](./docs/audiences/support.md) | Trace inspection, customer debugging workflows |
| **External contributor** | [docs/audiences/external-contributor.md](./docs/audiences/external-contributor.md) | Open-source setup, issue picking, PR norms |

## Extending the tool

See [CONTRIBUTING.md](./CONTRIBUTING.md) for adding wizard steps, content, scripts, and e2e coverage.

## Repository layout

```
opik-onboarding-tool/
  deploy-locally.sh       # One-shot entrypoint
  scripts/                  # Bash orchestration
  apps/onboarding-ui/       # Wizard (Vite + React)
  apps/chat-demo/           # Ollama chat with Opik SDK
  content/                  # Overview, graph, tour, quiz
  docs/audiences/           # Role-specific guides
  e2e/                      # Playwright acceptance tests
```

## License

Same as the parent challenge repository. Opik itself is [Apache-2.0](https://github.com/comet-ml/opik/blob/main/LICENSE).

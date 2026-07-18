# Opik Onboarding Tool

Guide contributors from zero to a first [Opik](https://github.com/comet-ml/opik) contribution. One command deploys the local stack, walks product knowledge, assigns a ranked GitHub issue, and generates a Cursor prompt with an Opik-repo branch.

Video demo: https://www.loom.com/share/b8b6eec7297447dfb795db25851f9fa8

## Quick start

```bash
git clone https://github.com/97115104/opik-onboarding-tool.git
cd opik-onboarding-tool
./deploy-locally.sh
```

When deploy finishes, open the onboarding wizard at **http://127.0.0.1:4310** and follow the steps.

### What you do manually

The script automates Bun install, Opik clone, Ollama, services, and Playwright checks. You only need to intervene for:

| Step | When | What to do |
|------|------|------------|
| **sudo** | First run on a fresh machine | Enter your password when `install-deps.sh` installs system packages (Docker, Playwright OS libs, etc.) |
| **GitHub auth** | If `gh` is not logged in | Complete `gh auth login`: paste the **device code** shown in the terminal when prompted |
| **Docker Desktop (macOS)** | Before or during deploy | Install [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/) and **start it** so the Opik stack can run |

Everything else (cloning Opik, pulling `llama3.1:latest`, starting services, running e2e, opening browser tabs) is handled by the script.

### Deploy flags

| Flag | Use |
|------|-----|
| `--noninteractive` | Skip opening browsers; requires existing `gh` auth |
| `--skip-e2e` | Skip Playwright (debug only) |
| `--opik-path=PATH` | Override Opik clone location (default: sibling `../opik`) |

### Services after deploy

| Service | URL |
|---------|-----|
| Onboarding wizard | http://127.0.0.1:4310 |
| Chat demo (Ollama + Opik traces) | http://localhost:4311 |
| Opik UI | http://localhost:5173 |

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONTRACTS.md](./CONTRACTS.md) for ports, env vars, and script contracts.

## Wizard flow

1. **About you:** Choose Engineer, PM, Support, or External contributor
2. **Overview:** What Opik is and why it matters
3. **Opik Features:** Navigate core product concepts
4. **Local stack:** Health of Opik, Ollama, and demo apps (via same-origin proxy)
5. **Try Opik:** Guided walkthrough of key workflows
6. **Quiz:** Auto-graded product questions with a results summary
7. **Contributing overview:** Upstream Opik norms, CLA CTA, and component guides
8. **Contributing quiz:** Auto-graded contribution questions (CLA, issue links, CI, scope)
9. **Issues:** One recommended issue plus two alternatives
10. **Cursor prompt:** Open-repo command plus copy-paste contribution prompt
11. **Verify:** Local checks and CI awareness for the chosen issue
12. **PR help:** Short PR explainer plus a second Cursor prompt for draft PR steps
13. **Extend:** How to improve this tool ([CONTRIBUTING.md](./CONTRIBUTING.md))
14. **Finish:** Celebration when you complete the wizard

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
  content/                  # Overview, contributing overview/quiz, graph, tour, quiz
  docs/audiences/           # Role-specific guides
  e2e/                      # Playwright acceptance tests
```

## License

Same as the parent challenge repository. Opik itself is [Apache-2.0](https://github.com/comet-ml/opik/blob/main/LICENSE).

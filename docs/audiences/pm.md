# PM Guide

For product managers, technical PMs, and engineering leaders evaluating or demoing Opik — without shipping code on day one.

## What Opik gives you

Opik connects **what the AI did** (traces) with **how well it performed** (metrics, feedback, experiments). That closes the loop between user complaints ("it gave wrong answers") and actionable fixes (bad retrieval step, wrong prompt, model regression).

## Your path through the onboarding tool

1. Run `./deploy-locally.sh` with a engineer nearby for first-time Docker/gh setup, or use `--noninteractive` if the stack is already warm
2. Skim **Overview** and click through the **Knowledge graph** — prioritize **Production Monitoring**, **Evaluation**, and **LLM-as-a-Judge**
3. Follow the **Tour** to send a chat message and open the resulting trace
4. Take the **Quiz** — it validates concepts you'll use in demos and roadmap discussions
5. You can skip **engineer issue assignment** unless you plan to file or triage GitHub work

## Demo script (15 minutes)

| Minute | Action | Talking point |
|--------|--------|---------------|
| 0–3 | Show Opik dashboard at :5173 | "Single pane for traces, evals, and cost" |
| 3–7 | Chat demo → open trace | "Every user turn is debuggable end-to-end" |
| 7–10 | Highlight span tree + latency/tokens | "We see which step failed or got expensive" |
| 10–13 | Mention evaluation / test suites | "We can turn bad traces into regression tests" |
| 13–15 | Production monitoring slide or doc link | "Same platform from laptop to prod scale" |

## Metrics that matter for stakeholders

| Metric | Why PMs care |
|--------|--------------|
| Trace volume & error rate | Reliability and incident size |
| Feedback scores | User satisfaction proxy |
| Token usage / cost | Unit economics |
| Eval scores over versions | Release confidence before launch |
| Time-to-debug (qualitative) | Engineering velocity |

Opik dashboards and online rules surface these without custom BI glue for standard LLM workflows.

## Working with engineering

- **File Opik feature requests** on [comet-ml/opik/issues](https://github.com/comet-ml/opik/issues) with trace IDs or screenshots when possible
- **Define "good" in natural language** — test suite assertions map well to acceptance criteria
- **Ask for experiment comparisons** when evaluating prompt or model changes — Opik experiments are built for A/B-style review

## Cloud vs self-hosted

| | Self-hosted (this tool) | Comet Cloud |
|--|-------------------------|-------------|
| Setup | `./deploy-locally.sh` | Sign up at comet.com |
| Best for | Engineering deep dives, air-gapped | Fast stakeholder demos |
| Data | Stays on your machine | Comet-managed |

For executive demos, Comet Cloud may be faster; for architecture reviews, local traces from the chat demo are enough.

## Learn more

- [Production monitoring](https://www.comet.com/docs/opik/production/production_monitoring/)
- [Evaluation overview](https://www.comet.com/docs/opik/evaluation/overview/)
- [Opik product page](https://www.comet.com/site/products/opik/)

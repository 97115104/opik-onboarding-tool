# Opik: Open-Source LLM Observability

**Opik** (by [Comet](https://www.comet.com)) is an open-source platform for building, evaluating, and operating generative AI applications.

## The problem Opik solves

LLM apps are hard to debug. One user message can trigger retrieval, tool calls, multiple model requests, and post-processing. Traditional logs show fragments. Opik captures the **full trace** so you can see what happened, measure quality, and improve over time.

## Core capabilities

### Observability and tracing

- Record every LLM call, tool step, and agent step in a hierarchical **span tree**
- Inspect prompts, completions, latency, token usage, and errors in the Opik UI
- Integrate with LangChain, LlamaIndex, OpenAI SDK, and [50+ frameworks](https://www.comet.com/docs/opik/integrations/overview/) via Python and TypeScript SDKs

### Evaluation and testing

- **Datasets and experiments:** batch-evaluate prompts and models against labeled examples
- **Test suites:** natural-language assertions checked by LLM-as-a-judge
- **30+ metrics:** hallucination, answer relevance, context precision, moderation, and more
- **PyTest integration:** gate CI on evaluation results

### Production monitoring

- Ingest high-volume production traces
- Dashboards for feedback scores, trace volume, cost, and error rates
- **Online evaluation rules:** automatically score incoming traces and flag regressions

### Optimization and safety

- **Prompt Playground:** compare prompts and models side by side
- **Agent Optimizer:** automated prompt and tool improvement
- **Guardrails:** content screening and responsible-AI patterns

## Deployment options

- **Self-hosted** (`./opik.sh`): local dev, air-gapped, full control. This onboarding tool uses this option.
- **Comet Cloud:** fastest start, managed infrastructure
- **Enterprise:** scale, compliance, org-wide rollout

This wizard runs the **self-hosted** stack on your machine so you can trace the chat demo and explore the UI before contributing code.

## How this onboarding tool uses Opik

1. **Clone and start:** `deploy-locally.sh` brings up Opik via `opik.sh` in your local Opik checkout
2. **Chat demo:** a minimal chat UI calls Ollama and sends traces to Opik through the SDK
3. **Verify wiring:** scripts confirm traces appear in the Opik project
4. **Learn and quiz:** overview, knowledge graph, and tour build product context
5. **Contribute:** get a ranked GitHub issue, branch name, and Cursor prompt aligned with Opik's CONTRIBUTING guide

## Learn more

- Documentation: https://www.comet.com/docs/opik/
- GitHub: https://github.com/comet-ml/opik
- Quickstart: https://www.comet.com/docs/opik/quickstart/

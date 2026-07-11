# Support Guide

For customer support, solutions engineers, and success teams helping users debug LLM application behavior with Opik.

## What you'll use most

1. **Trace search** — find a user's session by time, project, error status, or feedback score
2. **Span inspection** — see exact prompts, retrieved context, tool arguments, and model outputs
3. **Feedback scores** — confirm whether automated or human ratings flagged the case
4. **Export / share** — copy trace IDs and URLs for engineering escalation

## Your path through the onboarding tool

1. Complete `./deploy-locally.sh` once so you recognize the same UI customers see (self-hosted or cloud skin may differ slightly)
2. **Tour steps 2–4** are critical — practice chat demo → trace → span drill-down
3. **Knowledge graph:** read **Tracing**, **Spans & Feedback**, and **Production Monitoring**
4. Quiz question on tracing and chat-demo wiring validates the support mental model

You typically do **not** need issue assignment or Cursor prompts unless you're contributing documentation fixes upstream.

## Support workflow

```text
User report → Identify project + time window → Find trace → Read span tree
     → Note failing span (retrieval / tool / LLM) → Escalate with trace ID + summary
```

### Information to collect from customers

| Field | Example |
|-------|---------|
| Project / workspace name | `production-chatbot` |
| Approximate timestamp (UTC) | `2026-07-10 14:32 UTC` |
| User or session ID | If their app logs `opik.trace_id` |
| Expected vs actual behavior | "Should cite policy doc; invented a refund rule" |

### Reading a trace quickly

1. Open the trace — check top-level **error** or **status**
2. Sort spans by **duration** — slow retrieval often explains timeouts
3. Open the **LLM span** — compare system prompt and user message to policy
4. Check **retrieval spans** — missing or wrong chunks explain hallucinations
5. Attach an internal **feedback score** or comment if the UI supports it

## Common issues

| User says | Likely span | First check |
|-----------|-------------|-------------|
| "Wrong answer" | LLM output span | Retrieved context spans — was context empty? |
| "Slow response" | Root trace duration | Which child span dominates latency? |
| "Works in staging, not prod" | Compare traces across projects | Model name, prompt version, env vars |
| "No traces appearing" | N/A — ingestion | SDK config, API key, network, sampling |

## Escalation template

```markdown
**Trace ID:** <uuid>
**Project:** <name>
**Time:** <utc>
**Summary:** User expected X; model returned Y.
**Failing span:** <name> — <one-line reason>
**Screenshots:** attached
**Customer tier:** ...
```

Engineers can reproduce from the trace without re-asking the customer for prompts.

## Self-hosted vs cloud customers

- **Cloud:** traces live in the customer's Comet workspace — they must invite you or export trace IDs
- **Self-hosted:** customers run `opik.sh`; support may need VPN or screen-share; same UI concepts apply

This onboarding tool's local stack mirrors self-hosted layout (UI on :5173).

## Learn more

- [Tracing overview](https://www.comet.com/docs/opik/tracing/)
- [Annotate traces & feedback](https://www.comet.com/docs/opik/tracing/annotate_traces/)
- [Production monitoring](https://www.comet.com/docs/opik/production/production_monitoring/)

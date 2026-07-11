# Support

For customer support, solutions engineers, and success teams helping users debug LLM application behavior with Opik.

## What you'll use most

1. **Trace search:** find a user's session by time, project, error status, or feedback score
2. **Span inspection:** see exact prompts, retrieved context, tool arguments, and model outputs
3. **Feedback scores:** confirm whether automated or human ratings flagged the case
4. **Export / share:** copy trace IDs and URLs for engineering escalation

## Focus in the wizard

- Try Opik's three guided actions: open Opik UI, send a chat demo message, then open the new trace (Metadata and Token usage)
- Opik Features: read Tracing, Spans & Feedback, and Production Monitoring
- Quiz questions on tracing and chat-demo wiring validate the support mental model
- Prefer docs or good-first issues if you contribute upstream

## Reading a trace quickly

1. Open the trace: check top-level error or status
2. Sort spans by duration: slow retrieval often explains timeouts
3. Open the LLM span: compare system prompt and user message to policy
4. Check retrieval spans: missing or wrong chunks explain hallucinations

## Escalation essentials

Collect project name, approximate UTC time, session or trace ID, and expected vs actual behavior. Engineers can reproduce from the trace without re-asking for prompts.

## Learn more

- [Tracing overview](https://www.comet.com/docs/opik/v1/tracing/)
- [Annotate traces & feedback](https://www.comet.com/docs/opik/v1/opik-university/observability/annotate-traces)

# Opik Onboarding Tour

Follow these steps in your **local Opik UI** (http://localhost:5173) while the stack from `./deploy-locally.sh` is running.

## Step 1: Confirm the stack is healthy

Open http://localhost:5173. You should see the Opik project dashboard. If the page does not load, return to the wizard **Local stack** step and check that Opik, Ollama, and the chat demo report healthy.

**Goal:** Know where live traces will appear before you send traffic.

## Step 2: Send a chat and find the trace

Open the chat demo at http://localhost:4311. Send a short message (for example: "What is Opik?"). Wait for the model response.

Switch back to Opik UI, then open **Traces**. Locate the newest trace from the chat demo.

**Goal:** Connect "my app sent a request" to "I can inspect it in Opik."

## Step 3: Open a trace and read the span tree

Click the trace you just created. Expand the span tree.

Look for:

- **Input:** the user message or prompt payload
- **Output:** the model completion
- **Metadata:** model name, latency, token counts where available

**Goal:** Understand that a trace is a tree of spans, not a single log line.

## Step 4: Explore feedback and scores (optional)

If the UI exposes feedback on the trace or span, add a thumbs-up or a numeric score. Feedback can attach at trace or span level.

In production, these scores feed dashboards and online evaluation rules.

**Goal:** See how quality signals attach to observability data.

## Step 5: Visit Prompt Playground or Experiments (if enabled)

From the Opik navigation, open **Prompt Playground** or **Experiments**.

Skim one screen. You do not need to run a full experiment during onboarding. Prompts and model choices can be tested without changing application code.

**Goal:** Know where to iterate on prompts after debugging traces.

## Step 6: Return to the wizard

You have:

1. Verified local Opik is running
2. Produced a trace from the chat demo
3. Inspected span structure
4. Seen where evaluation and prompt tools live

Continue to the **Quiz** step, then proceed to issue assignment when you are ready to contribute.

## Troubleshooting

- **Opik UI blank or 502:** Is Docker running? Re-run `./deploy-locally.sh` or `scripts/start-opik.sh`.
- **Chat demo errors:** Is Ollama up? Try `curl http://localhost:11434/api/tags`.
- **No traces in Opik:** Wait about 30s. Confirm the chat demo env points to the local Opik API.
- **Slow first response:** Ollama may be loading `llama3.1:latest`. The first token can take a minute.

For role-specific next steps, see [docs/audiences/](../docs/audiences/).

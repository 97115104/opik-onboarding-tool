import { Opik } from "opik";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:latest";
const OPIK_API_URL = process.env.OPIK_API_URL ?? "http://localhost:5173/api";
const OPIK_PROJECT_NAME = process.env.OPIK_PROJECT_NAME ?? "chat-demo";

let opikClient: Opik | null = null;

function getOpikClient(): Opik {
  if (!opikClient) {
    opikClient = new Opik({
      apiUrl: OPIK_API_URL,
      projectName: OPIK_PROJECT_NAME,
    });
  }
  return opikClient;
}

interface ChatRequestBody {
  message?: string;
}

interface OllamaChatResponse {
  message?: { content?: string };
  response?: string;
  prompt_eval_count?: number;
  eval_count?: number;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

async function callOllama(message: string): Promise<{ reply: string; raw: OllamaChatResponse }> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: message }],
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  const reply = data.message?.content ?? data.response ?? "";
  return { reply, raw: data };
}

export async function handleChatRequest(body: ChatRequestBody): Promise<{ reply: string }> {
  const message = body.message?.trim();
  if (!message) {
    throw new Error("message is required");
  }

  const client = getOpikClient();
  const trace = client.trace({
    name: "chat-demo",
    input: { message },
    metadata: { source: "chat-demo", model: OLLAMA_MODEL },
  });

  const span = trace.span({
    name: "ollama-chat",
    type: "llm",
    input: { message, model: OLLAMA_MODEL },
  });

  try {
    const { reply, raw } = await callOllama(message);

    const usage =
      raw.prompt_eval_count != null || raw.eval_count != null
        ? {
            prompt_tokens: raw.prompt_eval_count ?? 0,
            completion_tokens: raw.eval_count ?? 0,
            total_tokens: (raw.prompt_eval_count ?? 0) + (raw.eval_count ?? 0),
          }
        : undefined;

    // Opik SDK end() only sets endTime — output/usage must be set via update()
    span.update({
      output: { reply },
      model: OLLAMA_MODEL,
      ...(usage ? { usage } : {}),
      metadata: {
        total_duration_ns: raw.total_duration,
        load_duration_ns: raw.load_duration,
        prompt_eval_duration_ns: raw.prompt_eval_duration,
        eval_duration_ns: raw.eval_duration,
      },
    });
    span.end();

    trace.update({ output: { reply } });
    trace.end();

    await client.flush();
    return { reply };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    span.update({ output: { error: errMsg } });
    span.end();
    trace.update({ output: { error: errMsg } });
    trace.end();
    await client.flush();
    throw error;
  }
}

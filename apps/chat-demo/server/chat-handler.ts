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
}

async function callOllama(message: string): Promise<string> {
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
  return data.message?.content ?? data.response ?? "";
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
    const reply = await callOllama(message);
    span.end({ output: { reply } });
    trace.end({ output: { reply } });
    await client.flush();
    return { reply };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    span.end({ output: { error: errMsg } });
    trace.end({ output: { error: errMsg } });
    await client.flush();
    throw error;
  }
}

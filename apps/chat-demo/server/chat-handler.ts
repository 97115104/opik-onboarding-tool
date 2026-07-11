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
    // #region agent log
    fetch('http://127.0.0.1:7856/ingest/869ddffa-9bde-4ddf-897c-7a713e589d6a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'44c80e'},body:JSON.stringify({sessionId:'44c80e',runId:'pre-fix',hypothesisId:'B',location:'chat-handler.ts:callOllama',message:'Ollama reply received',data:{replyLen:reply.length,replyPreview:reply.slice(0,120),hasMessageContent:Boolean(raw.message?.content),prompt_eval_count:raw.prompt_eval_count??null,eval_count:raw.eval_count??null,total_duration:raw.total_duration??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const endArg = { output: { reply } };
    span.end(endArg);
    // #region agent log
    fetch('http://127.0.0.1:7856/ingest/869ddffa-9bde-4ddf-897c-7a713e589d6a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'44c80e'},body:JSON.stringify({sessionId:'44c80e',runId:'pre-fix',hypothesisId:'A',location:'chat-handler.ts:span.end',message:'After span.end with output arg',data:{endArgKeys:Object.keys(endArg),spanOutput:span.data.output??null,spanEndTime:span.data.endTime?true:false,spanUsage:span.data.usage??null,spanMetadata:span.data.metadata??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    trace.end(endArg);
    // #region agent log
    fetch('http://127.0.0.1:7856/ingest/869ddffa-9bde-4ddf-897c-7a713e589d6a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'44c80e'},body:JSON.stringify({sessionId:'44c80e',runId:'pre-fix',hypothesisId:'E',location:'chat-handler.ts:trace.end',message:'After trace.end with output arg',data:{traceOutput:trace.data.output??null,traceEndTime:trace.data.endTime?true:false,traceUsage:trace.data.usage??null,traceMetadata:trace.data.metadata??null,usageEverSet:false},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await client.flush();
    // #region agent log
    fetch('http://127.0.0.1:7856/ingest/869ddffa-9bde-4ddf-897c-7a713e589d6a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'44c80e'},body:JSON.stringify({sessionId:'44c80e',runId:'pre-fix',hypothesisId:'C',location:'chat-handler.ts:flush',message:'Flush completed',data:{traceId:trace.data.id,spanId:span.data.id,finalTraceOutput:trace.data.output??null,finalSpanOutput:span.data.output??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return { reply };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    // #region agent log
    fetch('http://127.0.0.1:7856/ingest/869ddffa-9bde-4ddf-897c-7a713e589d6a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'44c80e'},body:JSON.stringify({sessionId:'44c80e',runId:'pre-fix',hypothesisId:'B',location:'chat-handler.ts:catch',message:'Chat handler error',data:{errMsg:errMsg.slice(0,200)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    span.end({ output: { error: errMsg } });
    trace.end({ output: { error: errMsg } });
    await client.flush();
    throw error;
  }
}

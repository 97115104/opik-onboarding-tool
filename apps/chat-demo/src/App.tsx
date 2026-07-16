import { FormEvent, useState } from "react";
import { Markdown } from "./Markdown";

const ATTESTATION_SHORT_URL = "https://attest.97115104.com/s/pz7r8cho";
const OPIK_FRONTEND = import.meta.env.VITE_OPIK_FRONTEND_URL ?? "http://127.0.0.1:5173";
const OPIK_PROJECT_NAME = import.meta.env.VITE_OPIK_PROJECT_NAME ?? "chat-demo";
const CHAT_DEMO_PROJECT_URL = `${OPIK_FRONTEND.replace(/\/$/, "")}/default/redirect/projects?name=${encodeURIComponent(OPIK_PROJECT_NAME)}`;

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Send a message to chat with Ollama. Each turn is traced in local Opik.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? `Request failed (${response.status})`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "(empty response)" },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "error", content: message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <a
          href="https://www.comet.com/docs/opik/"
          target="_blank"
          rel="noopener noreferrer"
          className="brand-logo"
          data-testid="opik-brand-logo"
        >
          <img src="/opik-logo.svg" alt="Opik" height={28} />
        </a>
        <h1>Opik Chat Demo</h1>
        <p>Chat with Ollama and inspect each traced turn in your local Opik stack.</p>
      </header>

      <div className="messages" data-testid="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}${msg.role === "assistant" ? " assistant-message" : ""}`}
            data-testid={
              msg.role === "assistant"
                ? `chat-response-${index}`
                : `chat-message-${index}`
            }
            {...(msg.role === "assistant" ? { "data-role": "assistant" } : {})}
          >
            {msg.role === "assistant" ? <Markdown>{msg.content}</Markdown> : msg.content}
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={sendMessage}>
        <input
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button data-testid="chat-send" type="submit" disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      <p className="status">
        Traces land in Opik project{" "}
        <a
          href={CHAT_DEMO_PROJECT_URL}
          className="status-project-link"
          data-testid="chat-status-project-link"
        >
          <code>{OPIK_PROJECT_NAME}</code>
        </a>
        .
      </p>
      <footer className="site-credit">
        <div>
          Built with <span aria-hidden="true">♥</span> for{" "}
          <a href="https://github.com/comet-ml/opik" target="_blank" rel="noopener noreferrer">
            Opik Community
          </a>{" "}
          by{" "}
          <a href="https://links.97115104.com" target="_blank" rel="noopener noreferrer">
            Austin H
          </a>
        </div>
        <div>
          Inference by{" "}
          <a
            href="https://ollama.com/library/llama3.1:8b"
            target="_blank"
            rel="noopener noreferrer"
          >
            Llama 3.1 8B
          </a>{" "}
          via local{" "}
          <a href="https://github.com/ollama/ollama" target="_blank" rel="noopener noreferrer">
            Ollama
          </a>
        </div>
        <div>
          Made with{" "}
          <a href={ATTESTATION_SHORT_URL} target="_blank" rel="noopener noreferrer">
            Cursor Agent (Auto)
          </a>
        </div>
      </footer>
    </div>
  );
}

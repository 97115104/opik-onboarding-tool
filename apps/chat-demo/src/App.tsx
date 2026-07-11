import { FormEvent, useState } from "react";

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
      <header>
        <h1>Opik Chat Demo</h1>
        <p>Ollama backend with Opik SDK tracing to your local stack.</p>
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
            {msg.content}
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
        Traces land in Opik project <code>chat-demo</code>.
      </p>
    </div>
  );
}

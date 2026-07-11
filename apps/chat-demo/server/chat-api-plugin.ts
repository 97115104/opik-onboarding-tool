import type { Plugin } from "vite";
import { handleChatRequest } from "./chat-handler";

export function chatApiPlugin(): Plugin {
  return {
    name: "chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res, next) => {
        if (req.method === "GET") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, endpoint: "/api/chat" }));
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }
          const raw = Buffer.concat(chunks).toString("utf8");
          const body = raw ? (JSON.parse(raw) as { message?: string }) : {};
          const result = await handleChatRequest(body);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

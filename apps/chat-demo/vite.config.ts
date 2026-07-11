import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { chatApiPlugin } from "./server/chat-api-plugin";

export default defineConfig({
  plugins: [react(), chatApiPlugin()],
  server: {
    port: 4311,
    strictPort: true,
  },
});

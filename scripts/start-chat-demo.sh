#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults
ensure_path_has_bun

CHAT_DEMO_DIR="$TOOL_ROOT/apps/chat-demo"
if [[ ! -f "$CHAT_DEMO_DIR/package.json" ]]; then
  echo "chat-demo app not found at $CHAT_DEMO_DIR" >&2
  exit 1
fi

export OLLAMA_URL OLLAMA_MODEL OPIK_API_URL OPIK_PROJECT_NAME
export VITE_OLLAMA_URL="$OLLAMA_URL"
export VITE_OPIK_API_URL="$OPIK_API_URL"

if curl -fsS -o /dev/null "http://localhost:$CHAT_DEMO_PORT/" 2>/dev/null; then
  echo "Chat demo already up on port $CHAT_DEMO_PORT"
else
  start_background_service chat-demo bash -lc "
    cd \"$CHAT_DEMO_DIR\" &&
    export OLLAMA_URL=\"$OLLAMA_URL\" OLLAMA_MODEL=\"$OLLAMA_MODEL\" &&
    export OPIK_API_URL=\"$OPIK_API_URL\" OPIK_PROJECT_NAME=\"$OPIK_PROJECT_NAME\" &&
    bun run dev -- --port \"$CHAT_DEMO_PORT\" --host 127.0.0.1
  "
  wait_for_url "http://localhost:$CHAT_DEMO_PORT/" 120 "Chat demo" || {
    tail -n 50 "$(log_file chat-demo)" >&2 || true
    exit 1
  }
fi

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults
ensure_path_has_bun

ONBOARDING_DIR="$TOOL_ROOT/apps/onboarding-ui"
if [[ ! -f "$ONBOARDING_DIR/package.json" ]]; then
  echo "Onboarding UI not implemented yet (workstream B) — skipping start."
  exit 0
fi

export OPIK_FRONTEND_URL OPIK_API_URL OLLAMA_URL OPIK_PROJECT_NAME
export CHAT_DEMO_URL="${CHAT_DEMO_URL:-http://127.0.0.1:$CHAT_DEMO_PORT}"
export VITE_OPIK_FRONTEND_URL="$OPIK_FRONTEND_URL"
export VITE_OPIK_API_URL="$OPIK_API_URL"
export VITE_OLLAMA_URL="$OLLAMA_URL"
export VITE_CHAT_DEMO_URL="$CHAT_DEMO_URL"
export VITE_OPIK_PROJECT_NAME="$OPIK_PROJECT_NAME"

if curl -fsS -o /dev/null "http://127.0.0.1:$ONBOARDING_UI_PORT/" 2>/dev/null; then
  echo "Onboarding UI already up on port $ONBOARDING_UI_PORT"
else
  ensure_background_service onboarding-ui "http://127.0.0.1:$ONBOARDING_UI_PORT/" bash -lc "
    cd \"$ONBOARDING_DIR\" &&
    export OPIK_FRONTEND_URL=\"$OPIK_FRONTEND_URL\" OPIK_API_URL=\"$OPIK_API_URL\" OLLAMA_URL=\"$OLLAMA_URL\" &&
    export CHAT_DEMO_URL=\"$CHAT_DEMO_URL\" OPIK_PROJECT_NAME=\"$OPIK_PROJECT_NAME\" &&
    export VITE_OPIK_FRONTEND_URL=\"$VITE_OPIK_FRONTEND_URL\" VITE_OPIK_API_URL=\"$VITE_OPIK_API_URL\" &&
    export VITE_OLLAMA_URL=\"$VITE_OLLAMA_URL\" VITE_CHAT_DEMO_URL=\"$VITE_CHAT_DEMO_URL\" &&
    export VITE_OPIK_PROJECT_NAME=\"$VITE_OPIK_PROJECT_NAME\" &&
    exec bun run dev -- --port \"$ONBOARDING_UI_PORT\" --host 127.0.0.1
  "
  wait_for_url "http://127.0.0.1:$ONBOARDING_UI_PORT/" 120 "Onboarding UI" || {
    tail -n 50 "$(log_file onboarding-ui)" >&2 || true
    exit 1
  }
fi

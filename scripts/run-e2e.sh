#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$TOOL_ROOT/scripts"

# shellcheck source=common.sh
source "$SCRIPTS_DIR/common.sh"
export_tool_defaults
ensure_path_has_bun

ensure_service() {
  local url="$1"
  local start_script="$2"
  if curl -fsS -o /dev/null "$url" 2>/dev/null; then
    echo "Service up: $url"
  else
    echo "Starting service for $url..."
    "$start_script"
  fi
}

ensure_service "http://127.0.0.1:${CHAT_DEMO_PORT}/" "$SCRIPTS_DIR/start-chat-demo.sh"
ensure_service "http://127.0.0.1:${ONBOARDING_UI_PORT}/" "$SCRIPTS_DIR/start-onboarding-ui.sh"
ensure_service "${OPIK_FRONTEND_URL}/" "$SCRIPTS_DIR/start-opik.sh"

cd "$TOOL_ROOT/e2e"

bunx playwright install chromium
bunx playwright test

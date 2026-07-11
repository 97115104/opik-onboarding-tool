#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults

open_url() {
  local url="$1"
  if is_macos && command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  elif command -v sensible-browser >/dev/null 2>&1; then
    sensible-browser "$url" >/dev/null 2>&1 || true
  else
    echo "No browser opener found — open manually: $url"
  fi
}

URLS=(
  "$OPIK_FRONTEND_URL"
  "http://localhost:$CHAT_DEMO_PORT"
  "http://localhost:$ONBOARDING_UI_PORT"
)

for url in "${URLS[@]}"; do
  echo "Opening $url"
  open_url "$url"
done

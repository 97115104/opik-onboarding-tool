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

if curl -fsS -o /dev/null "http://127.0.0.1:$ONBOARDING_UI_PORT/" 2>/dev/null; then
  echo "Onboarding UI already up on port $ONBOARDING_UI_PORT"
else
  ensure_background_service onboarding-ui "http://127.0.0.1:$ONBOARDING_UI_PORT/" bash -lc "
    cd \"$ONBOARDING_DIR\" &&
    exec bun run dev -- --port \"$ONBOARDING_UI_PORT\" --host 127.0.0.1
  "
  wait_for_url "http://127.0.0.1:$ONBOARDING_UI_PORT/" 120 "Onboarding UI" || {
    tail -n 50 "$(log_file onboarding-ui)" >&2 || true
    exit 1
  }
fi

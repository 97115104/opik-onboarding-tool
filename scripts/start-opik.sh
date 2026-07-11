#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults

if [[ ! -x "$OPIK_PATH/opik.sh" ]]; then
  echo "opik.sh not found or not executable at $OPIK_PATH" >&2
  exit 1
fi

if curl -fsS -o /dev/null "$OPIK_FRONTEND_URL" 2>/dev/null; then
  echo "Opik frontend already up at $OPIK_FRONTEND_URL"
else
  start_background_service opik bash -lc "cd \"$OPIK_PATH\" && ./opik.sh"
  wait_for_url "$OPIK_FRONTEND_URL" 300 "Opik frontend" || {
    echo "--- opik log tail ---" >&2
    tail -n 50 "$(log_file opik)" >&2 || true
    exit 1
  }
fi

if curl -fsS -o /dev/null "$OPIK_API_URL/v1/private/projects" 2>/dev/null; then
  echo "Opik API reachable at $OPIK_API_URL"
else
  echo "Warning: Opik API health check failed at $OPIK_API_URL/v1/private/projects" >&2
fi

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults

CHAT_URL="http://localhost:${CHAT_DEMO_PORT}/api/chat"
MARKER="opik-wiring-verify-$(date +%s)-$RANDOM"
TIMEOUT=60

echo "Sending wiring test message to chat demo..."
curl -fsS "$CHAT_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"message\":\"$MARKER\"}" >/dev/null

echo "Polling Opik for trace containing marker (timeout ${TIMEOUT}s)..."
elapsed=0
found=0

while [[ "$elapsed" -lt "$TIMEOUT" ]]; do
  traces_json="$(
    curl -fsS "${OPIK_API_URL}/v1/private/traces?project_name=${OPIK_PROJECT_NAME}&size=50" 2>/dev/null || echo '{}'
  )"

  if echo "$traces_json" | grep -q "$MARKER"; then
    found=1
    break
  fi

  sleep 3
  elapsed=$((elapsed + 3))
done

if [[ "$found" -ne 1 ]]; then
  echo "No Opik trace found for marker '$MARKER' within ${TIMEOUT}s" >&2
  echo "Last traces response snippet:" >&2
  echo "$traces_json" | head -c 500 >&2 || true
  exit 1
fi

echo "Opik wiring verified — trace received for test message."

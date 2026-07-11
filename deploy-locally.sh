#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPTS_DIR="$TOOL_ROOT/scripts"

# Defaults per CONTRACTS.md
export OPIK_PATH="${OPIK_PATH:-$(dirname "$TOOL_ROOT")/opik}"
export ONBOARDING_UI_PORT="${ONBOARDING_UI_PORT:-4310}"
export CHAT_DEMO_PORT="${CHAT_DEMO_PORT:-4311}"
export OPIK_FRONTEND_URL="${OPIK_FRONTEND_URL:-http://localhost:5173}"
export OPIK_API_URL="${OPIK_API_URL:-http://localhost:5173/api}"
export OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.1:latest}"

NONINTERACTIVE=0
SKIP_E2E=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

One-shot local deploy for the Opik onboarding tool.

Options:
  --noninteractive   Skip browser open; require existing gh auth
  --skip-e2e         Skip run-e2e.sh (debug only)
  --opik-path=PATH   Set OPIK_PATH for this run
  -h, --help         Show this help
EOF
}

for arg in "$@"; do
  case "$arg" in
    --noninteractive) NONINTERACTIVE=1 ;;
    --skip-e2e) SKIP_E2E=1 ;;
    --opik-path=*) export OPIK_PATH="${arg#*=}" ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

export NONINTERACTIVE SKIP_E2E

run_phase() {
  local name="$1"
  shift
  echo ""
  echo "==> Phase: $name"
  "$@"
}

run_phase "install-deps" "$SCRIPTS_DIR/install-deps.sh"
run_phase "ensure-gh-auth" "$SCRIPTS_DIR/ensure-gh-auth.sh"
run_phase "clone-opik" "$SCRIPTS_DIR/clone-opik.sh"
run_phase "ensure-ollama" "$SCRIPTS_DIR/ensure-ollama.sh"
run_phase "start-opik" "$SCRIPTS_DIR/start-opik.sh"
run_phase "start-chat-demo" "$SCRIPTS_DIR/start-chat-demo.sh"
run_phase "verify-opik-wiring" "$SCRIPTS_DIR/verify-opik-wiring.sh"
run_phase "start-onboarding-ui" "$SCRIPTS_DIR/start-onboarding-ui.sh"

if [[ "$SKIP_E2E" -eq 1 ]]; then
  echo ""
  echo "==> Phase: run-e2e (skipped via --skip-e2e)"
elif [[ -x "$SCRIPTS_DIR/run-e2e.sh" ]]; then
  run_phase "run-e2e" "$SCRIPTS_DIR/run-e2e.sh"
else
  echo ""
  echo "==> Phase: run-e2e (skipped — scripts/run-e2e.sh not implemented yet, workstream E)"
fi

if [[ "$NONINTERACTIVE" -eq 1 ]]; then
  echo ""
  echo "==> Phase: open-browsers (skipped via --noninteractive)"
else
  run_phase "open-browsers" "$SCRIPTS_DIR/open-browsers.sh"
fi

echo ""
echo "Deploy complete."
echo "  Opik UI:        $OPIK_FRONTEND_URL"
echo "  Chat demo:      http://localhost:$CHAT_DEMO_PORT"
echo "  Onboarding UI:  http://localhost:$ONBOARDING_UI_PORT"

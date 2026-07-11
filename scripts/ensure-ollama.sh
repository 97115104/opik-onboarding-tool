#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults

install_ollama_linux() {
  if command -v curl >/dev/null 2>&1; then
    echo "Installing Ollama via official script..."
    curl -fsSL https://ollama.com/install.sh | sh
  else
    echo "curl required to install Ollama" >&2
    exit 1
  fi
}

install_ollama_macos() {
  if command -v brew >/dev/null 2>&1; then
    brew install ollama
  else
    echo "Install Ollama manually: https://ollama.com/download" >&2
    exit 1
  fi
}

if ! command -v ollama >/dev/null 2>&1; then
  if is_linux; then
    install_ollama_linux
  elif is_macos; then
    install_ollama_macos
  else
    echo "Unsupported OS for Ollama install" >&2
    exit 1
  fi
fi

ollama_ready() {
  curl -fsS "$OLLAMA_URL/api/tags" >/dev/null 2>&1
}

if ! ollama_ready; then
  start_background_service ollama ollama serve
  wait_for_url "$OLLAMA_URL/api/tags" 60 "Ollama"
else
  echo "Ollama already serving at $OLLAMA_URL"
fi

echo "Pulling model $OLLAMA_MODEL (may take a while on first run)..."
ollama pull "$OLLAMA_MODEL"

echo "Running Ollama smoke test..."
response="$(
  curl -fsS "$OLLAMA_URL/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"$OLLAMA_MODEL\",\"prompt\":\"hi\",\"stream\":false}" \
    | sed -n 's/.*"response"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
    | head -1
)"

if [[ -z "$response" ]]; then
  echo "Ollama smoke test failed — no response body" >&2
  exit 1
fi

echo "Ollama smoke test OK."

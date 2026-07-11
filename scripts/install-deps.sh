#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults
ensure_path_has_bun

echo "Installing dependencies for Opik onboarding tool..."

OS="$(uname -s)"
echo "Detected OS: $OS"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun not found — installing via official installer..."
  curl -fsSL https://bun.sh/install | bash
  ensure_path_has_bun
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun installation failed or not on PATH" >&2
  exit 1
fi

echo "Bun version: $(bun --version)"

require_cmd() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    echo "$hint" >&2
    exit 1
  fi
}

if is_linux; then
  require_cmd docker "Install Docker: https://docs.docker.com/engine/install/"
  require_cmd gh "Install GitHub CLI: https://cli.github.com/"
  if ! command -v ollama >/dev/null 2>&1; then
    echo "Ollama not found — ensure-ollama.sh will attempt installation."
  fi
  if command -v apt-get >/dev/null 2>&1; then
    echo "Ensuring Playwright OS libraries (if sudo available)..."
    if sudo -n true 2>/dev/null; then
      sudo apt-get update -qq
      sudo apt-get install -y -qq \
        libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
        libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
        libgbm1 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 \
        2>/dev/null || echo "Some Playwright libraries may need manual install."
    else
      echo "Skipping apt Playwright libs (sudo not available without password)."
    fi
  fi
elif is_macos; then
  require_cmd docker "Install Docker Desktop for Mac."
  require_cmd gh "Install GitHub CLI: brew install gh"
  if ! command -v ollama >/dev/null 2>&1; then
    echo "Ollama not found — ensure-ollama.sh will attempt installation."
  fi
else
  echo "Unsupported OS: $OS" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Warning: Docker daemon is not reachable. Opik stack requires Docker." >&2
fi

bun_install_if_present "$TOOL_ROOT/apps/onboarding-ui"
bun_install_if_present "$TOOL_ROOT/apps/chat-demo"
bun_install_if_present "$TOOL_ROOT/e2e"

echo "install-deps.sh complete."

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd gh

NONINTERACTIVE="${NONINTERACTIVE:-0}"
MAX_WAIT="${GH_AUTH_MAX_WAIT:-600}"

if gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI already authenticated."
else
  if [[ "$NONINTERACTIVE" -eq 1 ]]; then
    echo "GitHub CLI is not authenticated and --noninteractive was set." >&2
    echo "Run 'gh auth login' before deploy." >&2
    exit 1
  fi
  echo "GitHub CLI not authenticated — starting gh auth login..."
  gh auth login --hostname github.com --git-protocol https --web
fi

elapsed=0
while ! gh auth status >/dev/null 2>&1; do
  if [[ "$elapsed" -ge "$MAX_WAIT" ]]; then
    echo "Timed out waiting for gh auth (${MAX_WAIT}s)" >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

gh api user --jq '.login' >/dev/null
echo "GitHub auth verified: $(gh api user --jq '.login')"

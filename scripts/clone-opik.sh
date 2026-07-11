#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"
export_tool_defaults

OPIK_REPO="https://github.com/comet-ml/opik.git"

is_valid_opik_checkout() {
  [[ -d "$OPIK_PATH/.git" ]] \
    && [[ -x "$OPIK_PATH/opik.sh" ]] \
    && git -C "$OPIK_PATH" rev-parse HEAD >/dev/null 2>&1
}

if is_valid_opik_checkout; then
  echo "Valid Opik checkout at $OPIK_PATH"
  echo "Fetching latest refs (no destructive reset)..."
  git -C "$OPIK_PATH" fetch --all --prune || echo "Fetch failed — continuing with existing checkout."
else
  if [[ -e "$OPIK_PATH" ]]; then
    echo "OPIK_PATH exists but is not a valid Opik checkout: $OPIK_PATH" >&2
    exit 1
  fi
  echo "Cloning Opik into $OPIK_PATH ..."
  git clone "$OPIK_REPO" "$OPIK_PATH"
fi

chmod +x "$OPIK_PATH/opik.sh"
echo "Opik HEAD: $(git -C "$OPIK_PATH" rev-parse --short HEAD)"

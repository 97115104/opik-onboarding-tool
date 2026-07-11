#!/usr/bin/env bash
set -euo pipefail

TOOL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$TOOL_ROOT/e2e"

bunx playwright install chromium
bunx playwright test

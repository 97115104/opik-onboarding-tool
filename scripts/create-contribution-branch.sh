#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: create-contribution-branch.sh [--issue NUMBER]

Output: branch name on stdout; creates branch in OPIK_PATH from origin/main
Pattern: opik-onboarding-tool-97115104-contribution-{N}
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

echo "Not implemented — workstream C"

#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: rank-issues.sh [--limit N] [--label LABEL]

Output: JSON array to stdout
[{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...] }]
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

echo "Not implemented — workstream C"

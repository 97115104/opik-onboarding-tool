#!/usr/bin/env bash
# Usage: rank-issues.sh [--limit N] [--label LABEL]
# Output: JSON array to stdout
# [{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...] }]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/common.sh
source "${SCRIPT_DIR}/common.sh"

export_tool_defaults

GITHUB_REPO="${GITHUB_REPO:-comet-ml/opik}"
LIMIT=10
EXTRA_LABEL=""

usage() {
  cat <<EOF
Usage: rank-issues.sh [--limit N] [--label LABEL]

Rank open issues from ${GITHUB_REPO} for contributor assignment.
Outputs JSON array to stdout.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --limit)
      LIMIT="${2:?--limit requires a number}"
      shift 2
      ;;
    --label)
      EXTRA_LABEL="${2:?--label requires a label name}"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required but not installed" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated; run gh auth login" >&2
  exit 1
fi

LABEL_ARGS=()
if [[ -n "$EXTRA_LABEL" ]]; then
  LABEL_ARGS=(--label "$EXTRA_LABEL")
fi

issues_json="$(gh issue list \
  --repo "$GITHUB_REPO" \
  --state open \
  --limit 100 \
  "${LABEL_ARGS[@]}" \
  --json number,title,url,labels,assignees)"

python3 - "$issues_json" "$LIMIT" <<'PY'
import json
import sys

raw = json.loads(sys.argv[1])
limit = int(sys.argv[2])

PREFERRED = {"good first issue", "help wanted"}

def score(issue):
    labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    s = 0.5
    if labels & PREFERRED:
        s += 0.35
    if issue.get("assignees"):
        s -= 0.4
    if "bug" in labels:
        s += 0.05
    if "documentation" in labels or "docs" in labels:
        s += 0.05
    return max(0.0, min(1.0, s))

ranked = []
for issue in raw:
    ranked.append({
        "number": issue["number"],
        "title": issue["title"],
        "url": issue["url"],
        "score": round(score(issue), 2),
        "labels": [lbl["name"] for lbl in issue.get("labels", [])],
    })

ranked.sort(key=lambda x: (-x["score"], x["number"]))
print(json.dumps(ranked[:limit], indent=2))
PY

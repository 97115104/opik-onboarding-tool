#!/usr/bin/env bash
# Usage: rank-issues.sh [--limit N] [--label LABEL] [--persona PERSONA]
# Output: JSON array to stdout
# [{ "number": 1234, "title": "...", "url": "...", "score": 0.87, "labels": [...], "plainExplanation": "..." }]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/common.sh
source "${SCRIPT_DIR}/common.sh"

export_tool_defaults

GITHUB_REPO="${GITHUB_REPO:-comet-ml/opik}"
LIMIT=10
EXTRA_LABEL=""
PERSONA=""

usage() {
  cat <<EOF
Usage: rank-issues.sh [--limit N] [--label LABEL] [--persona PERSONA]

Rank open issues from ${GITHUB_REPO} for contributor assignment.
Persona: engineer|pm|support|external (optional).
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
    --persona)
      PERSONA="${2:?--persona requires a value}"
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

python3 - "$issues_json" "$LIMIT" "$PERSONA" <<'PY'
import json
import re
import sys

raw = json.loads(sys.argv[1])
limit = int(sys.argv[2])
persona = (sys.argv[3] or "").strip().lower()
non_engineer = persona in {"pm", "support"}

PREFERRED = {"good first issue", "help wanted"}
DOCS = {"documentation", "docs"}
INFRA_RE = re.compile(
    r"docker|rpi|raspberry|infra|kubernetes|helm|\bci\b|hardware|nvidia|cuda",
    re.I,
)

def explain(issue, labels):
    title = issue.get("title", "")
    if labels & DOCS or re.search(r"\bdocs?\b", title, re.I):
        if non_engineer:
            return "A documentation or wording fix. Good if you prefer writing over deep code changes."
        return "Documentation or copy update. Usually low risk and easy to review."
    if "good first issue" in labels:
        if non_engineer:
            return "Marked as a good first issue: a smaller, well-scoped change for newcomers."
        return "Labeled good first issue: scoped for first-time contributors."
    if "help wanted" in labels:
        if non_engineer:
            return "Maintainers asked for help on this. The issue description should outline what is needed."
        return "Help wanted: maintainers are looking for an outside contribution."
    if "bug" in labels or re.search(r"\bbug\b|\bfix\b|\berror\b", title, re.I):
        if non_engineer:
            return "A bug fix. Read the issue carefully and reproduce the problem before changing code."
        return "Bug fix: reproduce first, then implement a focused change with tests if possible."
    if INFRA_RE.search(title) or labels & {"infra", "docker", "ci"}:
        if non_engineer:
            return "Likely infrastructure or environment related. Prefer a docs or good-first alternative if unsure."
        return "Infrastructure or environment oriented. Expect setup and platform context."
    if non_engineer:
        return "A scoped Opik change. Open the issue link to see what maintainers expect."
    return "Open the issue for acceptance criteria, then implement a focused change on your branch."

def score(issue):
    labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    title = issue.get("title", "")
    s = 0.5
    if labels & PREFERRED:
        s += 0.35 if not non_engineer else 0.45
    if issue.get("assignees"):
        s -= 0.4
    if "bug" in labels:
        s += 0.05
    if labels & DOCS:
        s += 0.05 if not non_engineer else 0.25
    if "good first issue" in labels and non_engineer:
        s += 0.15
    if INFRA_RE.search(title) or labels & {"infra", "docker", "ci", "hardware"}:
        s -= 0.35 if non_engineer else 0.1
    if persona in {"engineer", "external"}:
        if labels & {"enhancement", "feature", "performance"}:
            s += 0.05
    return max(0.0, min(1.0, s))

ranked = []
for issue in raw:
    labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    ranked.append({
        "number": issue["number"],
        "title": issue["title"],
        "url": issue["url"],
        "score": round(score(issue), 2),
        "labels": [lbl["name"] for lbl in issue.get("labels", [])],
        "plainExplanation": explain(issue, labels),
    })

ranked.sort(key=lambda x: (-x["score"], x["number"]))
print(json.dumps(ranked[:limit], indent=2))
PY

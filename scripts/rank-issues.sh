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
  --json number,title,url,labels,assignees,body)"

# Write JSON to a temp file so large issue bodies never hit ARG_MAX.
issues_tmp="$(mktemp)"
trap 'rm -f "$issues_tmp"' EXIT
printf '%s' "$issues_json" > "$issues_tmp"

python3 - "$issues_tmp" "$LIMIT" "$PERSONA" <<'PY'
import json
import re
import sys

with open(sys.argv[1], encoding="utf-8") as fh:
    raw = json.load(fh)
limit = int(sys.argv[2])
persona = (sys.argv[3] or "").strip().lower()
non_engineer = persona in {"pm", "support"}
# Stronger first-time bias for every persona, including engineer/external.
first_time_bias = True

PREFERRED = {"good first issue", "help wanted"}
DOCS = {"documentation", "docs"}
INFRA_RE = re.compile(
    r"docker|rpi|raspberry|infra|kubernetes|helm|\bci\b|hardware|nvidia|cuda",
    re.I,
)
HARD_RE = re.compile(
    r"\badk\b|multi[- ]?sdk|sdk integration|typescript sdk|python sdk|"
    r"distributed|performance regression|benchmark|migration|refactor|"
    r"breaking change|architecture",
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

def excerpt(body):
    text = (body or "").strip()
    if not text:
        return ""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Keep enough markdown for the issues modal; still bound payload size.
    if len(text) > 4000:
        return text[:3997].rstrip() + "…"
    return text

def score(issue):
    labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    title = issue.get("title", "")
    body = issue.get("body") or ""
    s = 0.5
    is_gfi = "good first issue" in labels
    is_docs = bool(labels & DOCS or re.search(r"\bdocs?\b", title, re.I))
    is_help = "help wanted" in labels
    preferred = is_gfi or is_docs

    # Docs / good-first must outrank plain help-wanted and short generic issues.
    if is_gfi:
        s += 0.55
    if is_docs:
        s += 0.45
    elif is_help and not is_gfi:
        s += 0.15

    if issue.get("assignees"):
        s -= 0.1 if preferred else 0.4

    if "bug" in labels and not preferred:
        s += 0.0  # no bump for non-first-time bugs

    if INFRA_RE.search(title) or labels & {"infra", "docker", "ci", "hardware"}:
        s -= 0.45 if first_time_bias else (0.35 if non_engineer else 0.1)

    if HARD_RE.search(title) or HARD_RE.search(body[:500]):
        s -= 0.35 if first_time_bias else 0.15

    body_len = len(body.strip())
    if preferred:
        pass  # do not penalize long docs/GFI write-ups
    elif body_len and body_len < 800:
        s += 0.05
    elif body_len > 4000:
        s -= 0.12

    return max(0.0, min(1.0, s))

ranked = []
for issue in raw:
    labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    body_excerpt = excerpt(issue.get("body"))
    item = {
        "number": issue["number"],
        "title": issue["title"],
        "url": issue["url"],
        "score": round(score(issue), 2),
        "labels": [lbl["name"] for lbl in issue.get("labels", [])],
        "plainExplanation": explain(issue, labels),
    }
    if body_excerpt:
        item["excerpt"] = body_excerpt
    ranked.append(item)

ranked.sort(key=lambda x: (-x["score"], x["number"]))
print(json.dumps(ranked[:limit], indent=2))
PY

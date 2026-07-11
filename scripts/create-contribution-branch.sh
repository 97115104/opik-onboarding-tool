#!/usr/bin/env bash
# Usage: create-contribution-branch.sh [--issue NUMBER] [--summary SLUG]
# Output: branch name on stdout; creates branch in OPIK_PATH from origin/main
# Pattern: {username}/{ticket}-{summary} (Opik CONTRIBUTING convention)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/common.sh
source "${SCRIPT_DIR}/common.sh"

export_tool_defaults

ISSUE_NUMBER=""
SUMMARY=""

usage() {
  cat <<EOF
Usage: create-contribution-branch.sh [--issue NUMBER] [--summary SLUG]

Create a contribution branch in OPIK_PATH from origin/main.
Branch pattern: {username}/{ticket}-{summary}
  username = CONTRIBUTOR_ID if set, else gh api user login
  ticket   = issue-{NUMBER} when --issue is set, else NA
  summary  = slug from --summary (default: onboarding)
Prints branch name on stdout. Idempotent: checks out existing local branch,
or tracks origin/{branch} when remote-only, else creates from origin/main.
EOF
}

slugify_summary() {
  local raw="${1:-onboarding}"
  local slug
  slug="$(
    printf '%s' "$raw" \
      | tr '[:upper:]' '[:lower:]' \
      | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g' \
      | cut -c1-40 \
      | sed -E 's/-+$//'
  )"
  if [[ -z "$slug" ]]; then
    slug="onboarding"
  fi
  printf '%s\n' "$slug"
}

resolve_username() {
  local login
  if login="$(resolve_contributor_username)"; then
    printf '%s\n' "$login"
    return
  fi
  echo "Unable to resolve GitHub username. Set CONTRIBUTOR_ID or run gh auth login." >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --issue)
      ISSUE_NUMBER="${2:?--issue requires a number}"
      shift 2
      ;;
    --summary)
      SUMMARY="${2:?--summary requires a value}"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$OPIK_PATH/.git" ]]; then
  echo "OPIK_PATH is not a git repository: $OPIK_PATH" >&2
  exit 1
fi

cd "$OPIK_PATH"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "origin remote not found in $OPIK_PATH" >&2
  exit 1
fi

git fetch origin main --quiet 2>/dev/null || git fetch origin --quiet

USERNAME="$(resolve_username)"
if [[ -n "$ISSUE_NUMBER" ]]; then
  TICKET="issue-${ISSUE_NUMBER}"
else
  TICKET="NA"
fi

if [[ -n "$SUMMARY" ]]; then
  SUMMARY="$(slugify_summary "$SUMMARY")"
else
  SUMMARY="onboarding"
fi

branch="${USERNAME}/${TICKET}-${SUMMARY}"

if git show-ref --verify --quiet "refs/heads/${branch}"; then
  git checkout "$branch" --quiet
elif git ls-remote --exit-code origin "refs/heads/${branch}" >/dev/null 2>&1; then
  # Remote exists but local does not: fetch and check out that tip (do not recreate from main).
  git fetch origin "refs/heads/${branch}:refs/remotes/origin/${branch}" --quiet
  git checkout -B "$branch" "origin/${branch}" --quiet
else
  git checkout -b "$branch" origin/main --quiet
fi

echo "$branch"

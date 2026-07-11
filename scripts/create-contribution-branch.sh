#!/usr/bin/env bash
# Usage: create-contribution-branch.sh [--issue NUMBER]
# Output: branch name on stdout; creates branch in OPIK_PATH from origin/main
# Pattern: opik-onboarding-tool-97115104-contribution-{N}
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/common.sh
source "${SCRIPT_DIR}/common.sh"

export_tool_defaults

CONTRIBUTOR_ID="${CONTRIBUTOR_ID:-97115104}"
BRANCH_PREFIX="${BRANCH_PREFIX:-opik-onboarding-tool-${CONTRIBUTOR_ID}-contribution}"
ISSUE_NUMBER=""

usage() {
  cat <<EOF
Usage: create-contribution-branch.sh [--issue NUMBER]

Create a contribution branch in OPIK_PATH from origin/main.
Branch pattern: ${BRANCH_PREFIX}-{N}
Prints branch name on stdout.
EOF
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

find_free_n() {
  local n=1
  local branch
  while true; do
    branch="${BRANCH_PREFIX}-${n}"
    if ! git show-ref --verify --quiet "refs/heads/${branch}" \
      && ! git ls-remote --exit-code origin "refs/heads/${branch}" >/dev/null 2>&1; then
      echo "$n"
      return
    fi
    n=$((n + 1))
  done
}

if [[ -n "$ISSUE_NUMBER" ]]; then
  candidate="${BRANCH_PREFIX}-${ISSUE_NUMBER}"
  if git show-ref --verify --quiet "refs/heads/${candidate}" \
    || git ls-remote --exit-code origin "refs/heads/${candidate}" >/dev/null 2>&1; then
    n="$(find_free_n)"
  else
    n="$ISSUE_NUMBER"
  fi
else
  n="$(find_free_n)"
fi

branch="${BRANCH_PREFIX}-${n}"

if git show-ref --verify --quiet "refs/heads/${branch}"; then
  git checkout "$branch" --quiet
else
  git checkout -b "$branch" origin/main --quiet
fi

echo "$branch"

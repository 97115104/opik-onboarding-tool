#!/usr/bin/env bash
# Shared helpers for onboarding tool scripts.

tool_root() {
  local src="${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}"
  local dir
  dir="$(cd "$(dirname "$src")/.." && pwd)"
  printf '%s\n' "$dir"
}

export_tool_defaults() {
  local root
  root="$(tool_root)"
  export TOOL_ROOT="$root"
  export OPIK_PATH="${OPIK_PATH:-$(dirname "$root")/opik}"
  export ONBOARDING_UI_PORT="${ONBOARDING_UI_PORT:-4310}"
  export CHAT_DEMO_PORT="${CHAT_DEMO_PORT:-4311}"
  export OPIK_FRONTEND_URL="${OPIK_FRONTEND_URL:-http://localhost:5173}"
  export OPIK_API_URL="${OPIK_API_URL:-http://localhost:5173/api}"
  export OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
  export OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.1:latest}"
  export OPIK_PROJECT_NAME="${OPIK_PROJECT_NAME:-chat-demo}"
}

state_dir() {
  printf '%s\n' "${XDG_STATE_HOME:-$HOME/.local/state}/opik-onboarding-tool"
}

pid_file() {
  printf '%s/%s.pid\n' "$(state_dir)" "$1"
}

log_file() {
  printf '%s/%s.log\n' "$(state_dir)" "$1"
}

ensure_state_dir() {
  mkdir -p "$(state_dir)"
}

wait_for_url() {
  local url="$1"
  local timeout="${2:-120}"
  local label="${3:-$url}"
  local elapsed=0

  while [[ "$elapsed" -lt "$timeout" ]]; do
    if curl -fsS -o /dev/null "$url" 2>/dev/null; then
      echo "$label is ready at $url"
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Timed out waiting for $label at $url (${timeout}s)" >&2
  return 1
}

is_linux() {
  [[ "$(uname -s)" == "Linux" ]]
}

is_macos() {
  [[ "$(uname -s)" == "Darwin" ]]
}

ensure_path_has_bun() {
  if [[ -d "$HOME/.bun/bin" ]] && [[ ":$PATH:" != *":$HOME/.bun/bin:"* ]]; then
    export PATH="$HOME/.bun/bin:$PATH"
  fi
}

bun_install_if_present() {
  local app_dir="$1"
  if [[ -f "$app_dir/package.json" ]]; then
    echo "Running bun install in $app_dir"
    (cd "$app_dir" && bun install)
  else
    echo "Skipping bun install — no package.json in $app_dir"
  fi
}

start_background_service() {
  local name="$1"
  shift
  ensure_state_dir
  local pf lf
  pf="$(pid_file "$name")"
  lf="$(log_file "$name")"

  if [[ -f "$pf" ]]; then
    local old_pid
    old_pid="$(cat "$pf")"
    if kill -0 "$old_pid" 2>/dev/null; then
      echo "$name already running (pid $old_pid)"
      return 0
    fi
  fi

  echo "Starting $name (log: $lf)"
  nohup "$@" >>"$lf" 2>&1 &
  echo $! >"$pf"
  echo "$name started (pid $(cat "$pf"))"
}

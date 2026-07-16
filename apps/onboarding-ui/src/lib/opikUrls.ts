// This module also runs in Vite's Node process for the same-origin proxy.
const viteEnv = (
  import.meta as ImportMeta & {
    env?: { VITE_OPIK_FRONTEND_URL?: string; VITE_OPIK_PROJECT_NAME?: string }
  }
).env
const OPIK_FRONTEND_URL =
  viteEnv?.VITE_OPIK_FRONTEND_URL ??
  (typeof process !== 'undefined' ? process.env.OPIK_FRONTEND_URL : undefined) ??
  'http://127.0.0.1:5173'

export const OPIK_WORKSPACE = 'default'
export const OPIK_TOUR_PROJECT_NAME =
  viteEnv?.VITE_OPIK_PROJECT_NAME ??
  (typeof process !== 'undefined' ? process.env.OPIK_PROJECT_NAME : undefined) ??
  'chat-demo'

function opikFrontendUrl(): string {
  return OPIK_FRONTEND_URL.replace(/\/$/, '')
}

export function opikHomeUrl(): string {
  return `${opikFrontendUrl()}/${OPIK_WORKSPACE}/home`
}

export function opikProjectLogsUrl(projectId: string): string {
  return `${opikFrontendUrl()}/${OPIK_WORKSPACE}/projects/${encodeURIComponent(projectId)}/logs?logsType=traces`
}

export function opikProjectRedirectUrl(name: string): string {
  return `${opikFrontendUrl()}/${OPIK_WORKSPACE}/redirect/projects?name=${encodeURIComponent(name)}`
}

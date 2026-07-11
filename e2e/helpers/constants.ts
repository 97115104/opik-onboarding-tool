// Use 127.0.0.1 — Playwright resolves localhost to ::1 first, but Vite binds 127.0.0.1.
export const ONBOARDING_UI_URL =
  process.env.ONBOARDING_UI_URL ?? "http://127.0.0.1:4310";
export const CHAT_DEMO_URL =
  process.env.CHAT_DEMO_URL ?? "http://127.0.0.1:4311";
export const OPIK_FRONTEND_URL =
  process.env.OPIK_FRONTEND_URL ?? "http://127.0.0.1:5173";
export const OPIK_API_URL =
  process.env.OPIK_API_URL ?? "http://127.0.0.1:5173/api";

export const BRANCH_NAME_PATTERN =
  /opik-onboarding-tool-97115104-contribution-\d+/;

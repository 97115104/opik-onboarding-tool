// Use 127.0.0.1 — Playwright resolves localhost to ::1 first, but Vite binds 127.0.0.1.
export const ONBOARDING_UI_URL =
  process.env.ONBOARDING_UI_URL ?? "http://127.0.0.1:4310";
export const CHAT_DEMO_URL =
  process.env.CHAT_DEMO_URL ?? "http://127.0.0.1:4311";
export const OPIK_FRONTEND_URL =
  process.env.OPIK_FRONTEND_URL ?? "http://127.0.0.1:5173";
export const OPIK_API_URL =
  process.env.OPIK_API_URL ?? "http://127.0.0.1:5173/api";
export const OPIK_PROJECT_NAME = process.env.OPIK_PROJECT_NAME ?? "chat-demo";

/** Keep in sync with apps/onboarding-ui BRANCH_NAME_MATCH (Opik + legacy). */
const USERNAME_RE = "[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?";
const TICKET_RE = "(?:issue-\\d+|OPIK-\\d+|NA)";
const SUMMARY_RE = "[a-z0-9]+(?:-[a-z0-9]+)*";
const LEGACY_RE = "opik-onboarding-tool-[A-Za-z0-9_-]+-contribution-\\d+";

export const BRANCH_NAME_PATTERN = new RegExp(
  `(?:${USERNAME_RE}\\/${TICKET_RE}-${SUMMARY_RE}|${LEGACY_RE})`,
);

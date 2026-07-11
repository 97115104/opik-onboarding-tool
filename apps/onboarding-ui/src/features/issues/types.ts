export type Persona = "engineer" | "pm" | "support" | "external";

export interface RankedIssue {
  number: number;
  title: string;
  url: string;
  score: number;
  labels: string[];
  plainExplanation?: string;
  /** Optional short excerpt from the GitHub issue body. */
  excerpt?: string;
  body?: string;
}

export interface ContributionState {
  persona: Persona | null;
  /** Derived: persona === 'engineer' || persona === 'external' */
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
  quizFinished: boolean;
  contributingQuizFinished: boolean;
}

/**
 * Opik CONTRIBUTING branch: `{username}/{ticket}-{summary}`
 * ticket: `issue-{N}`, `OPIK-{N}`, or `NA`
 * Also accepts legacy onboarding branches: `opik-onboarding-tool-*-contribution-{N}`
 */
const USERNAME_RE = "[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?";
const TICKET_RE = "(?:issue-\\d+|OPIK-\\d+|NA)";
const SUMMARY_RE = "[a-z0-9]+(?:-[a-z0-9]+)*";
const LEGACY_RE = "opik-onboarding-tool-[A-Za-z0-9_-]+-contribution-\\d+";

export const BRANCH_NAME_PATTERN = new RegExp(
  `^(?:${USERNAME_RE}\\/${TICKET_RE}-${SUMMARY_RE}|${LEGACY_RE})$`,
);

/** Non-anchored match for prompts / e2e (new Opik convention + legacy). */
export const BRANCH_NAME_MATCH = new RegExp(
  `(?:${USERNAME_RE}\\/${TICKET_RE}-${SUMMARY_RE}|${LEGACY_RE})`,
);

/** Default sibling Opik clone path; B shell may override via env at build time. */
export const DEFAULT_OPIK_PATH = "../opik";

export const PERSONA_STORAGE_KEY = "opik-onboarding-persona";
export const QUIZ_FINISHED_STORAGE_KEY = "opik-quiz-finished";
export const CONTRIBUTING_QUIZ_FINISHED_STORAGE_KEY = "opik-contributing-quiz-finished";

/** Slug for Opik branch summary segment (lowercase, non-alnum → `-`, ~40 chars). */
export function slugifySummary(title: string, maxLen = 40): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, maxLen)
    .replace(/-+$/, "");
  return slug || "onboarding";
}

/**
 * Client-side Opik branch name when the contribution API is unavailable.
 * Pass the real GitHub username from `/api/contributor` when possible.
 */
export function buildOpikBranchName(
  issueNumber: number,
  title: string,
  username: string,
): string {
  const safeUser = username.trim() || "contributor";
  return `${safeUser}/issue-${issueNumber}-${slugifySummary(title)}`;
}

export function isEngineerPersona(persona: Persona | null): boolean {
  return persona === "engineer" || persona === "external";
}

export function parsePersona(value: string | null | undefined): Persona | null {
  if (value === "engineer" || value === "pm" || value === "support" || value === "external") {
    return value;
  }
  return null;
}

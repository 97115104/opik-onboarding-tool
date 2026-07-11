import type { Persona, RankedIssue } from "./types";

const USEFUL_LABELS = new Set([
  "good first issue",
  "help wanted",
  "documentation",
  "docs",
  "bug",
  "enhancement",
]);

export function usefulLabels(labels: string[]): string[] {
  return labels.filter((l) => USEFUL_LABELS.has(l.toLowerCase()));
}

export function explainIssue(issue: RankedIssue, persona: Persona | null): string {
  if (issue.plainExplanation) return issue.plainExplanation;

  const labels = new Set(issue.labels.map((l) => l.toLowerCase()));
  const title = issue.title.toLowerCase();
  const simple = persona === "pm" || persona === "support";

  if (labels.has("documentation") || labels.has("docs") || /\bdocs?\b/.test(title)) {
    return simple
      ? "A documentation or wording fix. Good if you prefer writing over deep code changes."
      : "Documentation or copy update. Usually low risk and easy to review.";
  }
  if (labels.has("good first issue")) {
    return simple
      ? "Marked as a good first issue: a smaller, well-scoped change for newcomers."
      : "Labeled good first issue: scoped for first-time contributors.";
  }
  if (labels.has("help wanted")) {
    return simple
      ? "Maintainers asked for help on this. The issue description should outline what is needed."
      : "Help wanted: maintainers are looking for an outside contribution.";
  }
  if (labels.has("bug") || /\bbug\b|\bfix\b|\berror\b/.test(title)) {
    return simple
      ? "A bug fix. Read the issue carefully and reproduce the problem before changing code."
      : "Bug fix: reproduce first, then implement a focused change with tests if possible.";
  }
  if (/docker|rpi|raspberry|infra|kubernetes|helm|ci\b/.test(title)) {
    return simple
      ? "Likely infrastructure or environment related. Prefer a docs or good-first alternative if unsure."
      : "Infrastructure or environment oriented. Expect setup and platform context.";
  }

  return simple
    ? "A scoped Opik change. Open the issue link to see what maintainers expect."
    : "Open the issue for acceptance criteria, then implement a focused change on your branch.";
}

/** Rough Cursor-agent time estimate from labels/title. */
export function estimateCursorTime(issue: RankedIssue): string {
  const labels = new Set(issue.labels.map((l) => l.toLowerCase()));
  const title = issue.title.toLowerCase();

  if (labels.has("good first issue")) return "About 15 to 30 minutes with Cursor";
  if (labels.has("documentation") || labels.has("docs") || /\bdocs?\b/.test(title)) {
    return "About 20 to 40 minutes with Cursor";
  }
  if (labels.has("bug") || /\bbug\b|\bfix\b|\berror\b/.test(title)) {
    return "About 30 to 90 minutes with Cursor";
  }
  if (/docker|rpi|raspberry|infra|kubernetes|helm|ci\b/.test(title)) {
    return "About 1 to 2 hours with Cursor (setup may take longer)";
  }
  return "About 30 to 60 minutes with Cursor";
}

export function issueExcerpt(issue: RankedIssue): string {
  const raw = (issue.excerpt ?? issue.body ?? "").trim();
  if (raw) {
    const cleaned = raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
    return cleaned.length > 420 ? `${cleaned.slice(0, 417).trimEnd()}…` : cleaned;
  }
  return "No issue description was available. Open GitHub for the full write-up.";
}

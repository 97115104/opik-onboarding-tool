export type Persona = "engineer" | "pm" | "support" | "external";

export interface RankedIssue {
  number: number;
  title: string;
  url: string;
  score: number;
  labels: string[];
  plainExplanation?: string;
}

export interface ContributionState {
  persona: Persona | null;
  /** Derived: persona === 'engineer' || persona === 'external' */
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
  quizFinished: boolean;
}

export const BRANCH_NAME_PATTERN = /^opik-onboarding-tool-97115104-contribution-\d+$/;

/** Default sibling Opik clone path; B shell may override via env at build time. */
export const DEFAULT_OPIK_PATH = "../opik";

export const PERSONA_STORAGE_KEY = "opik-onboarding-persona";
export const QUIZ_FINISHED_STORAGE_KEY = "opik-quiz-finished";

export function isEngineerPersona(persona: Persona | null): boolean {
  return persona === "engineer" || persona === "external";
}

export function parsePersona(value: string | null | undefined): Persona | null {
  if (value === "engineer" || value === "pm" || value === "support" || value === "external") {
    return value;
  }
  return null;
}

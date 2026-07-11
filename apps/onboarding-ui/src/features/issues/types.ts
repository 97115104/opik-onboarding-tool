export interface RankedIssue {
  number: number;
  title: string;
  url: string;
  score: number;
  labels: string[];
}

export interface ContributionState {
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
}

export const BRANCH_NAME_PATTERN = /^opik-onboarding-tool-97115104-contribution-\d+$/;

/** Default sibling Opik clone path; B shell may override via env at build time. */
export const DEFAULT_OPIK_PATH = "../opik";

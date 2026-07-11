import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { contributionStore, useContributionStore } from "./contributionStore";
import type { RankedIssue } from "./types";

interface ContributionContextValue {
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
  setIsEngineer: (value: boolean) => void;
  setSelectedIssue: (issue: RankedIssue | null) => void;
  setBranchName: (name: string | null) => void;
  setQuizPassed: (passed: boolean) => void;
}

const ContributionContext = createContext<ContributionContextValue | null>(null);

/** Optional provider — shared state works via contributionStore without it. */
export function ContributionProvider({ children }: { children: ReactNode }) {
  const value = useContributionStore();
  return (
    <ContributionContext.Provider value={value}>{children}</ContributionContext.Provider>
  );
}

export function useContribution(): ContributionContextValue {
  const ctx = useContext(ContributionContext);
  if (ctx) return ctx;
  return useContributionStore();
}

export function useContributionOptional(): ContributionContextValue | null {
  const ctx = useContext(ContributionContext);
  return ctx ?? null;
}

export function useSelectIssue() {
  const { setSelectedIssue, setBranchName } = useContribution();

  const selectIssue = useCallback(
    async (issue: RankedIssue) => {
      setSelectedIssue(issue);
      try {
        const res = await fetch(
          `/api/contribution-branch?issue=${encodeURIComponent(String(issue.number))}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { branch: string };
          setBranchName(data.branch);
          return data.branch;
        }
      } catch {
        /* API may be unavailable outside dev */
      }

      const fallback = `opik-onboarding-tool-97115104-contribution-${issue.number}`;
      setBranchName(fallback);
      return fallback;
    },
    [setSelectedIssue, setBranchName],
  );

  return { selectIssue };
}

export { contributionStore };

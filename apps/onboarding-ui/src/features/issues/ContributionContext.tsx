import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { contributionStore, useContributionStore } from "./contributionStore";
import { buildOpikBranchName, slugifySummary } from "./types";
import type { Persona, RankedIssue } from "./types";

interface ContributionContextValue {
  persona: Persona | null;
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
  quizFinished: boolean;
  contributingQuizFinished: boolean;
  setPersona: (persona: Persona | null) => void;
  setIsEngineer: (value: boolean) => void;
  setSelectedIssue: (issue: RankedIssue | null) => void;
  setBranchName: (name: string | null) => void;
  setQuizPassed: (passed: boolean) => void;
  setQuizFinished: (finished: boolean) => void;
  setContributingQuizFinished: (finished: boolean) => void;
}

const ContributionContext = createContext<ContributionContextValue | null>(null);

/** Optional provider. Shared state works via contributionStore without it. */
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
      const summary = slugifySummary(issue.title);
      try {
        const params = new URLSearchParams({
          issue: String(issue.number),
          summary,
        });
        const res = await fetch(`/api/contribution-branch?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as { branch: string };
          setBranchName(data.branch);
          return data.branch;
        }
      } catch {
        /* API may be unavailable outside dev */
      }

      let username = "";
      try {
        const userRes = await fetch("/api/contributor");
        if (userRes.ok) {
          const data = (await userRes.json()) as { username?: string };
          username = data.username?.trim() ?? "";
        }
      } catch {
        /* ignore — last-resort fallback below */
      }

      if (!username) {
        // Do not invent a green-passable fake handle when we cannot resolve identity.
        setBranchName(null);
        return null;
      }

      const fallback = buildOpikBranchName(issue.number, issue.title, username);
      setBranchName(fallback);
      return fallback;
    },
    [setSelectedIssue, setBranchName],
  );

  return { selectIssue };
}

export { contributionStore };

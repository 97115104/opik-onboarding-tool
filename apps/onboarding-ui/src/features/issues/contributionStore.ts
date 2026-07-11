import { useCallback, useSyncExternalStore } from "react";
import type { RankedIssue } from "./types";

export interface ContributionSnapshot {
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
}

let snapshot: ContributionSnapshot = {
  isEngineer: false,
  selectedIssue: null,
  branchName: null,
  quizPassed: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSnapshot(partial: Partial<ContributionSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export const contributionStore = {
  getSnapshot: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setIsEngineer: (value: boolean) => setSnapshot({ isEngineer: value }),
  setSelectedIssue: (issue: RankedIssue | null) => setSnapshot({ selectedIssue: issue }),
  setBranchName: (name: string | null) => setSnapshot({ branchName: name }),
  setQuizPassed: (passed: boolean) => setSnapshot({ quizPassed: passed }),
};

export function useContributionStore() {
  const state = useSyncExternalStore(
    contributionStore.subscribe,
    contributionStore.getSnapshot,
    contributionStore.getSnapshot,
  );

  const setIsEngineer = useCallback(
    (value: boolean) => contributionStore.setIsEngineer(value),
    [],
  );
  const setSelectedIssue = useCallback(
    (issue: RankedIssue | null) => contributionStore.setSelectedIssue(issue),
    [],
  );
  const setBranchName = useCallback(
    (name: string | null) => contributionStore.setBranchName(name),
    [],
  );
  const setQuizPassed = useCallback(
    (passed: boolean) => contributionStore.setQuizPassed(passed),
    [],
  );

  return {
    ...state,
    setIsEngineer,
    setSelectedIssue,
    setBranchName,
    setQuizPassed,
  };
}

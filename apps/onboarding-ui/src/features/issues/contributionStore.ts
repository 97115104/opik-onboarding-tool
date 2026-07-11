import { useCallback, useSyncExternalStore } from "react";
import type { Persona, RankedIssue } from "./types";
import {
  PERSONA_STORAGE_KEY,
  QUIZ_FINISHED_STORAGE_KEY,
  isEngineerPersona,
  parsePersona,
} from "./types";

export interface ContributionSnapshot {
  persona: Persona | null;
  /** Derived: persona === 'engineer' || persona === 'external' */
  isEngineer: boolean;
  selectedIssue: RankedIssue | null;
  branchName: string | null;
  quizPassed: boolean;
  quizFinished: boolean;
}

function readStoredPersona(): Persona | null {
  try {
    return parsePersona(localStorage.getItem(PERSONA_STORAGE_KEY));
  } catch {
    return null;
  }
}

function readStoredQuizFinished(): boolean {
  try {
    return localStorage.getItem(QUIZ_FINISHED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistPersona(persona: Persona | null) {
  try {
    if (persona) {
      localStorage.setItem(PERSONA_STORAGE_KEY, persona);
    } else {
      localStorage.removeItem(PERSONA_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

function persistQuizFinished(finished: boolean) {
  try {
    if (finished) {
      localStorage.setItem(QUIZ_FINISHED_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(QUIZ_FINISHED_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
  try {
    window.dispatchEvent(
      new CustomEvent("opik-quiz-state", { detail: { finished } }),
    );
  } catch {
    /* ignore non-browser */
  }
}

const initialPersona = readStoredPersona();

let snapshot: ContributionSnapshot = {
  persona: initialPersona,
  isEngineer: isEngineerPersona(initialPersona),
  selectedIssue: null,
  branchName: null,
  quizPassed: false,
  quizFinished: readStoredQuizFinished(),
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSnapshot(partial: Partial<ContributionSnapshot>) {
  const next = { ...snapshot, ...partial };
  if ("persona" in partial) {
    next.isEngineer = isEngineerPersona(next.persona);
  }
  snapshot = next;
  emit();
}

export const contributionStore = {
  getSnapshot: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setPersona: (persona: Persona | null) => {
    persistPersona(persona);
    setSnapshot({ persona, isEngineer: isEngineerPersona(persona) });
  },
  /** @deprecated Prefer setPersona. Kept for callers that only flip engineer mode. */
  setIsEngineer: (value: boolean) => {
    contributionStore.setPersona(value ? "engineer" : null);
  },
  setSelectedIssue: (issue: RankedIssue | null) => setSnapshot({ selectedIssue: issue }),
  setBranchName: (name: string | null) => setSnapshot({ branchName: name }),
  setQuizPassed: (passed: boolean) => setSnapshot({ quizPassed: passed }),
  setQuizFinished: (finished: boolean) => {
    persistQuizFinished(finished);
    setSnapshot({ quizFinished: finished });
  },
};

export function useContributionStore() {
  const state = useSyncExternalStore(
    contributionStore.subscribe,
    contributionStore.getSnapshot,
    contributionStore.getSnapshot,
  );

  const setPersona = useCallback(
    (persona: Persona | null) => contributionStore.setPersona(persona),
    [],
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
  const setQuizFinished = useCallback(
    (finished: boolean) => contributionStore.setQuizFinished(finished),
    [],
  );

  return {
    ...state,
    setPersona,
    setIsEngineer,
    setSelectedIssue,
    setBranchName,
    setQuizPassed,
    setQuizFinished,
  };
}

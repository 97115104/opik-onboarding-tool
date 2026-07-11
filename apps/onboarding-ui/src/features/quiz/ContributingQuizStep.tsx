import { useCallback } from "react";
import contributingQuizData from "@content/contributing-quiz.json";
import { useContribution } from "../issues/ContributionContext";
import { QuizPanel } from "./QuizPanel";
import type { QuizData } from "./types";

const CONTRIBUTING_QUIZ_TEST_IDS = {
  step: "step-contributing-quiz",
  option: (index: number) => `contributing-quiz-option-${index}`,
  nextQuestion: "contributing-quiz-next-question",
  results: "contributing-quiz-results",
} as const;

function ContributingQuizStepContent() {
  const { setContributingQuizFinished } = useContribution();

  const onMountReset = useCallback(() => {
    setContributingQuizFinished(false);
  }, [setContributingQuizFinished]);

  const onFinished = useCallback(() => {
    setContributingQuizFinished(true);
  }, [setContributingQuizFinished]);

  return (
    <QuizPanel
      data={contributingQuizData as QuizData}
      title="Contributing quiz"
      resultsTitle="Contributing quiz results"
      unavailableMessage="Could not load content/contributing-quiz.json."
      continueHint="Use the wizard Next button to continue to issue assignment."
      testIds={CONTRIBUTING_QUIZ_TEST_IDS}
      onMountReset={onMountReset}
      onFinished={onFinished}
    />
  );
}

export default function ContributingQuizStep() {
  return <ContributingQuizStepContent />;
}

export { ContributingQuizStepContent as ContributingQuizStep };

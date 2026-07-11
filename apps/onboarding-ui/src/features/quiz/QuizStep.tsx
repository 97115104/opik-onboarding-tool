import { useCallback } from "react";
import quizData from "@content/quiz.json";
import { useContribution } from "../issues/ContributionContext";
import { QuizPanel } from "./QuizPanel";
import type { QuizData } from "./types";

const PRODUCT_QUIZ_TEST_IDS = {
  step: "step-quiz",
  option: (index: number) => `quiz-option-${index}`,
  nextQuestion: "quiz-next-question",
  results: "quiz-results",
} as const;

function QuizStepContent() {
  const { setQuizPassed, setQuizFinished } = useContribution();

  const onMountReset = useCallback(() => {
    setQuizFinished(false);
    setQuizPassed(false);
  }, [setQuizFinished, setQuizPassed]);

  const onFinished = useCallback(
    (passed: boolean) => {
      setQuizPassed(passed);
      setQuizFinished(true);
    },
    [setQuizPassed, setQuizFinished],
  );

  return (
    <QuizPanel
      data={quizData as QuizData}
      title="Knowledge quiz"
      unavailableMessage="Could not load content/quiz.json."
      continueHint="Use the wizard Next button to continue to the contributing overview."
      testIds={PRODUCT_QUIZ_TEST_IDS}
      onMountReset={onMountReset}
      onFinished={onFinished}
    />
  );
}

export default function QuizStep() {
  return <QuizStepContent />;
}

export { QuizStepContent as QuizStep };

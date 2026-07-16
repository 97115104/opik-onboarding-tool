import { useEffect } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useQuiz } from "./useQuiz";
import type { QuizData } from "./types";

export type QuizTestIds = {
  step: string;
  option: (index: number) => string;
  nextQuestion: string;
  results: string;
};

export type QuizPanelProps = {
  data: QuizData;
  title: string;
  resultsTitle?: string;
  /** Active-question subtitle. Defaults to pass-aim copy that does not claim pass is required to continue. */
  questionSubtitle?: string;
  unavailableMessage: string;
  continueHint: string;
  testIds: QuizTestIds;
  onMountReset: () => void;
  onFinished: (passed: boolean) => void;
};

export function QuizPanel({
  data,
  title,
  resultsTitle = "Quiz results",
  questionSubtitle,
  unavailableMessage,
  continueHint,
  testIds,
  onMountReset,
  onFinished,
}: QuizPanelProps) {
  const {
    quiz,
    currentIndex,
    currentQuestion,
    currentAnswer,
    selectOption,
    nextQuestion,
    graded,
    showResults,
    correctCount,
    passed,
    missed,
    totalQuestions,
  } = useQuiz(data);

  useEffect(() => {
    onMountReset();
  }, [onMountReset]);

  useEffect(() => {
    if (!showResults) return;
    onFinished(passed);
  }, [showResults, passed, onFinished]);

  if (!currentQuestion || !quiz) {
    return (
      <StepPanel testId={testIds.step} title={title} subtitle="Quiz unavailable.">
        <p className="text-sm text-slate-500">{unavailableMessage}</p>
      </StepPanel>
    );
  }

  if (showResults) {
    return (
      <StepPanel
        testId={testIds.step}
        title={resultsTitle}
        subtitle={`You need ${quiz.passThreshold} of ${quiz.totalQuestions} correct to pass.`}
      >
        <div data-testid={testIds.results} className="space-y-4">
          <p className={`text-base font-medium ${passed ? "text-emerald-700" : "text-amber-700"}`}>
            Score: {correctCount} / {totalQuestions}.{" "}
            {passed ? "You passed." : "You did not reach the pass threshold yet."}
          </p>

          {missed.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">Missed questions</p>
              <ul className="space-y-3">
                {missed.map(({ question }) => (
                  <li
                    key={question.id}
                    className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3"
                  >
                    <p className="text-sm text-slate-900">{question.text}</p>
                    <p className="mt-2 text-sm text-slate-500">{question.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No missed questions.</p>
          )}

          <p className="text-sm text-slate-500">{continueHint}</p>
        </div>
      </StepPanel>
    );
  }

  const isCorrect = currentAnswer?.isCorrect === true;
  const isWrong = currentAnswer?.isCorrect === false;
  const activeSubtitle =
    questionSubtitle ??
    `Aim for ${quiz.passThreshold} of ${quiz.totalQuestions} correct to pass. Finish the quiz to continue.`;

  return (
    <StepPanel testId={testIds.step} title={title} subtitle={activeSubtitle}>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <p className="text-base text-slate-900">{currentQuestion.text}</p>
          <p className="text-sm text-slate-500">
            Score so far: {correctCount} / {quiz.passThreshold} required
          </p>
        </div>

        <div className="space-y-2" role="radiogroup" aria-label="Quiz options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer?.selectedIndex === index;
            const isCorrectOption = index === currentQuestion.correctIndex;
            const revealCorrect = graded && isCorrectOption;
            const revealWrong = isWrong && isSelected;

            return (
              <button
                key={index}
                type="button"
                data-testid={testIds.option(index)}
                disabled={graded}
                onClick={() => selectOption(index)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  revealCorrect
                    ? "border-emerald-500/60 bg-emerald-50 text-emerald-900"
                    : revealWrong
                      ? "border-amber-500/60 bg-amber-50 text-amber-900"
                      : isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-slate-900"
                        : "border-[var(--color-border)] bg-white text-slate-800 hover:border-slate-400"
                } ${graded ? "cursor-default" : "cursor-pointer"}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {graded && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              isCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {isCorrect ? (
              <p>Correct. {currentQuestion.explanation}</p>
            ) : (
              <>
                <p className="font-medium">Incorrect.</p>
                <p className="mt-1">{currentQuestion.explanation}</p>
              </>
            )}
          </div>
        )}

        {graded && (
          <div className="flex justify-end">
            <button
              type="button"
              data-testid={testIds.nextQuestion}
              onClick={nextQuestion}
              className="btn-primary px-4 py-2 font-medium"
            >
              {currentIndex >= totalQuestions - 1 ? "See results" : "Next question"}
            </button>
          </div>
        )}
      </div>
    </StepPanel>
  );
}

import { useEffect } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { EngineerFlag } from "./EngineerFlag";
import { useQuiz } from "./useQuiz";

function QuizStepContent() {
  const {
    quiz,
    currentIndex,
    currentQuestion,
    currentAnswer,
    selectedIndex,
    setSelectedIndex,
    submitAnswer,
    showAnswer,
    retryQuestion,
    nextQuestion,
    correctCount,
    passed,
    allAnswered,
    totalQuestions,
  } = useQuiz();

  const { setQuizPassed } = useContribution();

  useEffect(() => {
    setQuizPassed(passed);
  }, [passed, setQuizPassed]);

  if (!currentQuestion || !quiz) {
    return (
      <StepPanel testId="step-quiz" title="Knowledge quiz" subtitle="Quiz unavailable.">
        <p className="text-sm text-slate-400">Could not load content/quiz.json.</p>
      </StepPanel>
    );
  }

  const answered = currentAnswer?.isCorrect !== null;
  const wrong = currentAnswer?.isCorrect === false;
  const showExplanation = wrong || currentAnswer?.showAnswer;
  const canAdvance =
    currentAnswer?.isCorrect === true || currentAnswer?.showAnswer === true;

  return (
    <StepPanel
      testId="step-quiz"
      title="Knowledge quiz"
      subtitle={`Answer ${quiz.passThreshold} of ${quiz.totalQuestions} correctly to continue.`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <p className="text-base text-slate-100">{currentQuestion.text}</p>
          <p className="text-sm text-slate-500">
            Score: {correctCount} / {quiz.passThreshold} required
          </p>
        </div>

        <div className="space-y-2" role="radiogroup" aria-label="Quiz options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrectOption = index === currentQuestion.correctIndex;
            const revealCorrect = showExplanation && isCorrectOption;

            return (
              <button
                key={index}
                type="button"
                data-testid={`quiz-option-${index}`}
                disabled={answered && !wrong}
                onClick={() => !answered && setSelectedIndex(index)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  revealCorrect
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                    : isSelected
                      ? "border-sky-500/50 bg-sky-500/10 text-slate-100"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-slate-300 hover:border-slate-600"
                } ${answered && !wrong ? "cursor-default opacity-70" : "cursor-pointer"}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          {!answered && (
            <button
              type="button"
              data-testid="quiz-submit"
              disabled={selectedIndex === null}
              onClick={submitAnswer}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40"
            >
              Submit
            </button>
          )}

          {wrong && !currentAnswer?.showAnswer && (
            <>
              <button
                type="button"
                data-testid="quiz-show-answer"
                onClick={showAnswer}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-slate-200"
              >
                Show answer
              </button>
              <button
                type="button"
                onClick={retryQuestion}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-slate-200"
              >
                Try again
              </button>
            </>
          )}
        </div>

        {showExplanation && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {currentQuestion.explanation}
          </div>
        )}

        {canAdvance && currentIndex < totalQuestions - 1 && (
          <button
            type="button"
            onClick={nextQuestion}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900"
          >
            Next question
          </button>
        )}

        {allAnswered && (
          <p className={`text-sm font-medium ${passed ? "text-emerald-400" : "text-amber-400"}`}>
            {passed
              ? "Quiz passed — continue to issue assignment."
              : `Keep reviewing — ${correctCount}/${quiz.passThreshold} correct.`}
          </p>
        )}

        <EngineerFlag className="border-t border-[var(--color-border)] pt-4" />
      </div>
    </StepPanel>
  );
}

export default function QuizStep() {
  return <QuizStepContent />;
}

export { QuizStepContent as QuizStep };

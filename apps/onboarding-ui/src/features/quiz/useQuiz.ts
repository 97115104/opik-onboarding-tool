import { useCallback, useState } from "react";
import type { QuizAnswerState, QuizData } from "./types";

export function useQuiz(quizData: QuizData) {
  const [quiz] = useState<QuizData>(() => quizData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerState[]>(() =>
    quizData.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: null,
      isCorrect: null,
      showAnswer: false,
    })),
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentIndex] ?? null;
  const currentAnswer = answers[currentIndex] ?? null;
  const graded = currentAnswer?.isCorrect !== null;

  const selectOption = useCallback(
    (index: number) => {
      if (!currentQuestion || graded || showResults) return;
      const isCorrect = index === currentQuestion.correctIndex;
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          selectedIndex: index,
          isCorrect,
          showAnswer: !isCorrect,
        };
        return next;
      });
    },
    [currentIndex, currentQuestion, graded, showResults],
  );

  const nextQuestion = useCallback(() => {
    if (!graded) return;
    if (currentIndex >= quiz.questions.length - 1) {
      setShowResults(true);
      return;
    }
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  }, [currentIndex, graded, quiz.questions.length]);

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const passed = correctCount >= quiz.passThreshold;
  const missed = answers
    .map((a, i) => ({ answer: a, question: quiz.questions[i] }))
    .filter(({ answer }) => answer.isCorrect === false);

  return {
    quiz,
    loading: false,
    error: null as string | null,
    currentIndex,
    currentQuestion,
    currentAnswer,
    selectedIndex: currentAnswer?.selectedIndex ?? null,
    selectOption,
    nextQuestion,
    graded,
    showResults,
    correctCount,
    passed,
    missed,
    totalQuestions: quiz.questions.length,
  };
}

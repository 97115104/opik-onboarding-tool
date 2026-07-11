import { useCallback, useState } from "react";
import quizData from "@content/quiz.json";
import type { QuizAnswerState, QuizData } from "./types";

export function useQuiz() {
  const [quiz] = useState<QuizData>(() => quizData as QuizData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerState[]>(() =>
    quizData.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: null,
      isCorrect: null,
      showAnswer: false,
    })),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const currentQuestion = quiz.questions[currentIndex] ?? null;
  const currentAnswer = answers[currentIndex] ?? null;

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || selectedIndex === null) return;
    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        selectedIndex,
        isCorrect,
        showAnswer: false,
      };
      return next;
    });
  }, [currentIndex, currentQuestion, selectedIndex]);

  const showAnswer = useCallback(() => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        showAnswer: true,
        isCorrect: next[currentIndex].isCorrect ?? false,
      };
      return next;
    });
  }, [currentIndex]);

  const retryQuestion = useCallback(() => {
    setSelectedIndex(null);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        questionId: next[currentIndex].questionId,
        selectedIndex: null,
        isCorrect: null,
        showAnswer: false,
      };
      return next;
    });
  }, [currentIndex]);

  const nextQuestion = useCallback(() => {
    setSelectedIndex(null);
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  }, [quiz.questions.length]);

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const passed = correctCount >= quiz.passThreshold;
  const allAnswered = answers.every((a) => a.isCorrect !== null || a.showAnswer);

  return {
    quiz,
    loading: false,
    error: null as string | null,
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
    totalQuestions: quiz.questions.length,
  };
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  passThreshold: number;
  totalQuestions: number;
}

export interface QuizAnswerState {
  questionId: string;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  showAnswer: boolean;
}

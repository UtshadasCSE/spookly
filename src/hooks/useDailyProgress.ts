import { useState, useEffect, useCallback } from 'react';
import {
  AnswerEvaluation,
  Category,
  Difficulty,
  DailySessionState,
  Question,
  QuestionAnswerRecord,
} from '../types';
import {
  getTodayDateString,
  loadCurrentSession,
  saveCurrentSession,
  clearCurrentSession,
} from '../services/storage';

export interface UseDailyProgressReturn {
  session: DailySessionState | null;
  currentQuestion: Question | null;
  currentRecord: QuestionAnswerRecord | null;
  currentIndex: number;
  totalQuestions: number;
  isSessionCompleted: boolean;
  hasActiveSession: boolean;
  startSession: (category: Category, difficulty: Difficulty, questions: Question[]) => void;
  recordAnswer: (
    questionId: number,
    questionText: string,
    transcript: string,
    evaluation: AnswerEvaluation,
    videoUrl?: string,
    videoDuration?: number
  ) => void;
  advanceToNextQuestion: () => boolean; // returns true if advanced, false if was last question (completed)
  resetSession: () => void;
  todayDate: string;
}

export function useDailyProgress(): UseDailyProgressReturn {
  const [session, setSession] = useState<DailySessionState | null>(() => loadCurrentSession());

  // On mount and window focus, sync session state from localStorage to prevent loss
  useEffect(() => {
    const loaded = loadCurrentSession();
    if (loaded) {
      setSession(loaded);
    }
  }, []);

  const todayDate = getTodayDateString();

  const startSession = useCallback(
    (category: Category, difficulty: Difficulty, questions: Question[]) => {
      const newSession: DailySessionState = {
        date: todayDate,
        category,
        difficulty,
        questions,
        currentIndex: 0,
        answers: {},
        isCompleted: false,
      };
      setSession(newSession);
      saveCurrentSession(newSession);
    },
    [todayDate]
  );

  const recordAnswer = useCallback(
    (
      questionId: number,
      questionText: string,
      transcript: string,
      evaluation: AnswerEvaluation,
      videoUrl?: string,
      videoDuration?: number
    ) => {
      setSession((prev) => {
        if (!prev) return prev;

        const newRecord: QuestionAnswerRecord = {
          questionId,
          question: questionText,
          answerTranscript: transcript,
          evaluation,
          timestamp: Date.now(),
          videoUrl,
          videoDuration,
        };

        const updatedAnswers = {
          ...prev.answers,
          [questionId]: newRecord,
        };

        const updatedSession: DailySessionState = {
          ...prev,
          answers: updatedAnswers,
        };

        saveCurrentSession(updatedSession);
        return updatedSession;
      });
    },
    []
  );

  const advanceToNextQuestion = useCallback((): boolean => {
    const current = session || loadCurrentSession();
    if (!current || !current.questions) return false;

    const nextIndex = current.currentIndex + 1;
    const isNowCompleted = nextIndex >= current.questions.length;

    const updated: DailySessionState = {
      ...current,
      currentIndex: isNowCompleted ? current.currentIndex : nextIndex,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? Date.now() : current.completedAt,
    };

    setSession(updated);
    saveCurrentSession(updated);

    return !isNowCompleted;
  }, [session]);

  const resetSession = useCallback(() => {
    clearCurrentSession();
    setSession(null);
  }, []);

  const currentQuestion =
    session && session.questions && session.questions[session.currentIndex]
      ? session.questions[session.currentIndex]
      : null;

  const currentRecord =
    session && currentQuestion && session.answers[currentQuestion.id]
      ? session.answers[currentQuestion.id]
      : null;

  const isSessionCompleted = Boolean(session && session.isCompleted);
  const hasActiveSession = Boolean(session && session.questions && session.questions.length > 0);

  return {
    session,
    currentQuestion,
    currentRecord,
    currentIndex: session?.currentIndex ?? 0,
    totalQuestions: session?.questions?.length ?? 10,
    isSessionCompleted,
    hasActiveSession,
    startSession,
    recordAnswer,
    advanceToNextQuestion,
    resetSession,
    todayDate,
  };
}

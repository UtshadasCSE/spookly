import { AnswerEvaluation, Category, Difficulty, Question } from '../types';

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function checkServerHealth(): Promise<{
  hasApiKey: boolean;
  model: string;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      hasApiKey: Boolean(data.hasApiKey),
      model: data.model || 'gemini-2.5-flash-lite',
    };
  } catch (err: any) {
    console.warn('Health check failed:', err);
    return { hasApiKey: false, model: 'gemini-2.5-flash-lite' };
  }
}

export async function fetchQuestions(
  category: Category,
  difficulty: Difficulty = 'intermediate',
  count: number = 10
): Promise<Question[]> {
  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, difficulty, count }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to generate questions. Please try again.',
        data.code,
        response.status
      );
    }

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new ApiError('No questions returned from AI service.', 'EMPTY_RESPONSE');
    }

    return data.questions;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err?.message || 'Network error communicating with Spookly server. Please check your connection.',
      'NETWORK_ERROR'
    );
  }
}

export async function submitAnswerEvaluation(
  question: string,
  transcript: string,
  difficulty: Difficulty = 'intermediate'
): Promise<AnswerEvaluation> {
  const clean = (transcript || '').trim();
  if (!clean) {
    throw new ApiError(
      'Spoken answer was empty. Please record your answer before submitting.',
      'EMPTY_TRANSCRIPT',
      400
    );
  }

  try {
    const response = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        transcript: clean,
        difficulty,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to evaluate answer. Please try again.',
        data.code,
        response.status
      );
    }

    if (!data.evaluation) {
      throw new ApiError('Invalid response received from evaluation service.', 'INVALID_EVALUATION');
    }

    return data.evaluation as AnswerEvaluation;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err?.message || 'Network error communicating with Spookly server. Please check your connection.',
      'NETWORK_ERROR'
    );
  }
}

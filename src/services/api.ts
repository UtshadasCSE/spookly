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

/**
 * Safely parses API responses, handling HTML error pages, non-JSON output,
 * gateway timeouts, and Vercel 404s without raw syntax errors.
 */
async function safeParseResponse(response: Response): Promise<any> {
  const text = await response.text();

  if (!text || !text.trim()) {
    if (!response.ok) {
      throw new ApiError(
        `Server returned HTTP ${response.status} with empty response`,
        'EMPTY_HTTP_ERROR',
        response.status
      );
    }
    return {};
  }

  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    // Response is NOT valid JSON (e.g. Vercel 404 HTML, 502/504 Bad Gateway, Nginx error)
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(
          'API route not found (HTTP 404). Please ensure Vercel Serverless Functions in /api are deployed.',
          'ROUTE_NOT_FOUND',
          404
        );
      }
      if (response.status === 502 || response.status === 504) {
        throw new ApiError(
          'API gateway timeout or cold start. Please wait a moment and try again.',
          'GATEWAY_TIMEOUT',
          response.status
        );
      }

      // Clean HTML tags if error is in HTML format
      const cleaned = text.replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
      throw new ApiError(
        `Server error (HTTP ${response.status}): ${cleaned || 'Non-JSON response received'}`,
        'NON_JSON_ERROR',
        response.status
      );
    }

    throw new ApiError(
      'Received an unexpected response format from the server. Expected JSON.',
      'INVALID_JSON_RESPONSE',
      response.status
    );
  }

  // Handle server-returned JSON error payloads
  if (!response.ok) {
    throw new ApiError(
      data?.error || `Request failed with HTTP ${response.status}`,
      data?.code || 'API_ERROR',
      response.status
    );
  }

  return data;
}

export async function checkServerHealth(): Promise<{
  hasApiKey: boolean;
  model: string;
  serverReachable: boolean;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      console.warn(`Health check endpoint returned HTTP ${res.status}`);
      // Do not assume API key is missing if the route is temporarily unreachable
      return { hasApiKey: true, model: 'gemini-3.1-flash-lite', serverReachable: false };
    }
    const data = await safeParseResponse(res);
    return {
      hasApiKey: Boolean(data.hasApiKey),
      model: data.model || 'gemini-3.1-flash-lite',
      serverReachable: true,
    };
  } catch (err: any) {
    console.warn('Health check failed or server unreachable:', err?.message || err);
    // Only claim missing API key if explicitly confirmed by server response
    return { hasApiKey: true, model: 'gemini-3.1-flash-lite', serverReachable: false };
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

    const data = await safeParseResponse(response);

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

    const data = await safeParseResponse(response);

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

import { AnswerEvaluation, Category, Difficulty, Question } from '../types';

export class ApiError extends Error {
  code?: string;
  status?: number;
  isHighDemand?: boolean;

  constructor(message: string, code?: string, status?: number, isHighDemand?: boolean) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.isHighDemand = isHighDemand;
  }
}

/**
 * Checks whether an error is caused by Gemini model high demand (HTTP 503 / UNAVAILABLE)
 */
export function isHighDemandError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const e = err as any;
    if (e.isHighDemand) return true;

    // Check direct status or code
    if (
      e.status === 503 ||
      e.code === 503 ||
      e.code === 'MODEL_HIGH_DEMAND' ||
      e.status === 'UNAVAILABLE' ||
      e.code === 'UNAVAILABLE'
    ) {
      return true;
    }

    // Check nested error object (e.g. { error: { code: 503, message: "...", status: "UNAVAILABLE" } })
    if (e.error && typeof e.error === 'object') {
      if (
        e.error.code === 503 ||
        e.error.status === 503 ||
        e.error.status === 'UNAVAILABLE' ||
        e.error.code === 'UNAVAILABLE' ||
        e.error.code === 'MODEL_HIGH_DEMAND'
      ) {
        return true;
      }
      const nestedMsg = String(e.error.message || '');
      if (
        nestedMsg.includes('503') ||
        nestedMsg.toLowerCase().includes('high demand') ||
        nestedMsg.toLowerCase().includes('spikes in demand') ||
        nestedMsg.includes('UNAVAILABLE')
      ) {
        return true;
      }
    }

    const msg = String(e.message || (typeof e.error === 'string' ? e.error : '') || '');
    if (
      msg.includes('503') ||
      msg.toLowerCase().includes('high demand') ||
      msg.toLowerCase().includes('spikes in demand') ||
      msg.includes('UNAVAILABLE')
    ) {
      return true;
    }
  }

  const str = typeof err === 'string' ? err : JSON.stringify(err);
  return (
    str.includes('503') ||
    str.toLowerCase().includes('high demand') ||
    str.toLowerCase().includes('spikes in demand') ||
    str.includes('UNAVAILABLE')
  );
}

/**
 * Safely parses API responses, handling HTML error pages, non-JSON output,
 * gateway timeouts, Vercel 404s, and Gemini 503 high demand payloads.
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

  // Handle server-returned JSON error payloads or raw Gemini error bodies
  if (!response.ok || (data && data.error)) {
    let errorMessage = `Request failed with HTTP ${response.status}`;
    let errorCode = data?.code || 'API_ERROR';
    let errorStatus = response.status;

    if (typeof data?.error === 'string') {
      errorMessage = data.error;
    } else if (data?.error && typeof data.error === 'object') {
      // Handles raw Gemini format: { error: { code: 503, message: "...", status: "UNAVAILABLE" } }
      errorMessage = data.error.message || JSON.stringify(data.error);
      if (data.error.code) errorStatus = Number(data.error.code) || errorStatus;
      if (data.error.status) errorCode = String(data.error.status);
    }

    const isHighDemand =
      errorStatus === 503 ||
      errorCode === 'MODEL_HIGH_DEMAND' ||
      errorCode === 'UNAVAILABLE' ||
      errorMessage.toLowerCase().includes('high demand') ||
      errorMessage.toLowerCase().includes('spikes in demand') ||
      errorMessage.includes('UNAVAILABLE');

    if (isHighDemand) {
      throw new ApiError(
        'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        'MODEL_HIGH_DEMAND',
        503,
        true
      );
    }

    if (!response.ok) {
      throw new ApiError(errorMessage, errorCode, errorStatus);
    }
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

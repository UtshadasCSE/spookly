import { evaluateAnswer, isApiKeyConfigured } from './_gemini.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const { question, transcript, difficulty = 'intermediate' } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: 'Question is required and must be a non-empty string.',
        })
      );
      return;
    }

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: 'Answer transcript is empty. Please speak your answer before evaluating.',
          code: 'EMPTY_TRANSCRIPT',
        })
      );
      return;
    }

    if (!isApiKeyConfigured()) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          error:
            'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your Vercel Project Environment Variables.',
          code: 'MISSING_API_KEY',
        })
      );
      return;
    }

    const evaluation = await evaluateAnswer(question, transcript, difficulty);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        evaluation,
      })
    );
  } catch (err: any) {
    console.error('API /api/evaluate-answer error:', err);

    const errorMessage = err?.message || 'Failed to evaluate answer.';
    const isRateLimit =
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit');

    res.statusCode = isRateLimit ? 429 : 500;
    res.end(
      JSON.stringify({
        error: isRateLimit
          ? 'Gemini API rate limit reached. Please wait a moment and try again.'
          : errorMessage,
        code: isRateLimit ? 'RATE_LIMIT' : 'EVALUATION_FAILED',
      })
    );
  }
}

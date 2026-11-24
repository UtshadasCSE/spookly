import { generateQuestions, isApiKeyConfigured } from './_gemini.js';

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

    const { category, difficulty = 'intermediate', count = 10 } = body;

    if (!category) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: 'Missing required field: category. Must be professional, random, or real_life.',
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

    const questionCount = Math.min(Math.max(Number(count) || 10, 1), 10);
    const questions = await generateQuestions(category, difficulty, questionCount);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        category,
        difficulty,
        count: questions.length,
        questions,
      })
    );
  } catch (err: any) {
    console.error('API /api/generate-questions error:', err);

    const errorMessage = err?.message || 'Failed to generate speaking questions.';
    const status = err?.status || err?.code || err?.error?.code || err?.error?.status;
    const isHighDemand =
      status === 503 ||
      status === 'UNAVAILABLE' ||
      errorMessage.includes('503') ||
      errorMessage.toLowerCase().includes('high demand') ||
      errorMessage.toLowerCase().includes('spikes in demand') ||
      errorMessage.includes('UNAVAILABLE');

    if (isHighDemand) {
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          error:
            'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
          code: 'MODEL_HIGH_DEMAND',
          status: 503,
          retryable: true,
        })
      );
      return;
    }

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
        code: isRateLimit ? 'RATE_LIMIT' : 'GENERATION_FAILED',
      })
    );
  }
}

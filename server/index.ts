import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  generateQuestions,
  evaluateAnswer,
  isApiKeyConfigured,
} from './gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health and environment status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Spookly',
    hasApiKey: isApiKeyConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  });
});

// A. generate-questions endpoint
app.post('/api/generate-questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty = 'intermediate', count = 10 } = req.body;

    if (!category) {
      res.status(400).json({
        error: 'Missing required field: category. Must be professional, random, or real_life.',
      });
      return;
    }

    if (!isApiKeyConfigured()) {
      res.status(401).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env file.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    const questionCount = Math.min(Math.max(Number(count) || 10, 1), 10);
    const questions = await generateQuestions(category, difficulty, questionCount);

    res.json({
      success: true,
      category,
      difficulty,
      count: questions.length,
      questions,
    });
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
      res.status(503).json({
        error:
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        code: 'MODEL_HIGH_DEMAND',
        status: 503,
        retryable: true,
      });
      return;
    }

    const isRateLimit =
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      res.status(429).json({
        error: 'Gemini API rate limit reached. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
      });
      return;
    }

    res.status(500).json({
      error: errorMessage,
      code: 'GENERATION_FAILED',
    });
  }
});

// B. evaluate-answer endpoint
app.post('/api/evaluate-answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, transcript, difficulty = 'intermediate' } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({
        error: 'Question is required and must be a non-empty string.',
      });
      return;
    }

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      res.status(400).json({
        error: 'Answer transcript is empty. Please speak your answer before evaluating.',
        code: 'EMPTY_TRANSCRIPT',
      });
      return;
    }

    if (!isApiKeyConfigured()) {
      res.status(401).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env file.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    const evaluation = await evaluateAnswer(question, transcript, difficulty);

    res.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error('API /api/evaluate-answer error:', err);

    const errorMessage = err?.message || 'Failed to evaluate answer.';
    const status = err?.status || err?.code || err?.error?.code || err?.error?.status;
    const isHighDemand =
      status === 503 ||
      status === 'UNAVAILABLE' ||
      errorMessage.includes('503') ||
      errorMessage.toLowerCase().includes('high demand') ||
      errorMessage.toLowerCase().includes('spikes in demand') ||
      errorMessage.includes('UNAVAILABLE');

    if (isHighDemand) {
      res.status(503).json({
        error:
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        code: 'MODEL_HIGH_DEMAND',
        status: 503,
        retryable: true,
      });
      return;
    }

    const isRateLimit =
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      res.status(429).json({
        error: 'Gemini API rate limit reached. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
      });
      return;
    }

    res.status(500).json({
      error: errorMessage,
      code: 'EVALUATION_FAILED',
    });
  }
});

// Serve static frontend assets if built
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`[Spookly Server] Listening on http://localhost:${PORT}`);
  console.log(`[Spookly Server] Gemini API Key configured: ${isApiKeyConfigured()}`);
});

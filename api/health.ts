import { isApiKeyConfigured } from './_gemini.js';

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

  const hasKey = isApiKeyConfigured();

  const payload = JSON.stringify({
    status: 'ok',
    appName: 'Spookly',
    hasApiKey: hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    deployment: 'vercel-serverless',
  });

  res.statusCode = 200;
  res.end(payload);
}

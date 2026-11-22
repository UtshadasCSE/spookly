import { DailySessionState, ResultsSummary } from '../types';

/**
 * Storage key constants
 *
 * NOTE ON SECURITY & DAILY LIMIT ENFORCEMENT:
 * Client-side daily limits can be bypassed by clearing browser storage (localStorage)
 * or opening the application in Incognito / Private browsing mode.
 * In a full production deployment with authentication, daily limits and quotas
 * must be verified and enforced server-side against an authenticated user account
 * and persistent database.
 */
const STORAGE_PREFIX = 'spookly_';
const SESSION_KEY = `${STORAGE_PREFIX}session_v1`;
const LAST_COMPLETED_KEY = `${STORAGE_PREFIX}last_completed_v1`;

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextSessionDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function loadCurrentSession(): DailySessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed: DailySessionState = JSON.parse(raw);
    const today = getTodayDateString();

    // If the saved session is from a previous calendar day:
    if (parsed.date !== today) {
      // If it was already completed yesterday, archive it as last completed
      if (parsed.isCompleted) {
        localStorage.setItem(LAST_COMPLETED_KEY, raw);
      }
      // Stored session belongs to a past day, so today starts fresh
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load session from localStorage:', err);
    return null;
  }
}

export function saveCurrentSession(session: DailySessionState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.isCompleted) {
      localStorage.setItem(LAST_COMPLETED_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear session from localStorage:', err);
  }
}

export function loadLastCompletedSession(): DailySessionState | null {
  try {
    const raw = localStorage.getItem(LAST_COMPLETED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailySessionState;
  } catch {
    return null;
  }
}

export function calculateSummary(session: DailySessionState): ResultsSummary {
  const records = Object.values(session.answers);
  const total = records.length;

  if (total === 0) {
    return {
      overallScore: 0,
      totalQuestions: 0,
      avgGrammar: 0,
      avgVocabulary: 0,
      avgFluency: 0,
      avgSentenceStructure: 0,
      avgRelevance: 0,
      strongestArea: { name: 'None', score: 0, description: 'No answers recorded' },
      areaToImprove: { name: 'None', score: 0, description: 'No answers recorded' },
      records: [],
    };
  }

  const sumOverall = records.reduce((acc, r) => acc + (r.evaluation.overallScore || 0), 0);
  const sumGrammar = records.reduce((acc, r) => acc + (r.evaluation.grammarScore || 0), 0);
  const sumVocab = records.reduce((acc, r) => acc + (r.evaluation.vocabularyScore || 0), 0);
  const sumFluency = records.reduce((acc, r) => acc + (r.evaluation.fluencyScore || 0), 0);
  const sumStructure = records.reduce(
    (acc, r) => acc + (r.evaluation.sentenceStructureScore || 0),
    0
  );
  const sumRelevance = records.reduce((acc, r) => acc + (r.evaluation.relevanceScore || 0), 0);

  const round = (val: number) => Math.round((val / total) * 10) / 10;

  const avgOverall = round(sumOverall);
  const avgGrammar = round(sumGrammar);
  const avgVocabulary = round(sumVocab);
  const avgFluency = round(sumFluency);
  const avgSentenceStructure = round(sumStructure);
  const avgRelevance = round(sumRelevance);

  const skillScores = [
    { name: 'Grammar', score: avgGrammar, description: 'Tense consistency, agreement, and structure precision' },
    { name: 'Vocabulary', score: avgVocabulary, description: 'Word variety, descriptive range, and contextual fit' },
    { name: 'Fluency', score: avgFluency, description: 'Speech coherence, flow of thought, and transition markers' },
    { name: 'Sentence Structure', score: avgSentenceStructure, description: 'Clause complexity, syntax variety, and natural pacing' },
    { name: 'Relevance', score: avgRelevance, description: 'Direct responsiveness to prompt questions' },
  ];

  skillScores.sort((a, b) => b.score - a.score);
  const strongest = skillScores[0];
  const weakest = skillScores[skillScores.length - 1];

  return {
    overallScore: avgOverall,
    totalQuestions: total,
    avgGrammar,
    avgVocabulary,
    avgFluency,
    avgSentenceStructure,
    avgRelevance,
    strongestArea: strongest,
    areaToImprove: weakest,
    records,
  };
}

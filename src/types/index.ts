export type Category = 'professional' | 'random' | 'real_life';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CategoryInfo {
  id: Category;
  label: string;
  tag: string;
  description: string;
  examples: string[];
}

export interface Question {
  id: number;
  question: string;
  contextTip?: string;
  difficulty?: Difficulty;
}

export interface GrammarMistake {
  mistake: string;
  explanation: string;
  correction: string;
}

export interface VocabularySuggestion {
  original: string;
  suggestion: string;
  context: string;
}

export interface AnswerEvaluation {
  overallScore: number; // 1-10
  grammarScore: number; // 1-10
  vocabularyScore: number; // 1-10
  fluencyScore: number; // 1-10 (based on transcript structure)
  sentenceStructureScore: number; // 1-10
  relevanceScore: number; // 1-10
  originalAnswer: string;
  grammarMistakes: GrammarMistake[];
  correctedAnswer: string;
  betterVocabulary: VocabularySuggestion[];
  improvedNaturalVersion: string;
  practicalTip: string;
  encouragingNote?: string;
}

export interface QuestionAnswerRecord {
  questionId: number;
  question: string;
  answerTranscript: string;
  evaluation: AnswerEvaluation;
  timestamp: number;
}

export interface DailySessionState {
  date: string; // YYYY-MM-DD local format
  category: Category;
  difficulty: Difficulty;
  questions: Question[];
  currentIndex: number; // 0 to 9
  answers: Record<number, QuestionAnswerRecord>;
  isCompleted: boolean;
  completedAt?: number;
}

export interface ResultsSummary {
  overallScore: number;
  totalQuestions: number;
  avgGrammar: number;
  avgVocabulary: number;
  avgFluency: number;
  avgSentenceStructure: number;
  avgRelevance: number;
  strongestArea: {
    name: string;
    score: number;
    description: string;
  };
  areaToImprove: {
    name: string;
    score: number;
    description: string;
  };
  records: QuestionAnswerRecord[];
}

export interface DevicePermissionsState {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraGranted: boolean;
  microphoneGranted: boolean;
  isChecking: boolean;
  errorMessage: string | null;
}

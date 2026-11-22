import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

export function getGeminiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please add your Google Gemini API key to Vercel Environment Variables or your local .env file.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

export function isApiKeyConfigured(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export interface QuestionOutput {
  id: number;
  question: string;
  contextTip?: string;
  difficulty?: string;
}

const questionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: 'List of exactly 10 distinct, natural English speaking practice questions',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.INTEGER,
            description: 'Question number from 1 to 10',
          },
          question: {
            type: Type.STRING,
            description: 'The spoken English prompt question',
          },
          contextTip: {
            type: Type.STRING,
            description: 'A brief, practical hint on what aspects or details to speak about',
          },
        },
        required: ['id', 'question'],
      },
    },
  },
  required: ['questions'],
};

async function callWithModelFallback(
  ai: GoogleGenAI,
  contents: string,
  schema: any,
  preferredModel: string = configuredModel
) {
  // Fast, active models with immediate failover
  const candidateModels = [
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
  ];
  const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 1.05,
        },
      });
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const msg = String(err?.message || '');
      const isTemporary =
        status === 503 ||
        status === 429 ||
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('rate limit');

      if (isTemporary) {
        console.log(`[Gemini] ${model} busy (503 high demand). Instantly failing over to alternate model...`);
        // Immediately try next model in the pool without delay
        continue;
      }

      if (status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
        continue;
      }

      throw err;
    }
  }

  // Final retry if all models were temporarily busy
  if (lastError) {
    await new Promise((r) => setTimeout(r, 800));
    return await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 1.05,
      },
    });
  }

  throw lastError;
}

export async function generateQuestions(
  category: string,
  difficulty: string = 'intermediate',
  count: number = 10
): Promise<QuestionOutput[]> {
  const ai = getGeminiClient();

  let categoryDescription = '';
  let subtopicPool: string[] = [];

  switch (category.toLowerCase()) {
    case 'professional':
      categoryDescription =
        'Workplace communication, team discussions, job interviews, project updates, problem solving with coworkers, meeting etiquette, and career goals.';
      subtopicPool = [
        'handling unexpected project blockers and tight deadlines',
        'giving and receiving constructive peer feedback',
        'managing workload, burnout, and establishing work-life boundaries',
        'pitching an innovative process improvement to senior leadership',
        'navigating disagreements with a cross-functional teammate',
        'explaining technical constraints to non-technical stakeholders',
        'onboarding, mentoring, or collaborating with a remote colleague',
        'recovering gracefully from an oversight or missed deliverable',
        'leading an effective meeting when discussions derail',
        'career progression and acquiring new professional skills',
      ];
      break;
    case 'real_life':
    case 'real life':
      categoryDescription =
        'Everyday practical situations, ordering food at restaurants, asking for directions, public transit delays, customer service inquiries, travel check-in, making appointments.';
      subtopicPool = [
        'resolving an incorrect restaurant order or disputed bill politely',
        'asking locals for navigation help when your phone battery dies',
        'requesting an exchange or refund for a damaged item at a retail store',
        'handling an unexpected flight delay, missed train, or lost luggage',
        'explaining household repair issues clearly to a technician or landlord',
        'scheduling or rescheduling an urgent appointment by telephone',
        'reporting a lost personal item to transit customer service',
        'inquiring about specific dietary needs or allergy precautions',
        'interacting with hotel reception regarding room issues',
        'negotiating terms or asking questions about a local service contract',
      ];
      break;
    case 'random':
    case 'random conversation':
    default:
      categoryDescription =
        'Engaging conversational prompts, personal opinions, travel memories, hypothetical scenarios, hobbies, daily habits, weekend routines, and cultural perspectives.';
      subtopicPool = [
        'a pivotal book, movie, or song that reshaped your worldview',
        'a memorable travel blunder that turned into a great story',
        'a skill or hobby you have always wanted to master and why',
        'how you recharge when feeling completely drained',
        'a counter-intuitive piece of life advice that proved valuable',
        'if you could live in any era or foreign city for six months',
        'a cherished tradition or childhood habit you still maintain',
        'how modern technology has changed what genuine friendship means',
        'a calculated risk you took that taught you an important lesson',
        'your philosophy on balance, happiness, and spending leisure time',
      ];
      break;
  }

  // Shuffle and pick 4 diverse angles for this specific session
  const shuffledAngles = [...subtopicPool].sort(() => 0.5 - Math.random()).slice(0, 4);
  const sessionSeed = Math.floor(Math.random() * 1000000);

  const prompt = `You are Spookly's expert English conversation tutor.
Generate exactly ${count} completely unique, freshly imagined English speaking practice questions.

Category: ${category}
Category Scope: ${categoryDescription}
Learner Difficulty Level: ${difficulty}
(Beginner: clear questions with familiar everyday vocabulary. Intermediate: descriptive situations requiring reasons and personal opinions. Advanced: nuanced analysis, hypothetical reasoning, and diplomacy).

Session Random Seed: #${sessionSeed} (Generated at ${new Date().toISOString()})
Sample focus angles to weave into this unique session:
${shuffledAngles.map((a, i) => `- Angle ${i + 1}: ${a}`).join('\n')}

Rules:
1. Generate exactly ${count} questions numbered 1 to ${count}.
2. Every question MUST be fresh and original — do NOT output the same generic questions each time.
3. Use natural, modern, everyday spoken English.
4. Avoid dry academic or standardized exam phrasing (no robotic TOEFL/IELTS templates).
5. Make each prompt an open-ended conversation starter that inspires the user to speak for 30 to 90 seconds.
6. Provide a short, friendly contextTip for each question advising the student on what specific angles or details to touch on.
7. Ensure all ${count} questions in this session explore distinct, non-overlapping scenarios.

Return strictly structured JSON matching the provided schema.`;

  try {
    const response = await callWithModelFallback(ai, prompt, questionsSchema);

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response for questions.');
    }

    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid JSON structure returned by Gemini for questions.');
    }

    // Ensure IDs are 1 to count
    return parsed.questions.slice(0, count).map((q: any, idx: number) => ({
      id: idx + 1,
      question: String(q.question).trim(),
      contextTip: q.contextTip ? String(q.contextTip).trim() : undefined,
      difficulty,
    }));
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
}

const answerEvaluationSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: 'Overall English speaking score from 1.0 to 10.0',
    },
    grammarScore: {
      type: Type.NUMBER,
      description: 'Grammar score from 1.0 to 10.0',
    },
    vocabularyScore: {
      type: Type.NUMBER,
      description: 'Vocabulary precision and variety score from 1.0 to 10.0',
    },
    fluencyScore: {
      type: Type.NUMBER,
      description: 'Fluency score based on transcript flow, transitions, and sentence completion from 1.0 to 10.0',
    },
    sentenceStructureScore: {
      type: Type.NUMBER,
      description: 'Sentence structure and syntax variety score from 1.0 to 10.0',
    },
    relevanceScore: {
      type: Type.NUMBER,
      description: 'Relevance and responsiveness to the specific prompt question from 1.0 to 10.0',
    },
    originalAnswer: {
      type: Type.STRING,
      description: 'The user verbatim transcript evaluated',
    },
    grammarMistakes: {
      type: Type.ARRAY,
      description: 'Identified grammar or syntax mistakes with corrections',
      items: {
        type: Type.OBJECT,
        properties: {
          mistake: {
            type: Type.STRING,
            description: 'The exact word or phrase from the answer that contains an error',
          },
          explanation: {
            type: Type.STRING,
            description: 'Simple, encouraging explanation in plain English',
          },
          correction: {
            type: Type.STRING,
            description: 'The corrected version of that phrase',
          },
        },
        required: ['mistake', 'explanation', 'correction'],
      },
    },
    correctedAnswer: {
      type: Type.STRING,
      description: 'A grammatically clean and polished version that keeps the user own voice and thoughts',
    },
    betterVocabulary: {
      type: Type.ARRAY,
      description: 'Vocabulary enrichment suggestions to elevate expression',
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: 'Word or phrase the user used',
          },
          suggestion: {
            type: Type.STRING,
            description: 'More natural or expressive alternative',
          },
          context: {
            type: Type.STRING,
            description: 'Brief explanation of how to use this alternative naturally',
          },
        },
        required: ['original', 'suggestion', 'context'],
      },
    },
    improvedNaturalVersion: {
      type: Type.STRING,
      description: 'How a fluent native speaker would naturally communicate this idea in conversation',
    },
    practicalTip: {
      type: Type.STRING,
      description: 'One clear, high-impact, actionable tip for the learner next answer',
    },
    encouragingNote: {
      type: Type.STRING,
      description: 'A brief, warm, encouraging closing remark highlighting something done well',
    },
  },
  required: [
    'overallScore',
    'grammarScore',
    'vocabularyScore',
    'fluencyScore',
    'sentenceStructureScore',
    'relevanceScore',
    'originalAnswer',
    'grammarMistakes',
    'correctedAnswer',
    'betterVocabulary',
    'improvedNaturalVersion',
    'practicalTip',
  ],
};

export async function evaluateAnswer(
  question: string,
  transcript: string,
  difficulty: string = 'intermediate'
) {
  const cleanTranscript = (transcript || '').trim();
  if (!cleanTranscript) {
    throw new Error('Transcript is empty. Please speak your answer before submitting.');
  }

  const ai = getGeminiClient();

  const prompt = `You are Spookly's supportive English speaking tutor evaluating a spoken conversation practice answer.

Question Asked:
"${question}"

User Spoken Transcript:
"${cleanTranscript}"

Selected Practice Level: ${difficulty}

Evaluation Instructions:
1. Evaluate 5 core areas on a 1.0 to 10.0 scale:
   - Grammar: verb tenses, subject-verb agreement, prepositions, articles.
   - Vocabulary: word choice appropriateness, range, precision.
   - Fluency (Transcript-based): coherent transitions, flow of ideas, sentence completion. (Remember: transcript-based evaluation cannot measure audio pronunciation, accent, or speaking tempo. Only evaluate textual flow and discourse markers).
   - Sentence Structure: clause variety, compound/complex sentences, avoid run-ons.
   - Relevance: how directly and thoroughly the answer responds to the prompt.
2. Calculate overallScore (1.0 to 10.0) reflecting balanced performance for a ${difficulty} learner.
3. Be simple, warm, and encouraging.
4. DO NOT invent mistakes if the sentence is natural or colloquial.
5. DO NOT penalise short answers unfairly if they are direct and relevant.
6. Provide grammarMistakes (can be empty array [] if no grammatical errors exist).
7. Provide betterVocabulary (1 to 3 suggestions to enrich their word choice).
8. Provide correctedAnswer (fixing errors while retaining user style).
9. Provide improvedNaturalVersion (how a fluent native speaker would say this naturally).
10. Provide practicalTip (one actionable tip to practice right now).

Return strictly structured JSON adhering to the provided schema.`;

  try {
    const response = await callWithModelFallback(ai, prompt, answerEvaluationSchema);

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty evaluation response.');
    }

    const evaluation = JSON.parse(text);
    // Ensure originalAnswer is set to user's clean transcript
    evaluation.originalAnswer = cleanTranscript;
    return evaluation;
  } catch (error: any) {
    console.error('Error evaluating answer with Gemini:', error);
    throw error;
  }
}

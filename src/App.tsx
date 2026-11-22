import React, { useState, useEffect } from 'react';
import { useCamera } from './hooks/useCamera';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useDailyProgress } from './hooks/useDailyProgress';
import { LandingPage } from './components/LandingPage/LandingPage';
import { CategorySelector } from './components/CategorySelector/CategorySelector';
import { CameraPreview } from './components/CameraPreview/CameraPreview';
import { QuestionCard } from './components/QuestionCard/QuestionCard';
import { ProgressIndicator } from './components/ProgressIndicator/ProgressIndicator';
import { SpeakingControls } from './components/SpeakingControls/SpeakingControls';
import { AnswerFeedback } from './components/AnswerFeedback/AnswerFeedback';
import { ResultsPage } from './components/ResultsPage/ResultsPage';
import { fetchQuestions, submitAnswerEvaluation, checkServerHealth } from './services/api';
import { Category, Difficulty } from './types';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { SpooklyBadge, SpooklyCard, SpooklyGridBackground } from './components/ui';

type AppView = 'landing' | 'category' | 'practice' | 'results';

export const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Device & camera hook
  const {
    stream,
    videoRef,
    isCameraOn,
    isMicOn,
    error: cameraError,
    startDevices,
    stopDevices,
    toggleCamera,
    toggleMic,
  } = useCamera();

  // Speech recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  // Daily progress and session storage hook
  const {
    session,
    currentQuestion,
    currentRecord,
    currentIndex,
    totalQuestions,
    isSessionCompleted,
    startSession,
    recordAnswer,
    advanceToNextQuestion,
    resetSession,
  } = useDailyProgress();

  // Check health and server configuration on mount
  useEffect(() => {
    checkServerHealth().then((health) => {
      // Only set hasApiKey to false if the server explicitly connected and confirmed no key
      if (health.serverReachable) {
        setHasApiKey(health.hasApiKey);
      }
    });
  }, []);

  // Ensure camera & mic stream is active when entering practice view
  useEffect(() => {
    if (view === 'practice' && !stream) {
      startDevices();
    }
  }, [view, stream, startDevices]);

  // Handle "Get Started" from landing page - ALWAYS open category selector
  const handleGetStarted = async (): Promise<boolean> => {
    setGlobalError(null);
    const granted = await startDevices();
    if (!granted) {
      return false;
    }

    // Always navigate to category selector to allow choosing category and generating fresh AI questions
    setView('category');
    return true;
  };

  // Start a new practice session with selected category & difficulty
  const handleStartPracticeSession = async (category: Category, difficulty: Difficulty) => {
    setIsLoadingQuestions(true);
    setGlobalError(null);

    try {
      const questions = await fetchQuestions(category, difficulty, 10);
      startSession(category, difficulty, questions);
      resetTranscript();
      setView('practice');
    } catch (err: any) {
      console.error('Failed to generate session questions:', err);
      setGlobalError(
        err?.message ||
          'Failed to generate questions. Please ensure your Gemini API key is configured properly in .env.'
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Submit spoken answer for Gemini evaluation
  const handleSubmitAnswer = async (spokenTranscript: string) => {
    if (!currentQuestion) return;

    // Stop speech recognition if still active
    stopListening();
    setIsEvaluatingAnswer(true);
    setGlobalError(null);

    try {
      const evaluation = await submitAnswerEvaluation(
        currentQuestion.question,
        spokenTranscript,
        session?.difficulty || 'intermediate'
      );

      // Record answer and evaluation in localStorage
      recordAnswer(currentQuestion.id, currentQuestion.question, spokenTranscript, evaluation);
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
      setGlobalError(
        err?.message ||
          'Failed to evaluate your answer with Gemini. Please check your connection and retry.'
      );
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  // Move to next question after reviewing feedback
  const handleNextQuestion = () => {
    const hasMore = advanceToNextQuestion();
    resetTranscript();
    setGlobalError(null);

    if (!hasMore) {
      // Completed all 10 questions!
      stopDevices();
      setView('results');
    }
  };

  // Retry speaking current answer
  const handleRetryCurrentAnswer = () => {
    resetTranscript();
  };

  // Reset entire session (for testing/retrying)
  const handleResetSession = () => {
    resetSession();
    resetTranscript();
    setView('landing');
  };

  return (
    <SpooklyGridBackground className="min-h-screen flex flex-col font-sans">
      {/* Missing API key warning banner */}
      {!hasApiKey && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-[#c8ff29] border-b-2 border-[#171717] px-4 py-2.5 text-xs text-[#171717] font-mono font-bold flex items-center justify-center gap-2 text-center"
        >
          <AlertCircle className="w-4 h-4 text-[#171717] shrink-0" />
          <span>
            GEMINI API KEY MISSING: Add your key as{' '}
            <code className="bg-black text-[#c8ff29] px-1 py-0.5 rounded-xs font-mono text-[11px]">
              GEMINI_API_KEY
            </code>{' '}
            in your <code className="bg-black text-[#c8ff29] px-1 py-0.5 rounded-xs font-mono text-[11px]">.env</code>{' '}
            file to enable AI features.
          </span>
        </aside>
      )}

      {/* Global Error Notice if any operation failed */}
      {globalError && (
        <aside
          role="alert"
          aria-live="assertive"
          className="bg-white border-b-2 border-[#171717] shadow-[0_2px_0_0_#e11d48] px-4 py-3 text-xs text-rose-900 flex items-center justify-between gap-3 font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-neutral-500 hover:text-[#171717] font-bold text-xs uppercase underline shrink-0"
          >
            DISMISS
          </button>
        </aside>
      )}

      {/* VIEW: LANDING PAGE */}
      {view === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          isCompletedToday={isSessionCompleted}
          onViewResults={() => setView('results')}
          onResetSession={handleResetSession}
        />
      )}

      {/* VIEW: CATEGORY SELECTOR */}
      {view === 'category' && (
        <CategorySelector
          onStart={handleStartPracticeSession}
          onBack={() => setView('landing')}
          isLoading={isLoadingQuestions}
        />
      )}

      {/* VIEW: SPEAKING PRACTICE INTERFACE (Two-Column Desktop Layout) */}
      {view === 'practice' && currentQuestion && (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-6">
          {/* Header navigation bar */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#171717]">
            <div className="flex items-center gap-2.5">
              <img
                src="/favicon.png"
                alt="Spookly"
                className="w-6 h-6 rounded-xs border border-[#171717] shadow-[1px_1px_0px_0px_#171717]"
              />
              <span className="text-xl font-black tracking-tighter uppercase text-[#171717]">
                SPOOKLY
              </span>
              <span className="text-neutral-300 font-bold">•</span>
              <SpooklyBadge variant="white">
                {session?.category?.replace('_', ' ')}
              </SpooklyBadge>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  stopListening();
                  setView('category');
                }}
                className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#171717] transition"
              >
                CHANGE CATEGORY
              </button>
              <span className="text-neutral-300 font-bold">•</span>
              <button
                onClick={() => {
                  stopListening();
                  setView('landing');
                }}
                className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 hover:text-[#171717] transition"
              >
                EXIT TO HOME
              </button>
            </div>
          </div>

          {/* TWO COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT SECTION (Col 1-5 on desktop): Live Camera Preview & Media Controls */}
            <section
              aria-label="Video preview and device controls"
              className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-8"
            >
              <CameraPreview
                videoRef={videoRef}
                stream={stream}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                isListening={isListening}
                isEvaluating={isEvaluatingAnswer}
                error={cameraError}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                onRetryPermissions={startDevices}
              />

              {/* Helpful session guidance */}
              <SpooklyCard className="p-4 text-left text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-1.5 font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#171717]" />
                  SPEAKING TIPS
                </div>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 font-medium">
                  <li>Speak clearly at a conversational pace.</li>
                  <li>Aim for 30–60 seconds of continuous speech.</li>
                  <li>Review AI grammar & natural phrasing before proceeding.</li>
                </ul>
              </SpooklyCard>
            </section>

            {/* RIGHT SECTION (Col 6-12 on desktop): Question, Transcript, Feedback */}
            <section
              aria-label="Speaking practice prompt and answer review"
              className="lg:col-span-7 flex flex-col gap-6"
            >
              {/* Progress indicator */}
              <ProgressIndicator
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                categoryLabel={session?.category?.replace('_', ' ')}
                difficultyLabel={session?.difficulty}
              />

              {/* Current Question Card */}
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
              />

              {/* Speaking Controls & Transcript (if not yet submitted feedback) */}
              {!currentRecord && (
                <SpeakingControls
                  isListening={isListening}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  isEvaluating={isEvaluatingAnswer}
                  onStartSpeaking={startListening}
                  onStopSpeaking={stopListening}
                  onRetryAnswer={handleRetryCurrentAnswer}
                  onSubmitAnswer={handleSubmitAnswer}
                  onTranscriptChange={setTranscript}
                  speechError={speechError}
                />
              )}

              {/* Answer Feedback (displayed after user submits answer) */}
              {currentRecord && (
                <AnswerFeedback
                  evaluation={currentRecord.evaluation}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalQuestions}
                  onNextQuestion={handleNextQuestion}
                  isLastQuestion={currentIndex + 1 >= totalQuestions}
                />
              )}
            </section>
          </div>
        </main>
      )}

      {/* VIEW: RESULTS PAGE */}
      {view === 'results' && session && (
        <ResultsPage
          session={session}
          onBackToHome={() => setView('landing')}
          onResetSession={handleResetSession}
        />
      )}
    </SpooklyGridBackground>
  );
};

export default App;

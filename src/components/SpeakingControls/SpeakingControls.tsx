import React, { useState } from 'react';
import { Mic, Square, RotateCcw, Send, AlertCircle, Edit3, Check } from 'lucide-react';
import { SpooklyButton } from '../ui';

interface SpeakingControlsProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isEvaluating: boolean;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  onRetryAnswer: () => void;
  onSubmitAnswer: (finalTranscript: string) => void;
  onTranscriptChange: (text: string) => void;
  speechError: string | null;
  hasFeedbackAlready?: boolean;
}

export const SpeakingControls: React.FC<SpeakingControlsProps> = ({
  isListening,
  transcript,
  interimTranscript,
  isEvaluating,
  onStartSpeaking,
  onStopSpeaking,
  onRetryAnswer,
  onSubmitAnswer,
  onTranscriptChange,
  speechError,
  hasFeedbackAlready = false,
}) => {
  const [isEditingManually, setIsEditingManually] = useState<boolean>(false);

  const hasSpokenContent = Boolean(transcript.trim().length > 0 || interimTranscript.trim().length > 0);

  const handleSubmit = () => {
    const clean = transcript.trim();
    if (!clean) return;
    onSubmitAnswer(clean);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between gap-3">
      {/* Answer Transcript Card - flex-1 to match left card height, clean monochrome */}
      <div
        className={`relative p-3.5 sm:p-4 rounded-sm bg-white border-2 transition-all text-left flex-1 flex flex-col justify-between min-h-[140px] ${
          isListening
            ? 'border-[#171717] ring-2 ring-[#171717]/20 shadow-[3px_3px_0px_0px_#171717]'
            : 'border-[#171717] shadow-[2px_2px_0px_0px_#171717]'
        }`}
      >
        {/* Figma Corner Handles */}
        <span className="figma-handle -top-[4px] -left-[4px]" />
        <span className="figma-handle -top-[4px] -right-[4px]" />
        <span className="figma-handle -bottom-[4px] -left-[4px]" />
        <span className="figma-handle -bottom-[4px] -right-[4px]" />

        <div>
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-neutral-500 mb-2">
            <span className="uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
              {isListening && (
                <span className="w-2 h-2 rounded-full bg-[#171717] animate-ping" />
              )}
              {isListening ? 'LISTENING TO YOUR SPEECH...' : 'YOUR ANSWER TRANSCRIPT'}
            </span>

            {hasSpokenContent && !isListening && !hasFeedbackAlready && (
              <button
                type="button"
                onClick={() => setIsEditingManually(!isEditingManually)}
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-neutral-600 hover:text-[#171717] transition cursor-pointer"
              >
                {isEditingManually ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    DONE
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    EDIT TEXT
                  </>
                )}
              </button>
            )}
          </div>

          {isEditingManually ? (
            <textarea
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              rows={3}
              className="w-full text-xs sm:text-sm font-medium text-[#171717] p-2 border border-[#171717] rounded-xs focus:ring-2 focus:ring-[#171717] focus:outline-hidden"
              placeholder="Type or refine your spoken answer..."
            />
          ) : hasSpokenContent ? (
            <p className="text-sm sm:text-[15px] font-medium text-[#171717] leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-neutral-400 font-normal italic"> {interimTranscript}</span>
              )}
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-medium text-neutral-400 py-1.5 leading-relaxed">
              Click <strong className="text-[#171717]">START SPEAKING</strong> and answer the prompt aloud. Your words will appear here in real time.
            </p>
          )}
        </div>

        {/* Word count and evaluation status note */}
        <div className="mt-2.5 pt-2 border-t border-[#171717]/10 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>
            {transcript ? `${transcript.trim().split(/\s+/).filter(Boolean).length} WORDS` : '0 WORDS'}
          </span>
          <span className="uppercase text-[9px] sm:text-[10px] tracking-wider">
            EVALUATED BY GEMINI AI
          </span>
        </div>
      </div>

      {/* Speech recognition error warning */}
      {speechError && (
        <div className="p-3 rounded-sm bg-white border-2 border-rose-600 shadow-[2px_2px_0px_0px_#e11d48] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#171717] uppercase tracking-wide text-[11px]">Speech Recognition Notice</p>
            <p className="mt-0.5 text-neutral-600 text-[11px]">{speechError}</p>
          </div>
        </div>
      )}

      {/* Compact Speaking Actions - Always strictly in ONE ROW */}
      {!hasFeedbackAlready && (
        <div className="flex items-center gap-2 w-full pt-1">
          {/* Start / Stop speaking button */}
          {!isListening ? (
            <SpooklyButton
              variant="dark"
              size="sm"
              onClick={onStartSpeaking}
              disabled={isEvaluating}
              leftIcon={<Mic className="w-3.5 h-3.5 shrink-0" />}
              className="flex-1 whitespace-nowrap text-[11px] sm:text-xs py-2 px-2"
            >
              START SPEAKING
            </SpooklyButton>
          ) : (
            <SpooklyButton
              variant="dark"
              size="sm"
              onClick={onStopSpeaking}
              leftIcon={<Square className="w-3.5 h-3.5 fill-current shrink-0" />}
              className="flex-1 whitespace-nowrap text-[11px] sm:text-xs py-2 px-2"
            >
              STOP SPEAKING
            </SpooklyButton>
          )}

          {/* Retry Answer Button */}
          {hasSpokenContent && !isEvaluating && (
            <SpooklyButton
              variant="secondary"
              size="sm"
              onClick={onRetryAnswer}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-neutral-600 shrink-0" />}
              className="flex-1 whitespace-nowrap text-[11px] sm:text-xs py-2 px-2"
            >
              RETRY ANSWER
            </SpooklyButton>
          )}

          {/* Submit Answer Button */}
          {hasSpokenContent && !isListening && (
            <SpooklyButton
              variant="dark"
              size="sm"
              isLoading={isEvaluating}
              onClick={handleSubmit}
              rightIcon={<Send className="w-3.5 h-3.5 shrink-0" />}
              className="flex-1 whitespace-nowrap text-[11px] sm:text-xs py-2 px-2"
            >
              {isEvaluating ? 'EVALUATING...' : 'SUBMIT ANSWER'}
            </SpooklyButton>
          )}
        </div>
      )}
    </div>
  );
};


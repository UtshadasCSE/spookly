import React, { useEffect } from 'react';
import { X, Video, AlertCircle } from 'lucide-react';
import { SpooklyButton } from '../ui';

interface AnswerVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  answerTranscript?: string;
  questionText?: string;
  questionNumber?: number;
}

export const AnswerVideoModal: React.FC<AnswerVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  answerTranscript,
  questionText,
  questionNumber,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-answer-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card with Figma Corner Handles */}
      <div
        className="relative w-full max-w-2xl bg-white border-2 border-[#171717] rounded-sm shadow-[8px_8px_0px_0px_#171717] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Figma Handles */}
        <span className="figma-handle -top-[4px] -left-[4px] z-30" />
        <span className="figma-handle -top-[4px] -right-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -left-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -right-[4px] z-30" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#171717] bg-white">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#c8ff29] text-[#171717] border border-[#171717] font-mono font-bold text-[10px] uppercase tracking-wider shadow-[1px_1px_0px_0px_#171717]">
              <Video className="w-3 h-3 text-[#171717]" />
              RECORDED ANSWER PREVIEW
            </span>
            {questionNumber !== undefined && (
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                QUESTION {String(questionNumber).padStart(2, '0')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close answer preview"
            className="w-7 h-7 rounded-xs border border-[#171717] bg-white text-[#171717] hover:bg-neutral-100 flex items-center justify-center shadow-[1px_1px_0px_0px_#171717] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt question preview if available */}
        {questionText && (
          <div className="px-4 py-2 border-b border-[#171717]/15 bg-neutral-50 text-left">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
              PROMPT
            </span>
            <p className="text-xs font-semibold text-[#171717] line-clamp-2">
              {questionText}
            </p>
          </div>
        )}

        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-[#171717] flex items-center justify-center overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <AlertCircle className="w-8 h-8 text-neutral-500 mb-2" />
              <p className="text-xs font-mono font-bold uppercase text-neutral-200">
                No Video Recording Available
              </p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
                Your spoken answer was transcribed via audio. Start a new question to record video.
              </p>
            </div>
          )}
        </div>

        {/* Spoken Answer Transcript Section */}
        {answerTranscript && (
          <div className="p-3.5 bg-white border-t border-[#171717] text-left max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]">
                YOUR SPOKEN ANSWER TRANSCRIPT
              </span>
              <span className="text-[9px] font-mono text-neutral-500 font-bold uppercase">
                {answerTranscript.trim().split(/\s+/).filter(Boolean).length} WORDS
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-medium text-[#171717] leading-relaxed bg-[#f8f9f5] p-2.5 rounded-xs border border-[#171717]/15">
              "{answerTranscript}"
            </p>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="px-4 py-2.5 border-t border-[#171717] bg-white flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-500">
            Press <kbd className="px-1 py-0.5 bg-neutral-100 border border-neutral-300 rounded-xs font-mono text-[9px]">ESC</kbd> or click outside to close
          </span>

          <SpooklyButton
            variant="dark"
            size="sm"
            onClick={onClose}
            className="text-xs py-1.5 px-3"
          >
            CLOSE PREVIEW
          </SpooklyButton>
        </div>
      </div>
    </div>
  );
};

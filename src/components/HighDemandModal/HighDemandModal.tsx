import React, { useEffect } from 'react';
import { X, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';
import { SpooklyButton } from '../ui';

export interface HighDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void | Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
}

export const HighDemandModal: React.FC<HighDemandModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  isLoading = false,
  errorMessage,
}) => {
  // Close on Escape key press (unless currently retrying)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const displayMessage =
    errorMessage ||
    'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="high-demand-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      {/* Modal Dialog Card with Spookly Corner Handles */}
      <div
        className="relative w-full max-w-lg bg-white border-2 border-[#171717] rounded-sm shadow-[8px_8px_0px_0px_#171717] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Figma Corner Handles */}
        <span className="figma-handle -top-[4px] -left-[4px] z-30" />
        <span className="figma-handle -top-[4px] -right-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -left-[4px] z-30" />
        <span className="figma-handle -bottom-[4px] -right-[4px] z-30" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#171717] bg-[#f8f9f5]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#c8ff29] text-[#171717] border border-[#171717] font-mono font-bold text-[10px] uppercase tracking-wider shadow-[1px_1px_0px_0px_#171717]">
              <Cpu className="w-3 h-3 text-[#171717] animate-pulse" />
              AI SERVICE TEMPORARILY BUSY • 503
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close high demand alert"
            className="w-7 h-7 rounded-xs border border-[#171717] bg-white text-[#171717] hover:bg-neutral-100 flex items-center justify-center shadow-[1px_1px_0px_0px_#171717] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 bg-white flex flex-col gap-4 text-left">
          {/* Header row with icon badge */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xs bg-[#c8ff29] border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#171717]" />
            </div>
            <div>
              <h3
                id="high-demand-title"
                className="text-base sm:text-lg font-black uppercase tracking-tight text-[#171717] leading-snug"
              >
                Model Experiencing High Demand
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5 uppercase tracking-wide">
                STATUS 503 • UNAVAILABLE • RETRYABLE
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          <div className="bg-[#f8f9f5] border-2 border-[#171717] rounded-xs p-3.5 shadow-[2px_2px_0px_0px_#171717]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
                AI Service Notice
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#171717] text-[#c8ff29] px-1.5 py-0.5 rounded-xs">
                HTTP 503
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-mono font-semibold text-[#171717] leading-relaxed">
              "{displayMessage}"
            </p>
          </div>

          {/* Reassurance text */}
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Google Gemini servers are currently managing an intense surge in global requests. Spikes in demand are usually brief and resolve in a few moments. Click{' '}
            <strong className="text-[#171717] font-bold">TRY AGAIN</strong> below to re-send your request.
          </p>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t-2 border-[#171717] bg-[#f8f9f5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-neutral-500 order-2 sm:order-1">
            Press <kbd className="px-1 py-0.5 bg-neutral-200/80 border border-neutral-300 rounded-xs font-mono text-[9px] text-neutral-700">ESC</kbd> to dismiss
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            <SpooklyButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs py-2 px-3.5 flex-1 sm:flex-initial"
            >
              DISMISS
            </SpooklyButton>

            <SpooklyButton
              type="button"
              variant="primary"
              size="sm"
              onClick={onRetry}
              isLoading={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              className="text-xs py-2 px-4 flex-1 sm:flex-initial"
            >
              {isLoading ? 'RETIRING...' : 'TRY AGAIN'}
            </SpooklyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

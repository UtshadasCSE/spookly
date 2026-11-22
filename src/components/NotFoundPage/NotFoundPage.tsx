import React from 'react';
import { Home, ArrowRight, AlertCircle, Compass } from 'lucide-react';
import {
  SpooklyButton,
  SpooklyBadge,
  SpooklyCard,
  SpooklySelectionBox,
  SpooklyGridBackground,
} from '../ui';

interface NotFoundPageProps {
  attemptedPath?: string;
  onReturnHome: () => void;
  onStartPractice?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedPath = typeof window !== 'undefined' ? window.location.pathname : '/404',
  onReturnHome,
  onStartPractice,
}) => {
  return (
    <SpooklyGridBackground className="min-h-screen flex flex-col justify-between font-sans text-[#171717]">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b-2 border-[#171717]">
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="Spookly"
            className="w-7 h-7 rounded-xs border border-[#171717] shadow-[1px_1px_0px_0px_#171717]"
          />
          <span className="text-xl font-black tracking-tighter uppercase text-[#171717]">
            SPOOKLY
          </span>
          <span className="text-neutral-300 font-bold">•</span>
          <SpooklyBadge variant="white">
            ERROR 404
          </SpooklyBadge>
        </div>

        <button
          type="button"
          onClick={onReturnHome}
          className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#171717] transition cursor-pointer flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>RETURN TO HOME</span>
        </button>
      </header>

      {/* Main 404 Content */}
      <main className="w-full max-w-xl mx-auto px-4 py-10 my-auto text-center">
        <SpooklyCard showHandles className="p-6 sm:p-10 shadow-[6px_6px_0px_0px_#171717]">
          {/* Status Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-white text-[#171717] border border-[#171717] text-[10px] font-mono font-bold uppercase tracking-wider mb-4 shadow-[1px_1px_0px_0px_#171717]">
            <AlertCircle className="w-3.5 h-3.5 text-[#171717]" />
            ROUTE ERROR • 404
          </div>

          {/* Large Figma Selection Box with "404" */}
          <div className="my-3 flex justify-center">
            <SpooklySelectionBox tag="ERROR_404" showHandles>
              <span className="text-6xl sm:text-7xl font-black tracking-tighter text-[#171717] px-4 py-1 block">
                404
              </span>
            </SpooklySelectionBox>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight uppercase leading-snug mt-5 mb-2">
            PAGE NOT FOUND
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-md mx-auto mb-6">
            The page, speaking prompt, or URL you navigated to does not exist or has taken an unexpected detour.
          </p>

          {/* Monospace Path Diagnostic */}
          <div className="p-3 rounded-xs bg-[#f8f9f5] border border-[#171717] font-mono text-[11px] text-neutral-600 text-left mb-6 space-y-1">
            <div className="flex items-center justify-between text-[#171717] font-bold">
              <span>ATTEMPTED PATH:</span>
              <span className="text-rose-600">{attemptedPath}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-500 text-[10px]">
              <span>STATUS:</span>
              <span>404_ROUTE_UNDEFINED</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <SpooklyButton
              variant="primary"
              size="md"
              onClick={onReturnHome}
              leftIcon={<Home className="w-4 h-4 text-[#171717]" />}
              className="w-full sm:w-auto flex-1 font-mono text-xs sm:text-sm py-2.5"
            >
              RETURN TO HOME
            </SpooklyButton>

            {onStartPractice && (
              <SpooklyButton
                variant="dark"
                size="md"
                onClick={onStartPractice}
                rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
                className="w-full sm:w-auto flex-1 font-mono text-xs sm:text-sm py-2.5"
              >
                START PRACTICE
              </SpooklyButton>
            )}
          </div>
        </SpooklyCard>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 border-t border-[#171717]/20 flex items-center justify-between text-[11px] font-mono text-neutral-500 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#171717]" />
          SPOOKLY AI SPEAKING PRACTICE
        </span>
        <span>ERROR RECOVERY</span>
      </footer>
    </SpooklyGridBackground>
  );
};

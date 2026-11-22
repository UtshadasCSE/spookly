import React, { useState } from 'react';
import { Laptop, Smartphone, Copy, Check, Monitor, AlertCircle } from 'lucide-react';
import { SpooklyButton, SpooklyBadge, SpooklyGridBackground } from '../ui';

interface MobileBlockerProps {
  screenWidth: number;
  screenHeight: number;
}

export const MobileBlocker: React.FC<MobileBlockerProps> = ({ screenWidth, screenHeight }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://spookly.vercel.app';
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is blocked
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Desktop device required"
      className="fixed inset-0 z-[99999] bg-[#f8f9f5] flex flex-col justify-between overflow-y-auto min-h-screen text-[#171717] font-sans"
    >
      <SpooklyGridBackground className="min-h-screen flex flex-col justify-between px-4 sm:px-6 py-5">
        {/* Top Header Bar */}
        <header className="w-full max-w-2xl mx-auto flex items-center justify-between pb-4 border-b-2 border-[#171717]">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.png"
              alt="Spookly"
              className="w-7 h-7 rounded-xs border border-[#171717] shadow-[1px_1px_0px_0px_#171717]"
            />
            <span className="text-xl font-black tracking-tighter uppercase text-[#171717]">
              SPOOKLY
            </span>
          </div>

          <SpooklyBadge variant="lime" dot>
            DESKTOP ONLY
          </SpooklyBadge>
        </header>

        {/* Central Card with Figma Corner Handles */}
        <main className="w-full max-w-xl mx-auto my-auto py-8">
          <div className="relative bg-white border-2 border-[#171717] rounded-sm shadow-[6px_6px_0px_0px_#171717] p-6 sm:p-8 text-left">
            {/* Figma Corner Handles */}
            <span className="figma-handle -top-[4px] -left-[4px]" />
            <span className="figma-handle -top-[4px] -right-[4px]" />
            <span className="figma-handle -bottom-[4px] -left-[4px]" />
            <span className="figma-handle -bottom-[4px] -right-[4px]" />

            {/* Visual Icon Illustration */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
              {/* Desktop / Laptop - Allowed */}
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xs bg-[#f8f9f5] border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717]">
                <div className="w-12 h-12 rounded-xs bg-[#c8ff29] border border-[#171717] flex items-center justify-center">
                  <Laptop className="w-6 h-6 text-[#171717]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]">
                  DESKTOP • SUPPORTED
                </span>
              </div>

              {/* Arrow Divider */}
              <div className="text-neutral-400 font-mono text-sm font-bold">VS</div>

              {/* Smartphone - Blocked */}
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xs bg-neutral-100 border border-neutral-300 opacity-60">
                <div className="w-12 h-12 rounded-xs bg-neutral-200 border border-neutral-400 flex items-center justify-center relative">
                  <Smartphone className="w-6 h-6 text-neutral-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-xl">
                    ✕
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  MOBILE • NOT SUPPORTED
                </span>
              </div>
            </div>

            {/* Status Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#171717] text-[#c8ff29] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-[#c8ff29]" />
              SYSTEM REQUIREMENT NOTICE
            </div>

            {/* Main Headline */}
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight uppercase leading-snug mb-3">
              PLEASE OPEN SPOOKLY ON YOUR COMPUTER
            </h1>

            {/* Explanation Copy */}
            <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed mb-5">
              Spookly is engineered exclusively for <strong>desktop and laptop computers</strong>.
              Our speaking practice requires a dual-card camera view, real-time microphone analysis,
              and AI speech evaluation, which are not supported on mobile devices.
            </p>

            {/* Monospace Diagnostics Box */}
            <div className="p-3 rounded-xs bg-[#f8f9f5] border border-[#171717] font-mono text-[11px] space-y-1.5 mb-6 text-neutral-700">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#171717]/15 font-bold text-[#171717]">
                <span>DIAGNOSTIC STATUS</span>
                <span className="text-rose-600 uppercase">MOBILE DETECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">CURRENT DISPLAY:</span>
                <span className="font-bold text-[#171717]">{screenWidth} × {screenHeight} px</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">MINIMUM REQUIRED:</span>
                <span className="font-bold text-[#171717]">&ge; 1024px Width</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">HARDWARE NEEDED:</span>
                <span className="font-bold text-[#171717]">Webcam &amp; Microphone</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">SUPPORTED OS:</span>
                <span className="font-bold text-[#171717]">macOS • Windows • Linux</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <SpooklyButton
                variant="primary"
                size="md"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-4 h-4 text-[#171717]" /> : <Copy className="w-4 h-4 text-[#171717]" />}
                className="w-full text-xs sm:text-sm font-mono font-bold tracking-wider py-3"
              >
                {copied ? 'LINK COPIED TO CLIPBOARD!' : 'COPY SPOOKLY LINK'}
              </SpooklyButton>

              <p className="text-[11px] text-neutral-500 text-center font-medium leading-normal">
                Email or send this link to your computer to practice your English speaking with AI.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-2xl mx-auto pt-4 border-t border-[#171717]/20 flex items-center justify-between text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-[#171717]" />
            SPOOKLY AI SPEAKING PLATFORM
          </span>
          <span>DESKTOP VERSION REQUIRED</span>
        </footer>
      </SpooklyGridBackground>
    </div>
  );
};

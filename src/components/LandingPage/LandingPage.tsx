import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Camera, Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  SpooklyButton,
  SpooklyBadge,
  SpooklySelectionBox,
  SpooklyCursorBadge,
  SpooklyGridBackground,
} from '../ui';

interface LandingPageProps {
  onGetStarted: () => Promise<boolean>;
  isCompletedToday?: boolean;
  onViewResults?: () => void;
  onResetSession?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  isCompletedToday = false,
  onViewResults,
  onResetSession,
}) => {
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsRequesting(true);
    setPermissionError(null);

    try {
      const granted = await onGetStarted();
      if (!granted) {
        // onGetStarted handles internal state or returns false
      }
    } catch (err: any) {
      setPermissionError(
        err?.message ||
          'Camera and microphone permissions are required to practice speaking English. Please check your browser settings.'
      );
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SpooklyGridBackground className="relative min-h-screen flex flex-col justify-center items-center px-6 py-12 sm:px-12 overflow-hidden">
      {/* Figma Multiplayer Floating Cursor Badges */}
      <div className="absolute top-12 left-8 sm:top-24 sm:left-24 hidden md:block">
        <SpooklyCursorBadge name="Daily Practice" color="#c8ff29" delay={0.2} />
      </div>

      <div className="absolute bottom-16 right-8 sm:bottom-28 sm:right-24 hidden md:block">
        <SpooklyCursorBadge name="AI Feedback" color="#171717" textColor="#c8ff29" delay={0.4} />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto text-center relative z-10">
        {/* Completed Today Banner if already finished */}
        {isCompletedToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-sm bg-white border-2 border-[#171717] shadow-[3px_3px_0px_0px_#171717] text-left"
          >
            <div className="flex items-start gap-3">
              <span className="p-1 bg-[#c8ff29] border border-[#171717] rounded-xs shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#171717]" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Daily Session Complete
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  You have completed today's 10 speaking questions. Your next session unlocks tomorrow.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {onViewResults && (
                    <SpooklyButton
                      variant="primary"
                      size="sm"
                      onClick={onViewResults}
                    >
                      View Report
                    </SpooklyButton>
                  )}
                  {onResetSession && (
                    <SpooklyButton
                      variant="secondary"
                      size="sm"
                      onClick={onResetSession}
                      leftIcon={<RotateCcw className="w-3 h-3" />}
                    >
                      Reset & Practice Again
                    </SpooklyButton>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Small pill: DAILY ENGLISH SPEAKING PRACTICE */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-6 flex items-center justify-center gap-2"
        >
          <img
            src="/favicon.png"
            alt="Spookly"
            className="w-7 h-7 rounded-xs border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717]"
          />
          <SpooklyBadge variant="white" dot>
            DAILY ENGLISH SPEAKING PRACTICE
          </SpooklyBadge>
        </motion.div>

        {/* Main Heading:
            SPEAK ENGLISH
            WITH
            CONFIDENCE. (with Lime Selection Box + Corner Handles)
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-6"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#171717] uppercase leading-[0.92] select-none">
            SPEAK ENGLISH
            <br />
            WITH
            <br />
            <span className="inline-block mt-2">
              <SpooklySelectionBox tag="SPOOKLY AI" showHandles animated>
                CONFIDENCE.
              </SpooklySelectionBox>
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="text-base sm:text-lg text-neutral-600 font-medium max-w-xl mx-auto leading-relaxed mb-8"
        >
          Build your English speaking confidence through daily conversations and personalised AI feedback.
        </motion.p>

        {/* Device Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-center gap-4 text-xs font-mono font-semibold uppercase text-neutral-500 mb-8"
        >
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-neutral-700" />
            Camera Preview
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-neutral-700" />
            Mic Evaluation
          </span>
        </motion.div>

        {/* Primary CTA: START SPEAKING → */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center"
        >
          <SpooklyButton
            variant="primary"
            size="lg"
            isLoading={isRequesting}
            onClick={handleClick}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            START SPEAKING
          </SpooklyButton>
        </motion.div>

        {/* Permission Error Banner */}
        {permissionError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-sm bg-white border-2 border-rose-600 shadow-[3px_3px_0px_0px_#e11d48] text-left text-xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#171717] uppercase tracking-wide">
                  Device Access Required
                </p>
                <p className="mt-1 text-neutral-700">{permissionError}</p>
                <p className="mt-2 text-[11px] font-mono text-neutral-500">
                  Tip: Look for the camera/microphone icon in your browser address bar to allow permissions, then click Start Speaking again.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SpooklyGridBackground>
  );
};

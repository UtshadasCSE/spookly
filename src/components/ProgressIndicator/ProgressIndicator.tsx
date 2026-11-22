import React from 'react';
import { SpooklyProgress } from '../ui';

interface ProgressIndicatorProps {
  currentIndex: number; // 0 to 9
  totalQuestions: number; // 10
  categoryLabel?: string;
  difficultyLabel?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentIndex,
  totalQuestions = 10,
  categoryLabel,
  difficultyLabel,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-600">
        <div className="flex items-center gap-2">
          {categoryLabel && (
            <span className="uppercase tracking-wider text-[#171717]">
              {categoryLabel}
            </span>
          )}
          {difficultyLabel && (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#c8ff29] text-[#171717] border border-[#171717] text-[10px] uppercase font-bold tracking-wider">
              {difficultyLabel}
            </span>
          )}
        </div>
      </div>

      <SpooklyProgress
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};

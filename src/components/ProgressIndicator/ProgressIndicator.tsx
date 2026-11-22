import React from 'react';

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
  const currentNumStr = String(Math.min(currentIndex + 1, totalQuestions)).padStart(2, '0');
  const totalNumStr = String(totalQuestions).padStart(2, '0');
  const percentComplete = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="w-full flex flex-col gap-2 p-2.5 sm:p-3 bg-white border border-[#171717] rounded-sm shadow-[2px_2px_0px_0px_#171717]">
      {/* Top Information Row: Category, Difficulty, Question #, Completion % (Zero Color) */}
      <div className="flex items-center justify-between text-xs font-mono font-bold">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {categoryLabel && (
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#171717] font-black">
              {categoryLabel}
            </span>
          )}
          {difficultyLabel && (
            <span className="px-1.5 py-0.5 rounded-xs bg-white text-[#171717] border border-[#171717] text-[10px] uppercase font-bold tracking-wider">
              {difficultyLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
            QUESTION {currentNumStr} / {totalNumStr}
          </span>
          <span className="bg-[#171717] text-white px-1.5 py-0.5 text-[10px] rounded-xs font-mono font-bold tracking-wider">
            {percentComplete}% COMPLETE
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar (Clean Monochrome) */}
      <div className="grid grid-cols-10 gap-1 w-full">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`h-1.5 border border-[#171717] transition-all duration-200 rounded-xs ${
                isDone || isCurrent
                  ? 'bg-[#171717]'
                  : 'bg-white'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};


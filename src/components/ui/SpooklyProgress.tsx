import React from 'react';

interface SpooklyProgressProps {
  currentIndex: number; // 0 to 9
  totalQuestions: number; // 10
  className?: string;
}

export const SpooklyProgress: React.FC<SpooklyProgressProps> = ({
  currentIndex,
  totalQuestions = 10,
  className = '',
}) => {
  const currentNumStr = String(Math.min(currentIndex + 1, totalQuestions)).padStart(2, '0');
  const totalNumStr = String(totalQuestions).padStart(2, '0');

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#171717]">
        <span className="tracking-wider uppercase">QUESTION {currentNumStr} / {totalNumStr}</span>
        <span className="bg-[#171717] text-[#c8ff29] px-1.5 py-0.5 text-[10px] rounded-xs font-mono">
          {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% COMPLETE
        </span>
      </div>

      {/* Segmented blocks with thin black borders */}
      <div className="grid grid-cols-10 gap-1.5 w-full">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`h-2 border border-[#171717] transition-all duration-200 rounded-xs ${
                isDone
                  ? 'bg-[#171717]'
                  : isCurrent
                  ? 'bg-[#c8ff29] shadow-[1px_1px_0px_0px_#171717]'
                  : 'bg-white'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

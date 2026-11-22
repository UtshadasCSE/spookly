import React from 'react';
import { Question } from '../../types';
import { Lightbulb, Target } from 'lucide-react';
import { SpooklyBadge } from '../ui';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
}) => {
  const formattedNumber = String(questionNumber).padStart(2, '0');

  // Identify key focus phrase without overlapping text lines
  const words = question.question.trim().split(/\s+/);
  let beforeText = '';
  let highlightText = '';
  let afterText = '';

  if (words.length > 5) {
    // Pick 2-3 significant words in the core of the question
    const mid = Math.floor(words.length / 2);
    const start = Math.max(0, mid - 1);
    const end = Math.min(words.length, mid + 2);
    beforeText = words.slice(0, start).join(' ');
    highlightText = words.slice(start, end).join(' ');
    afterText = words.slice(end).join(' ');
  } else {
    highlightText = question.question;
  }

  return (
    <div className="relative p-6 sm:p-7 bg-white border-2 border-[#171717] rounded-sm shadow-[3px_3px_0px_0px_#171717] text-left">
      {/* Figma Corner Handles */}
      <span className="figma-handle -top-[4px] -left-[4px]" />
      <span className="figma-handle -top-[4px] -right-[4px]" />
      <span className="figma-handle -bottom-[4px] -left-[4px]" />
      <span className="figma-handle -bottom-[4px] -right-[4px]" />

      {/* Top Meta Bar with dedicated Key Focus indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-3 border-b border-[#171717]/10">
        <div className="flex flex-wrap items-center gap-2">
          <SpooklyBadge variant="lime" dot>
            AI SPEAKING PARTNER
          </SpooklyBadge>

          {highlightText && highlightText !== question.question && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#171717] text-[#c8ff29] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Target className="w-3 h-3 text-[#c8ff29]" />
              KEY FOCUS: {highlightText}
            </span>
          )}
        </div>

        <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
          PROMPT #{formattedNumber}
        </span>
      </div>

      {/* Question Headline - Clean, spacious, 100% visible, no overlapping elements */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#171717] leading-relaxed sm:leading-relaxed mb-6">
        {beforeText && `${beforeText} `}
        <span className="relative inline-block bg-[#c8ff29] text-[#171717] px-2 py-0.5 border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] rounded-xs mx-1 align-baseline my-1">
          {/* Figma corner handles on the highlighted keyword */}
          <span className="figma-handle -top-[3.5px] -left-[3.5px]" />
          <span className="figma-handle -top-[3.5px] -right-[3.5px]" />
          <span className="figma-handle -bottom-[3.5px] -left-[3.5px]" />
          <span className="figma-handle -bottom-[3.5px] -right-[3.5px]" />
          {highlightText}
        </span>
        {afterText && ` ${afterText}`}
      </h2>

      {/* Context Tip Footer */}
      {question.contextTip && (
        <div className="pt-4 border-t border-[#171717]/10 flex items-start gap-2.5 text-xs text-neutral-700">
          <span className="p-1 bg-[#c8ff29] border border-[#171717] rounded-xs shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#171717]" />
          </span>
          <p className="leading-relaxed font-medium">
            <span className="font-bold uppercase tracking-wider text-[#171717]">TIP:</span>{' '}
            {question.contextTip}
          </p>
        </div>
      )}
    </div>
  );
};

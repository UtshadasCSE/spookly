import React from 'react';
import { Question } from '../../types';
import { Lightbulb } from 'lucide-react';
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

  // Identify key focus phrase for the line box
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
    <div className="relative p-4 sm:p-5 bg-white border-2 border-[#171717] rounded-sm shadow-[3px_3px_0px_0px_#171717] text-left">
      {/* Figma Corner Handles */}
      <span className="figma-handle -top-[4px] -left-[4px]" />
      <span className="figma-handle -top-[4px] -right-[4px]" />
      <span className="figma-handle -bottom-[4px] -left-[4px]" />
      <span className="figma-handle -bottom-[4px] -right-[4px]" />

      {/* Top Meta Bar: AI SPEAKING PARTNER and PROMPT number (monochrome, no color) */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#171717]/10">
        <SpooklyBadge variant="white" dot>
          AI SPEAKING PARTNER
        </SpooklyBadge>

        <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
          PROMPT #{formattedNumber}
        </span>
      </div>

      {/* AI-Generated Speaking Question - Line box on key word with Figma handles, no color background */}
      <h2 className="text-base sm:text-lg font-bold text-[#171717] leading-relaxed mb-3">
        {beforeText && `${beforeText} `}
        <span className="relative inline-block border-2 border-[#171717] rounded-xs px-2 py-0.5 mx-1 align-baseline my-0.5 font-bold bg-transparent">
          {/* Figma Corner Handles on Key Word Box */}
          <span className="figma-handle -top-[3.5px] -left-[3.5px]" />
          <span className="figma-handle -top-[3.5px] -right-[3.5px]" />
          <span className="figma-handle -bottom-[3.5px] -left-[3.5px]" />
          <span className="figma-handle -bottom-[3.5px] -right-[3.5px]" />
          {highlightText}
        </span>
        {afterText && ` ${afterText}`}
      </h2>

      {/* One Short Speaking Tip - Clean neutral styling, no color */}
      {question.contextTip && (
        <div className="pt-2.5 border-t border-[#171717]/10 flex items-start gap-2 text-xs text-neutral-700">
          <span className="p-0.5 bg-neutral-100 border border-[#171717] rounded-xs shrink-0 mt-0.5">
            <Lightbulb className="w-3 h-3 text-[#171717]" />
          </span>
          <p className="leading-relaxed font-medium text-[11px] sm:text-xs">
            <span className="font-bold uppercase tracking-wider text-[#171717]">TIP:</span>{' '}
            {question.contextTip}
          </p>
        </div>
      )}
    </div>
  );
};




import React from 'react';
import { AnswerEvaluation } from '../../types';
import { ArrowRight, CheckCircle2, AlertTriangle, Sparkles, BookOpen, Info } from 'lucide-react';
import { SpooklyButton, SpooklyBadge, SpooklySelectionBox, SpooklyCard } from '../ui';

interface AnswerFeedbackProps {
  evaluation: AnswerEvaluation;
  questionNumber: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  evaluation,
  questionNumber,
  totalQuestions,
  onNextQuestion,
  isLastQuestion,
}) => {
  const formattedNumber = String(questionNumber).padStart(2, '0');

  return (
    <div className="w-full flex flex-col gap-5 text-left animate-in fade-in duration-200">
      {/* Top Score Banner with Figma Selection Box */}
      <SpooklyCard showHandles className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SpooklyBadge variant="lime" dot>
                AI EVALUATION
              </SpooklyBadge>
              <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
                QUESTION {formattedNumber} / {String(totalQuestions).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight uppercase">
              {evaluation.overallScore >= 8.0
                ? 'EXCELLENT CLARITY & VOCABULARY.'
                : evaluation.overallScore >= 6.0
                ? 'SOLID ANSWER WITH CLEAR ROOM TO GROW.'
                : 'KEEP PRACTICING — FOCUS ON NATURAL STRUCTURE.'}
            </h3>

            {evaluation.encouragingNote && (
              <p className="text-xs text-neutral-600 mt-1 font-medium italic">
                "{evaluation.encouragingNote}"
              </p>
            )}
          </div>

          {/* Overall Score Badge */}
          <div className="shrink-0 self-start sm:self-auto">
            <SpooklySelectionBox tag="SCORE" showHandles>
              <span className="text-2xl sm:text-3xl font-black tracking-tighter">
                {evaluation.overallScore.toFixed(1)}
              </span>
              <span className="text-xs font-mono font-bold ml-1 text-neutral-700">/ 10</span>
            </SpooklySelectionBox>
          </div>
        </div>
      </SpooklyCard>

      {/* 5 Evaluated Skill Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { label: 'GRAMMAR', score: evaluation.grammarScore },
          { label: 'VOCABULARY', score: evaluation.vocabularyScore },
          { label: 'FLUENCY', score: evaluation.fluencyScore },
          { label: 'STRUCTURE', score: evaluation.sentenceStructureScore },
          { label: 'RELEVANCE', score: evaluation.relevanceScore },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-white border border-[#171717] rounded-xs shadow-[2px_2px_0px_0px_#171717] flex flex-col justify-between"
          >
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              {item.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black tracking-tight text-[#171717]">
                {item.score.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">/ 10</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grammar Mistakes Breakdown (if any) */}
      {evaluation.grammarMistakes && evaluation.grammarMistakes.length > 0 ? (
        <SpooklyCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 bg-[#c8ff29] border border-[#171717] rounded-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#171717]" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717]">
              GRAMMAR CORRECTIONS ({evaluation.grammarMistakes.length})
            </span>
          </div>

          <div className="divide-y divide-[#171717]/10">
            {evaluation.grammarMistakes.map((m, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="line-through bg-neutral-100 text-neutral-500 px-1.5 py-0.5 border border-neutral-300 font-mono text-[11px] rounded-xs">
                    {m.mistake}
                  </span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                  <span className="bg-[#c8ff29] text-[#171717] px-1.5 py-0.5 border border-[#171717] font-mono text-[11px] font-bold rounded-xs">
                    {m.correction}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">
                  {m.explanation}
                </p>
              </div>
            ))}
          </div>
        </SpooklyCard>
      ) : (
        <div className="p-3.5 bg-white border border-[#171717] rounded-xs shadow-[2px_2px_0px_0px_#171717] flex items-center gap-2 text-xs font-medium text-[#171717]">
          <CheckCircle2 className="w-4 h-4 text-[#171717]" />
          <span>No grammatical errors detected. Strong sentence mechanics!</span>
        </div>
      )}

      {/* Natural Native Expression & Cleaned Answer */}
      <SpooklyCard showHandles className="p-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#171717] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#171717]" />
            NATURAL NATIVE EXPRESSION
          </div>
          <div className="bg-[#f8f9f5] border-2 border-[#171717] p-3 rounded-xs shadow-[2px_2px_0px_0px_#171717]">
            <p className="text-sm font-bold text-[#171717] leading-relaxed">
              "{evaluation.improvedNaturalVersion}"
            </p>
          </div>
          <p className="text-[11px] text-neutral-500 font-mono mt-1">
            How a native English speaker would phrase your thought in natural conversation.
          </p>
        </div>

        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
            POLISHED VERSION
          </div>
          <p className="text-xs font-medium text-neutral-800 bg-white p-2.5 rounded-xs border border-neutral-300 leading-relaxed">
            "{evaluation.correctedAnswer}"
          </p>
        </div>
      </SpooklyCard>

      {/* Elevated Vocabulary Suggestions */}
      {evaluation.betterVocabulary && evaluation.betterVocabulary.length > 0 && (
        <SpooklyCard className="p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#171717] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#171717]" />
            ELEVATED VOCABULARY SUGGESTIONS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {evaluation.betterVocabulary.map((v, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xs bg-[#f8f9f5] border border-[#171717] text-xs"
              >
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="text-neutral-500 line-through text-[11px]">{v.original}</span>
                  <span className="font-bold bg-[#c8ff29] px-1 text-[11px] border border-[#171717] rounded-xs">
                    {v.suggestion}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 font-medium leading-normal">
                  {v.context}
                </p>
              </div>
            ))}
          </div>
        </SpooklyCard>
      )}

      {/* Practical Improvement Tip */}
      {evaluation.practicalTip && (
        <div className="p-4 rounded-xs bg-[#c8ff29]/30 border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] text-xs text-[#171717]">
          <span className="font-mono font-bold uppercase tracking-wider block mb-1">
            ACTIONABLE DAILY TIP
          </span>
          <p className="font-medium text-neutral-800 leading-relaxed">{evaluation.practicalTip}</p>
        </div>
      )}

      {/* Evaluation Disclaimer */}
      <div className="flex items-start gap-1.5 text-[10px] font-mono text-neutral-500 px-1">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" />
        <span>
          Spookly evaluates grammar, vocabulary, sentence structure, and relevance. It does not grade pronunciation or speaking speed.
        </span>
      </div>

      {/* Next Question / View Results CTA */}
      <div className="pt-2 flex justify-end">
        <SpooklyButton
          variant="primary"
          size="lg"
          onClick={onNextQuestion}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLastQuestion
            ? 'VIEW FINAL RESULTS'
            : `NEXT QUESTION (${questionNumber + 1} OF ${totalQuestions})`}
        </SpooklyButton>
      </div>
    </div>
  );
};

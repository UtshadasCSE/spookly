import React from 'react';
import { AnswerEvaluation } from '../../types';
import { ArrowRight, CheckCircle2, AlertTriangle, Sparkles, BookOpen, Info, Play } from 'lucide-react';
import { SpooklyButton, SpooklyBadge, SpooklySelectionBox, SpooklyCard } from '../ui';

interface AnswerFeedbackProps {
  evaluation: AnswerEvaluation;
  questionNumber: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  answerTranscript?: string;
  onPreviewAnswer?: () => void;
  hasRecordedVideo?: boolean;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  evaluation,
  questionNumber,
  totalQuestions,
  onNextQuestion,
  isLastQuestion,
  answerTranscript,
  onPreviewAnswer,
}) => {
  const formattedNumber = String(questionNumber).padStart(2, '0');

  return (
    <div className="w-full flex flex-col gap-3.5 text-left animate-in fade-in duration-200">
      {/* YOUR SPOKEN ANSWER CARD with "Preview Answer" button */}
      {answerTranscript && (
        <SpooklyCard showHandles className="p-3.5 sm:p-4 bg-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#171717]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717]">
                YOUR SPOKEN ANSWER
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                ({answerTranscript.trim().split(/\s+/).filter(Boolean).length} WORDS)
              </span>
            </div>

            {onPreviewAnswer && (
              <SpooklyButton
                variant="primary"
                size="sm"
                onClick={onPreviewAnswer}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                className="text-[11px] sm:text-xs font-mono font-bold uppercase py-1.5 px-3"
              >
                Preview Answer
              </SpooklyButton>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#171717] leading-relaxed bg-[#f8f9f5] p-2.5 rounded-xs border border-[#171717]/20">
            "{answerTranscript}"
          </p>
        </SpooklyCard>
      )}

      {/* If no transcript card was shown, display the Preview Answer button standalone */}
      {!answerTranscript && onPreviewAnswer && (
        <div className="flex justify-end">
          <SpooklyButton
            variant="primary"
            size="sm"
            onClick={onPreviewAnswer}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="text-[11px] sm:text-xs font-mono font-bold uppercase py-1.5 px-3"
          >
            Preview Answer
          </SpooklyButton>
        </div>
      )}

      {/* Top Score Banner with Figma Selection Box */}
      <SpooklyCard showHandles className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <SpooklyBadge variant="white" dot>
                AI EVALUATION
              </SpooklyBadge>
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                QUESTION {formattedNumber} / {String(totalQuestions).padStart(2, '0')}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#171717] tracking-tight uppercase leading-snug">
              {evaluation.overallScore >= 8.0
                ? 'EXCELLENT CLARITY & VOCABULARY.'
                : evaluation.overallScore >= 6.0
                ? 'SOLID ANSWER WITH CLEAR ROOM TO GROW.'
                : 'KEEP PRACTICING — FOCUS ON NATURAL STRUCTURE.'}
            </h3>

            {evaluation.encouragingNote && (
              <p className="text-[11px] text-neutral-600 mt-1 font-medium italic">
                "{evaluation.encouragingNote}"
              </p>
            )}
          </div>

          {/* Overall Score Badge */}
          <div className="shrink-0 self-start sm:self-auto">
            <SpooklySelectionBox tag="SCORE" showHandles>
              <span className="text-xl sm:text-2xl font-black tracking-tighter">
                {evaluation.overallScore.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono font-bold ml-1 text-neutral-700">/ 10</span>
            </SpooklySelectionBox>
          </div>
        </div>
      </SpooklyCard>

      {/* 5 Evaluated Skill Score Cards */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {[
          { label: 'GRAMMAR', score: evaluation.grammarScore },
          { label: 'VOCAB', score: evaluation.vocabularyScore },
          { label: 'FLUENCY', score: evaluation.fluencyScore },
          { label: 'STRUCT', score: evaluation.sentenceStructureScore },
          { label: 'RELEVANCE', score: evaluation.relevanceScore },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-2 sm:p-2.5 bg-white border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717] flex flex-col justify-between text-center"
          >
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 truncate">
              {item.label}
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-0.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#171717]">
                {item.score.toFixed(1)}
              </span>
              <span className="text-[9px] font-mono text-neutral-400">/10</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grammar Mistakes Breakdown (if any) */}
      {evaluation.grammarMistakes && evaluation.grammarMistakes.length > 0 ? (
        <SpooklyCard className="p-3 sm:p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="p-0.5 bg-[#c8ff29] border border-[#171717] rounded-xs">
              <AlertTriangle className="w-3 h-3 text-[#171717]" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717]">
              GRAMMAR CORRECTIONS ({evaluation.grammarMistakes.length})
            </span>
          </div>

          <div className="divide-y divide-[#171717]/10">
            {evaluation.grammarMistakes.map((m, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="line-through bg-neutral-100 text-neutral-500 px-1 py-0.5 border border-neutral-300 font-mono text-[10px] rounded-xs">
                    {m.mistake}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-neutral-400" />
                  <span className="bg-[#c8ff29] text-[#171717] px-1 py-0.5 border border-[#171717] font-mono text-[10px] font-bold rounded-xs">
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
        <div className="p-2.5 bg-white border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717] flex items-center gap-2 text-xs font-medium text-[#171717]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#171717]" />
          <span className="text-[11px]">No grammatical errors detected. Strong sentence mechanics!</span>
        </div>
      )}

      {/* Natural Native Expression & Cleaned Answer */}
      <SpooklyCard showHandles className="p-3.5 sm:p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717] mb-1.5">
            <Sparkles className="w-3 h-3 text-[#171717]" />
            NATURAL NATIVE EXPRESSION
          </div>
          <div className="bg-[#f8f9f5] border border-[#171717] p-2.5 rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
            <p className="text-xs sm:text-sm font-bold text-[#171717] leading-relaxed">
              "{evaluation.improvedNaturalVersion}"
            </p>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1">
            POLISHED VERSION
          </div>
          <p className="text-xs font-medium text-neutral-800 bg-white p-2 rounded-xs border border-neutral-300 leading-relaxed">
            "{evaluation.correctedAnswer}"
          </p>
        </div>
      </SpooklyCard>

      {/* Elevated Vocabulary Suggestions */}
      {evaluation.betterVocabulary && evaluation.betterVocabulary.length > 0 && (
        <SpooklyCard className="p-3 sm:p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717] mb-2">
            <BookOpen className="w-3 h-3 text-[#171717]" />
            ELEVATED VOCABULARY SUGGESTIONS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {evaluation.betterVocabulary.map((v, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xs bg-[#f8f9f5] border border-[#171717] text-xs"
              >
                <div className="flex items-center justify-between font-mono mb-0.5">
                  <span className="text-neutral-500 line-through text-[10px]">{v.original}</span>
                  <span className="font-bold bg-[#c8ff29] px-1 text-[10px] border border-[#171717] rounded-xs">
                    {v.suggestion}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-600 font-medium leading-normal">
                  {v.context}
                </p>
              </div>
            ))}
          </div>
        </SpooklyCard>
      )}

      {/* Practical Improvement Tip */}
      {evaluation.practicalTip && (
        <div className="p-3 rounded-xs bg-[#c8ff29]/30 border border-[#171717] shadow-[1.5px_1.5px_0px_0px_#171717] text-xs text-[#171717]">
          <span className="font-mono font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
            ACTIONABLE DAILY TIP
          </span>
          <p className="font-medium text-neutral-800 text-[11px] leading-relaxed">{evaluation.practicalTip}</p>
        </div>
      )}

      {/* Evaluation Disclaimer */}
      <div className="flex items-start gap-1.5 text-[9px] font-mono text-neutral-500 px-1">
        <Info className="w-3 h-3 shrink-0 mt-0.5 text-neutral-400" />
        <span>
          Spookly evaluates grammar, vocabulary, structure, and relevance. It does not grade pronunciation or speaking speed.
        </span>
      </div>

      {/* Compact Next Question / View Results CTA */}
      <div className="pt-1 flex justify-end">
        <SpooklyButton
          variant="dark"
          size="md"
          onClick={onNextQuestion}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {isLastQuestion
            ? 'VIEW FINAL RESULTS'
            : `NEXT QUESTION (${questionNumber + 1} OF ${totalQuestions})`}
        </SpooklyButton>
      </div>
    </div>
  );
};


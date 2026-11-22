import React, { useState } from 'react';
import { DailySessionState } from '../../types';
import { calculateSummary, getNextSessionDateString } from '../../services/storage';
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Compass,
  Award,
} from 'lucide-react';
import {
  SpooklyButton,
  SpooklyBadge,
  SpooklySelectionBox,
  SpooklyCard,
  SpooklyGridBackground,
  SpooklyHeading,
} from '../ui';

interface ResultsPageProps {
  session: DailySessionState;
  onBackToHome: () => void;
  onResetSession?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  session,
  onBackToHome,
  onResetSession,
}) => {
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(true);

  const summary = calculateSummary(session);
  const nextDate = getNextSessionDateString();

  const toggleAnswer = (id: number) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SpooklyGridBackground className="min-h-screen py-12 px-6 sm:px-10 max-w-4xl mx-auto text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#171717] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO HOME
        </button>

        {onResetSession && (
          <button
            onClick={onResetSession}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-neutral-500 hover:text-[#171717] transition"
          >
            <RotateCcw className="w-3 h-3" />
            RESET SESSION
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <SpooklyBadge variant="lime" dot>
            SESSION COMPLETE
          </SpooklyBadge>
          <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
            {session.date}
          </span>
        </div>

        <SpooklyHeading size="xl" className="mb-2">
          YOUR DAILY PROGRESS.
        </SpooklyHeading>

        <p className="text-neutral-600 font-medium text-sm sm:text-base">
          You completed all <span className="font-bold text-[#171717]">{summary.totalQuestions} questions</span> in{' '}
          <span className="font-bold uppercase text-[#171717]">{session.category.replace('_', ' ')}</span>.
          Here is your full language performance breakdown.
        </p>
      </div>

      {/* Main Score & Metrics Hero Card */}
      <SpooklyCard showHandles className="p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#171717]/10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-2">
              OVERALL SPEAKING SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <SpooklySelectionBox tag="FINAL" showHandles>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter">
                  {summary.overallScore.toFixed(1)}
                </span>
                <span className="text-sm font-mono font-bold ml-1 text-neutral-700">/ 10</span>
              </SpooklySelectionBox>
            </div>
            <p className="text-xs font-mono text-neutral-500 mt-3 uppercase tracking-wider">
              {summary.totalQuestions} OF 10 QUESTIONS COMPLETED
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:border-l sm:border-[#171717]/10 sm:pl-8">
            <div className="p-3 bg-[#c8ff29]/20 border border-[#171717] rounded-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] block">
                STRONGEST SKILL
              </span>
              <span className="text-base font-black text-[#171717]">
                {summary.strongestArea.name} ({summary.strongestArea.score.toFixed(1)}/10)
              </span>
            </div>

            <div className="p-3 bg-white border border-[#171717] rounded-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                PRIMARY FOCUS AREA
              </span>
              <span className="text-base font-black text-[#171717]">
                {summary.areaToImprove.name} ({summary.areaToImprove.score.toFixed(1)}/10)
              </span>
            </div>
          </div>
        </div>

        {/* 5 Averages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
          {[
            { label: 'GRAMMAR', score: summary.avgGrammar },
            { label: 'VOCABULARY', score: summary.avgVocabulary },
            { label: 'FLUENCY', score: summary.avgFluency },
            { label: 'STRUCTURE', score: summary.avgSentenceStructure },
            { label: 'RELEVANCE', score: summary.avgRelevance },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#f8f9f5] border border-[#171717] rounded-xs shadow-[2px_2px_0px_0px_#171717]"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                {item.label}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-[#171717]">{item.score.toFixed(1)}</span>
                <span className="text-[10px] font-mono text-neutral-400">/ 10</span>
              </div>
            </div>
          ))}
        </div>
      </SpooklyCard>

      {/* THREE REQUIRED SECTIONS: YOUR STRENGTHS, NEEDS IMPROVEMENT, YOUR NEXT STEP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. YOUR STRENGTHS */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 bg-[#c8ff29] border border-[#171717] rounded-xs">
                <Award className="w-4 h-4 text-[#171717]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                YOUR STRENGTHS
              </h3>
            </div>
            <p className="text-base font-bold text-[#171717] mb-1">
              {summary.strongestArea.name} ({summary.strongestArea.score.toFixed(1)}/10)
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {summary.strongestArea.description}. You demonstrated natural clarity and accurate expression in this area throughout your session.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-[#171717] uppercase">
            KEEP LEVERAGING THIS STRENGTH
          </div>
        </SpooklyCard>

        {/* 2. NEEDS IMPROVEMENT */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 bg-white border border-[#171717] rounded-xs">
                <TrendingUp className="w-4 h-4 text-[#171717]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                NEEDS IMPROVEMENT
              </h3>
            </div>
            <p className="text-base font-bold text-[#171717] mb-1">
              {summary.areaToImprove.name} ({summary.areaToImprove.score.toFixed(1)}/10)
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {summary.areaToImprove.description}. Spending extra care with this skill in tomorrow's prompts will accelerate your fluency noticeably.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-neutral-500 uppercase">
            PRIMARY FOCUS FOR NEXT PRACTICE
          </div>
        </SpooklyCard>

        {/* 3. YOUR NEXT STEP */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 bg-[#171717] rounded-xs">
                <Compass className="w-4 h-4 text-[#c8ff29]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                YOUR NEXT STEP
              </h3>
            </div>
            <p className="text-base font-bold text-[#171717] mb-1">
              Daily Consistency
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Review your 10 answers below, speak the "Natural Native Expressions" aloud once, and return tomorrow on{' '}
              <strong className="text-[#171717]">{nextDate}</strong> for your next session.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-[#171717] uppercase">
            PRACTICE AGAIN TOMORROW
          </div>
        </SpooklyCard>
      </div>

      {/* Practice Again Tomorrow Notice Card */}
      <div className="p-5 bg-[#171717] text-white border-2 border-[#171717] shadow-[3px_3px_0px_0px_#171717] rounded-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#c8ff29]" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#c8ff29]">
              PRACTICE AGAIN TOMORROW
            </h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
            Daily speaking habit builds automatic confidence. Your next 10 questions will unlock on{' '}
            <span className="text-[#c8ff29] font-bold">{nextDate}</span>.
          </p>
        </div>

        <SpooklyButton
          variant="primary"
          size="md"
          onClick={onBackToHome}
        >
          BACK TO HOME
        </SpooklyButton>
      </div>

      {/* All 10 Answers Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
            INDIVIDUAL REVIEW — ALL {summary.records.length} ANSWERS
          </h2>

          <button
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] underline hover:no-underline"
          >
            {showAllAnswers ? 'COLLAPSE ALL' : 'EXPAND ALL'}
          </button>
        </div>

        {summary.records.map((record, index) => {
          const isExpanded = showAllAnswers || Boolean(expandedAnswers[record.questionId]);
          const evalData = record.evaluation;

          return (
            <SpooklyCard
              key={record.questionId}
              showHandles={isExpanded}
              className="overflow-hidden"
            >
              {/* Question summary row */}
              <div
                onClick={() => toggleAnswer(record.questionId)}
                className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50/70 transition"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-6 h-6 border border-[#171717] bg-[#c8ff29] text-[#171717] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 rounded-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">
                      {record.question}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1 italic font-medium">
                      "{record.answerTranscript}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 border border-[#171717] bg-white font-mono font-bold text-xs rounded-xs">
                    {evalData.overallScore.toFixed(1)} / 10
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[#171717]/10 space-y-4 text-xs bg-[#f8f9f5]">
                  {/* Spoken Answer */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      YOUR SPOKEN ANSWER:
                    </span>
                    <p className="text-[#171717] bg-white p-3 rounded-xs border border-[#171717] text-xs font-medium leading-relaxed">
                      "{record.answerTranscript}"
                    </p>
                  </div>

                  {/* 5 Area Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    {[
                      { l: 'GRAMMAR', s: evalData.grammarScore },
                      { l: 'VOCAB', s: evalData.vocabularyScore },
                      { l: 'FLUENCY', s: evalData.fluencyScore },
                      { l: 'STRUCTURE', s: evalData.sentenceStructureScore },
                      { l: 'RELEVANCE', s: evalData.relevanceScore },
                    ].map((item, i) => (
                      <div key={i} className="p-2 bg-white border border-[#171717] rounded-xs">
                        <span className="text-neutral-500 text-[9px] font-mono font-bold block uppercase">
                          {item.l}
                        </span>
                        <span className="font-bold text-sm text-[#171717]">{item.s.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mistakes */}
                  {evalData.grammarMistakes && evalData.grammarMistakes.length > 0 ? (
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        CORRECTIONS:
                      </span>
                      <div className="space-y-1.5">
                        {evalData.grammarMistakes.map((m, mIdx) => (
                          <div key={mIdx} className="bg-white p-2.5 rounded-xs border border-[#171717] text-xs">
                            <span className="line-through bg-neutral-100 text-neutral-500 px-1 py-0.5 border border-neutral-300 font-mono text-[11px] mr-2">
                              {m.mistake}
                            </span>
                            <span className="font-bold bg-[#c8ff29] text-[#171717] px-1 py-0.5 border border-[#171717] font-mono text-[11px] mr-2">
                              {m.correction}
                            </span>
                            <span className="text-neutral-600 font-medium block mt-1 text-[11px]">{m.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#171717] bg-white p-2 rounded-xs border border-[#171717] text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#171717]" />
                      <span>Accurate grammar with no notable syntax errors.</span>
                    </div>
                  )}

                  {/* Improved Natural Expression */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-[#171717]" />
                      NATURAL NATIVE EXPRESSION:
                    </span>
                    <p className="text-[#171717] font-bold bg-[#c8ff29]/30 p-2.5 rounded-xs border-2 border-[#171717] shadow-[2px_2px_0px_0px_#171717] leading-relaxed">
                      "{evalData.improvedNaturalVersion}"
                    </p>
                  </div>

                  {/* Practical Tip */}
                  {evalData.practicalTip && (
                    <div className="p-2.5 bg-white border border-[#171717] rounded-xs text-xs font-medium text-neutral-800">
                      <span className="font-mono font-bold text-[#171717] uppercase block mb-0.5">
                        IMPROVEMENT TIP:
                      </span>
                      {evalData.practicalTip}
                    </div>
                  )}
                </div>
              )}
            </SpooklyCard>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <SpooklyButton
          variant="secondary"
          size="lg"
          onClick={() => setShowAllAnswers(!showAllAnswers)}
        >
          {showAllAnswers ? 'COLLAPSE ALL ANSWERS' : 'REVIEW ALL ANSWERS'}
        </SpooklyButton>

        <SpooklyButton
          variant="primary"
          size="lg"
          onClick={onBackToHome}
        >
          BACK TO HOME
        </SpooklyButton>
      </div>
    </SpooklyGridBackground>
  );
};

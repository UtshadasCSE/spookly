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
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  SpooklyButton,
  SpooklyBadge,
  SpooklySelectionBox,
  SpooklyCard,
  SpooklyGridBackground,
  SpooklyHeading,
} from '../ui';
import { AnswerVideoModal } from '../AnswerVideoModal/AnswerVideoModal';

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
  const summary = calculateSummary(session);
  const nextDate = getNextSessionDateString();

  // Map questions in order (01, 02, ... 10)
  const orderedQuestions = (session.questions || []).map((q, index) => {
    const record = session.answers[q.id];
    return {
      index: index + 1,
      id: q.id,
      prompt: q.question,
      tip: q.contextTip,
      record,
    };
  });

  // Accordion state: open the first question by default so user sees structure immediately
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<number, boolean>>(() => {
    if (orderedQuestions.length > 0) {
      return { [orderedQuestions[0].id]: true };
    }
    return {};
  });

  // State for previewing recorded answer video in modal
  const [activeVideoModal, setActiveVideoModal] = useState<{
    url: string;
    transcript?: string;
    questionText?: string;
    questionNumber?: number;
  } | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<number, boolean> = {};
    orderedQuestions.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenQuestionIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenQuestionIds({});
  };

  const allAreOpen =
    orderedQuestions.length > 0 &&
    orderedQuestions.every((item) => Boolean(openQuestionIds[item.id]));

  return (
    <SpooklyGridBackground className="min-h-screen py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto text-left font-sans text-[#171717]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#171717]">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#171717] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO HOME
        </button>

        <div className="flex items-center gap-3">
          <SpooklyBadge variant="lime" dot>
            SESSION COMPLETE
          </SpooklyBadge>

          {onResetSession && (
            <button
              type="button"
              onClick={onResetSession}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-neutral-500 hover:text-[#171717] transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              RETAKE
            </button>
          )}
        </div>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
            {session.date} • {session.difficulty?.toUpperCase()} DIFFICULTY
          </span>
        </div>

        <SpooklyHeading size="xl" className="mb-2 uppercase">
          SPEAKING PERFORMANCE RESULTS
        </SpooklyHeading>

        <p className="text-neutral-600 font-medium text-sm sm:text-base leading-relaxed">
          You completed all <strong className="text-[#171717]">{summary.totalQuestions} questions</strong> in{' '}
          <span className="font-bold uppercase text-[#171717]">{session.category?.replace('_', ' ')}</span>.
          Below is your overall score of 10, skill breakdown, and accordion review of your spoken answers.
        </p>
      </div>

      {/* Hero Score Card: Total Score of 10 */}
      <SpooklyCard showHandles className="p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#171717]/10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-2">
              TOTAL OVERALL SCORE (OUT OF 10.0)
            </span>
            <div className="flex items-baseline gap-2">
              <SpooklySelectionBox tag="TOTAL SCORE" showHandles>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter">
                  {summary.overallScore.toFixed(1)}
                </span>
                <span className="text-sm font-mono font-bold ml-1 text-neutral-700">/ 10.0</span>
              </SpooklySelectionBox>
            </div>
            <p className="text-xs font-mono text-neutral-500 mt-3 uppercase tracking-wider font-bold">
              {summary.totalQuestions} OF 10 PROMPTS EVALUATED
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 md:border-l md:border-[#171717]/10 md:pl-8">
            <div className="p-3 bg-[#c8ff29]/25 border-2 border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] block mb-0.5">
                ★ STRONGEST SKILL
              </span>
              <span className="text-sm sm:text-base font-black text-[#171717]">
                {summary.strongestArea.name} ({summary.strongestArea.score.toFixed(1)}/10)
              </span>
            </div>

            <div className="p-3 bg-white border-2 border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
                ▲ PRIMARY AREA TO REFINE
              </span>
              <span className="text-sm sm:text-base font-black text-[#171717]">
                {summary.areaToImprove.name} ({summary.areaToImprove.score.toFixed(1)}/10)
              </span>
            </div>
          </div>
        </div>

        {/* 5 Averages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-6">
          {[
            { label: 'GRAMMAR', score: summary.avgGrammar },
            { label: 'VOCABULARY', score: summary.avgVocabulary },
            { label: 'FLUENCY', score: summary.avgFluency },
            { label: 'STRUCTURE', score: summary.avgSentenceStructure },
            { label: 'RELEVANCE', score: summary.avgRelevance },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#f8f9f5] border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717] text-left"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                {item.label}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg sm:text-xl font-black text-[#171717]">
                  {item.score.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">/ 10</span>
              </div>
            </div>
          ))}
        </div>
      </SpooklyCard>

      {/* 3 Summary Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 1. Strengths */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="p-1 bg-[#c8ff29] border border-[#171717] rounded-xs">
                <Award className="w-4 h-4 text-[#171717]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                YOUR STRENGTHS
              </h3>
            </div>
            <p className="text-sm font-bold text-[#171717] mb-1">
              {summary.strongestArea.name} ({summary.strongestArea.score.toFixed(1)}/10)
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {summary.strongestArea.description}. You demonstrated natural clarity and accurate expression here.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-[#171717] uppercase">
            KEEP LEVERAGING THIS STRENGTH
          </div>
        </SpooklyCard>

        {/* 2. Needs Improvement */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="p-1 bg-white border border-[#171717] rounded-xs">
                <TrendingUp className="w-4 h-4 text-[#171717]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                NEEDS IMPROVEMENT
              </h3>
            </div>
            <p className="text-sm font-bold text-[#171717] mb-1">
              {summary.areaToImprove.name} ({summary.areaToImprove.score.toFixed(1)}/10)
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              {summary.areaToImprove.description}. Review the natural phrasing in the accordion below to build this habit.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-neutral-500 uppercase">
            PRIMARY FOCUS FOR NEXT SESSION
          </div>
        </SpooklyCard>

        {/* 3. Next Step */}
        <SpooklyCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="p-1 bg-[#171717] rounded-xs">
                <Compass className="w-4 h-4 text-[#c8ff29]" />
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#171717]">
                YOUR NEXT STEP
              </h3>
            </div>
            <p className="text-sm font-bold text-[#171717] mb-1">
              Review 3 Answer Versions
            </p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Read aloud the Polished and Natural Native expressions for all 10 prompts below, then return on{' '}
              <strong className="text-[#171717]">{nextDate}</strong>.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#171717]/10 text-[10px] font-mono font-bold text-[#171717] uppercase">
            UNLOCKS TOMORROW
          </div>
        </SpooklyCard>
      </div>

      {/* ACCORDION REVIEW SECTION: ALL QUESTIONS */}
      <section aria-label="Individual prompt question accordion review" className="space-y-4 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#171717]">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#171717]">
              ACCORDION FEEDBACK — ALL {orderedQuestions.length} QUESTIONS
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Click any question to expand your spoken answer, polished version, natural native expression, and improvements.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={allAreOpen ? handleCollapseAll : handleExpandAll}
              className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs border border-[#171717] bg-white hover:bg-neutral-100 transition shadow-[1px_1px_0px_0px_#171717] cursor-pointer"
            >
              {allAreOpen ? 'COLLAPSE ALL' : 'EXPAND ALL'}
            </button>
          </div>
        </div>

        {/* Question Accordion Items */}
        <div className="space-y-3">
          {orderedQuestions.map((item) => {
            const isOpen = Boolean(openQuestionIds[item.id]);
            const record = item.record;
            const evalData = record?.evaluation;

            return (
              <div
                key={item.id}
                className={`bg-white border-2 border-[#171717] rounded-sm transition-all duration-150 overflow-hidden ${
                  isOpen ? 'shadow-[4px_4px_0px_0px_#171717]' : 'shadow-[2px_2px_0px_0px_#171717]'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(item.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-4.5 flex items-start sm:items-center justify-between gap-3 text-left cursor-pointer hover:bg-neutral-50/80 transition focus:outline-hidden"
                >
                  {/* Left: Number + Prompt */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-xs bg-[#c8ff29] text-[#171717] border border-[#171717] font-mono font-bold text-xs flex items-center justify-center shadow-[1px_1px_0px_0px_#171717]">
                      {String(item.index).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#171717] leading-snug line-clamp-2">
                        {item.prompt}
                      </h3>
                      {!isOpen && record?.answerTranscript && (
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1 italic font-medium">
                          "{record.answerTranscript}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Score + Chevron */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {evalData ? (
                      <span className="px-2 py-0.5 rounded-xs border border-[#171717] bg-[#f8f9f5] font-mono font-bold text-xs shadow-[1px_1px_0px_0px_#171717]">
                        {evalData.overallScore.toFixed(1)} <span className="text-neutral-400 font-normal">/ 10</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                        NOT EVALUATED
                      </span>
                    )}

                    <div className="w-6 h-6 rounded-xs border border-[#171717] flex items-center justify-center bg-white shadow-[1px_1px_0px_0px_#171717]">
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#171717]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#171717]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Accordion Body */}
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-[#fafbfa] border-t-2 border-[#171717] space-y-4 animate-in fade-in duration-150">
                    {record && evalData ? (
                      <>
                        {/* 1. THE THREE VERSIONS ANALYSIS */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                              THREE-TIER ANSWER COMPARISON
                            </span>

                            {record.videoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveVideoModal({
                                    url: record.videoUrl!,
                                    transcript: record.answerTranscript,
                                    questionText: item.prompt,
                                    questionNumber: item.index,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-white text-[#171717] border border-[#171717] rounded-xs hover:bg-[#c8ff29] transition shadow-[1px_1px_0px_0px_#171717] cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current text-[#171717]" />
                                PREVIEW VIDEO
                              </button>
                            )}
                          </div>

                          {/* Version 1: Your Spoken Answer */}
                          <div className="p-3 sm:p-3.5 bg-white border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
                                1. YOUR SPOKEN ANSWER
                              </span>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase">
                                {record.answerTranscript.trim().split(/\s+/).filter(Boolean).length} WORDS
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] font-medium text-[#171717] leading-relaxed">
                              "{record.answerTranscript}"
                            </p>
                          </div>

                          {/* Version 2: Polished Version */}
                          <div className="p-3 sm:p-3.5 bg-white border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                2. POLISHED VERSION (GRAMMATICAL CORRECTION)
                              </span>
                              <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">
                                REFINED
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 leading-relaxed">
                              "{evalData.correctedAnswer}"
                            </p>
                          </div>

                          {/* Version 3: Natural Native Expression */}
                          <div className="p-3 sm:p-3.5 bg-[#c8ff29]/25 border-2 border-[#171717] rounded-xs shadow-[2px_2px_0px_0px_#171717]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]">
                                <Sparkles className="w-3.5 h-3.5 text-[#171717]" />
                                3. NATURAL NATIVE EXPRESSION (RECOMMENDED)
                              </span>
                              <span className="text-[9px] font-mono font-bold bg-[#171717] text-[#c8ff29] px-1.5 py-0.5 rounded-xs uppercase">
                                NATIVE FLOW
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] font-black text-[#171717] leading-relaxed">
                              "{evalData.improvedNaturalVersion}"
                            </p>
                          </div>
                        </div>

                        {/* 2. SPECIFIC IMPROVEMENTS & GRAMMAR CORRECTIONS */}
                        {evalData.grammarMistakes && evalData.grammarMistakes.length > 0 ? (
                          <div className="p-3 sm:p-3.5 bg-white border border-[#171717] rounded-xs shadow-[1.5px_1.5px_0px_0px_#171717]">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] mb-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#171717]" />
                              SPECIFIC IMPROVEMENTS ({evalData.grammarMistakes.length})
                            </div>
                            <div className="space-y-2 divide-y divide-[#171717]/10">
                              {evalData.grammarMistakes.map((m, mIdx) => (
                                <div key={mIdx} className="pt-2 first:pt-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="line-through bg-neutral-100 text-neutral-500 px-1.5 py-0.5 border border-neutral-300 font-mono text-[10px] rounded-xs">
                                      {m.mistake}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                                    <span className="bg-[#c8ff29] text-[#171717] font-mono font-bold text-[10px] px-1.5 py-0.5 border border-[#171717] rounded-xs">
                                      {m.correction}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">
                                    {m.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-white border border-[#171717] rounded-xs flex items-center gap-2 text-xs font-medium text-[#171717]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#171717]" />
                            <span className="text-[11px]">Accurate grammar with no notable syntax errors. Excellent control!</span>
                          </div>
                        )}

                        {/* 3. 5-SKILL SCORES */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
                          {[
                            { label: 'GRAMMAR', score: evalData.grammarScore },
                            { label: 'VOCAB', score: evalData.vocabularyScore },
                            { label: 'FLUENCY', score: evalData.fluencyScore },
                            { label: 'STRUCT', score: evalData.sentenceStructureScore },
                            { label: 'RELEVANCE', score: evalData.relevanceScore },
                          ].map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 bg-white border border-[#171717] rounded-xs shadow-[1px_1px_0px_0px_#171717]"
                            >
                              <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block truncate">
                                {s.label}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-[#171717]">
                                {s.score.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* 4. ELEVATED VOCABULARY SUGGESTIONS (if present) */}
                        {evalData.betterVocabulary && evalData.betterVocabulary.length > 0 && (
                          <div className="p-3 bg-white border border-[#171717] rounded-xs">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                              ELEVATED VOCABULARY SUGGESTIONS
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {evalData.betterVocabulary.map((v, vIdx) => (
                                <div key={vIdx} className="p-2 rounded-xs bg-[#f8f9f5] border border-neutral-300 text-xs">
                                  <div className="flex items-center justify-between font-mono text-[10px] mb-0.5">
                                    <span className="line-through text-neutral-400">{v.original}</span>
                                    <span className="font-bold bg-[#c8ff29] px-1 border border-[#171717] rounded-xs text-[#171717]">
                                      {v.suggestion}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-neutral-600 font-medium">{v.context}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. PRACTICAL TIP (if present) */}
                        {evalData.practicalTip && (
                          <div className="p-2.5 bg-[#f8f9f5] border border-[#171717] rounded-xs text-xs">
                            <span className="font-mono font-bold text-[10px] uppercase text-[#171717] block mb-0.5">
                              PRACTICAL TIP FOR NEXT TIME
                            </span>
                            <p className="text-neutral-700 text-[11px] font-medium leading-relaxed">
                              {evalData.practicalTip}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-white border border-[#171717] rounded-xs text-center text-neutral-500 text-xs font-mono">
                        No answer record available for this question.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

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
          className="shrink-0"
        >
          BACK TO HOME
        </SpooklyButton>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <SpooklyButton
          variant="secondary"
          size="md"
          onClick={allAreOpen ? handleCollapseAll : handleExpandAll}
        >
          {allAreOpen ? 'COLLAPSE ALL ANSWERS' : 'EXPAND ALL ANSWERS'}
        </SpooklyButton>

        <SpooklyButton
          variant="primary"
          size="md"
          onClick={onBackToHome}
        >
          BACK TO HOME
        </SpooklyButton>
      </div>

      {/* Modal for Answer Video Playback */}
      <AnswerVideoModal
        isOpen={Boolean(activeVideoModal)}
        onClose={() => setActiveVideoModal(null)}
        videoUrl={activeVideoModal?.url}
        answerTranscript={activeVideoModal?.transcript}
        questionText={activeVideoModal?.questionText}
        questionNumber={activeVideoModal?.questionNumber}
      />
    </SpooklyGridBackground>
  );
};

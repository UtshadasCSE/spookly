import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Category, Difficulty } from '../../types';
import { ArrowRight, ArrowLeft, Briefcase, MessageSquare, Coffee } from 'lucide-react';
import {
  SpooklyButton,
  SpooklyBadge,
  SpooklyCard,
  SpooklyGridBackground,
  SpooklyHeading,
} from '../ui';

interface CategorySelectorProps {
  onStart: (category: Category, difficulty: Difficulty) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface CategoryOption {
  id: Category;
  title: string;
  tag: string;
  description: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'professional',
    title: 'PROFESSIONAL',
    tag: 'WORK & CAREER',
    description: 'Practise workplace conversations, interviews and professional communication.',
    icon: <Briefcase className="w-5 h-5 text-[#171717]" />,
  },
  {
    id: 'random',
    title: 'RANDOM CONVERSATION',
    tag: 'CASUAL & OPINIONS',
    description: 'Explore interesting everyday topics and spontaneous discussions.',
    icon: <MessageSquare className="w-5 h-5 text-[#171717]" />,
  },
  {
    id: 'real_life',
    title: 'REAL LIFE',
    tag: 'DAILY INTERACTIONS',
    description: 'Practise practical situations such as shopping, travelling, restaurants and daily interactions.',
    icon: <Coffee className="w-5 h-5 text-[#171717]" />,
  },
];

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'beginner', label: 'BEGINNER', desc: 'Direct questions with everyday vocabulary' },
  { id: 'intermediate', label: 'INTERMEDIATE', desc: 'Situational discussions, opinions & reasoning' },
  { id: 'advanced', label: 'ADVANCED', desc: 'Nuanced arguments, diplomacy & complex syntax' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onStart,
  onBack,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('professional');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('intermediate');

  const handleStart = () => {
    onStart(selectedCategory, selectedDifficulty);
  };

  return (
    <SpooklyGridBackground className="min-h-screen flex flex-col justify-center items-center px-6 py-12 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="w-full mb-6">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#171717] transition disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO HOME
        </button>
      </div>

      {/* Heading Block */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left mb-8"
      >
        <div className="mb-2">
          <SpooklyBadge variant="lime" dot>
            STEP 01 / 02
          </SpooklyBadge>
        </div>
        <SpooklyHeading size="xl" className="mb-2">
          CHOOSE YOUR PRACTICE.
        </SpooklyHeading>
        <p className="text-neutral-600 font-medium text-sm sm:text-base">
          Choose a conversation style and start improving your English.
        </p>
      </motion.div>

      {/* Three Category Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
            >
              <SpooklyCard
                selected={isSelected}
                showHandles={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className="p-5 flex flex-col justify-between h-full min-h-[190px]"
                tag={isSelected ? 'SELECTED' : undefined}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-9 h-9 border border-[#171717] rounded-xs flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#c8ff29]' : 'bg-neutral-100'
                      }`}
                    >
                      {cat.icon}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-[#171717] rounded-xs uppercase tracking-wider ${
                        isSelected ? 'bg-[#171717] text-[#c8ff29]' : 'bg-white text-neutral-600'
                      }`}
                    >
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-[#171717] tracking-tight mb-2 uppercase">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171717]/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                    10 AI QUESTIONS
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border border-[#171717] transition-all flex items-center justify-center ${
                      isSelected ? 'bg-[#c8ff29]' : 'bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 bg-[#171717] rounded-full" />}
                  </div>
                </div>
              </SpooklyCard>
            </motion.div>
          );
        })}
      </div>

      {/* Difficulty Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="w-full mb-8 p-5 bg-white border border-[#d4d4d4] rounded-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
            SPEAKING DIFFICULTY
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            AI adapts vocabulary and complexity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`p-3 rounded-xs text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#171717] bg-[#c8ff29]/30 shadow-[2px_2px_0px_0px_#171717]'
                    : 'border-[#d4d4d4] bg-white text-neutral-700 hover:border-[#171717]'
                }`}
              >
                <div className="font-bold text-xs text-[#171717] uppercase tracking-wide">
                  {diff.label}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-medium">
                  {diff.desc}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Action Button: START PRACTICE → */}
      <div className="w-full flex justify-end">
        <SpooklyButton
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={handleStart}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? 'GENERATING AI QUESTIONS...' : 'START PRACTICE'}
        </SpooklyButton>
      </div>
    </SpooklyGridBackground>
  );
};

import React from 'react';
import { SurveyAnswer } from '../types/game';
import { sounds } from '../utils/audio';
import { Eye, CheckCircle2, Sparkles } from 'lucide-react';
import { RoundWinParticles } from './RoundWinParticles';

interface BoardProps {
  answers: SurveyAnswer[];
  roundScore: number;
  onManualReveal?: (index: number) => void;
  isHostControlsOpen?: boolean;
  isRoundWon?: boolean;
  winningTeamName?: string;
  pointsAwarded?: number;
}

interface GlowProfile {
  borderColor: string;
  boxShadow: string;
  bgGradient: string;
  badgeBg: string;
  badgeTextColor: string;
  sheenGradient: string;
  isTopAnswer: boolean;
}

/**
 * Calculates satisfying CSS glow styles and light effects
 * proportional to the survey answer's point value.
 */
const getAnswerGlowProfile = (points: number, isRevealed: boolean): GlowProfile => {
  if (!isRevealed) {
    return {
      borderColor: 'border-amber-500/50',
      boxShadow: 'none',
      bgGradient: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900',
      badgeBg: 'bg-amber-400',
      badgeTextColor: 'text-slate-950',
      sheenGradient: 'from-transparent via-white/20 to-transparent',
      isTopAnswer: false,
    };
  }

  // Tier 1: 30+ points (#1 Top Answer - Brilliant Golden Aura)
  if (points >= 30) {
    return {
      borderColor: 'border-amber-300',
      boxShadow:
        '0 0 28px rgba(251, 191, 36, 0.75), 0 0 10px rgba(245, 158, 11, 0.9), inset 0 0 16px rgba(251, 191, 36, 0.35)',
      bgGradient: 'bg-gradient-to-r from-amber-950/80 via-blue-900/90 to-indigo-950/90',
      badgeBg:
        'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 shadow-md shadow-amber-400/80',
      badgeTextColor: 'text-slate-950 font-black',
      sheenGradient: 'from-transparent via-amber-200/50 to-transparent',
      isTopAnswer: true,
    };
  }

  // Tier 2: 20-29 points (High Value Answer - Warm Radiant Amber Glow)
  if (points >= 20) {
    return {
      borderColor: 'border-amber-400',
      boxShadow:
        '0 0 20px rgba(245, 158, 11, 0.55), 0 0 8px rgba(251, 191, 36, 0.7), inset 0 0 10px rgba(245, 158, 11, 0.25)',
      bgGradient: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900',
      badgeBg: 'bg-amber-400 shadow-sm shadow-amber-500/50',
      badgeTextColor: 'text-slate-950',
      sheenGradient: 'from-transparent via-amber-200/35 to-transparent',
      isTopAnswer: false,
    };
  }

  // Tier 3: 10-19 points (Solid Middle Answer - Luminous Blue/Cyan Glow)
  if (points >= 10) {
    return {
      borderColor: 'border-blue-400',
      boxShadow:
        '0 0 14px rgba(96, 165, 250, 0.5), 0 0 6px rgba(59, 130, 246, 0.55)',
      bgGradient: 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900',
      badgeBg: 'bg-amber-400 shadow-sm shadow-blue-400/40',
      badgeTextColor: 'text-slate-950',
      sheenGradient: 'from-transparent via-cyan-200/30 to-transparent',
      isTopAnswer: false,
    };
  }

  // Tier 4: <10 points (Honorable Mention - Subtle Sky Blue Glow)
  return {
    borderColor: 'border-sky-400/80',
    boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
    bgGradient: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900',
    badgeBg: 'bg-amber-400 text-slate-950',
    badgeTextColor: 'text-slate-950',
    sheenGradient: 'from-transparent via-sky-200/20 to-transparent',
    isTopAnswer: false,
  };
};

export const Board: React.FC<BoardProps> = ({
  answers,
  roundScore,
  onManualReveal,
  isHostControlsOpen = false,
  isRoundWon = false,
  winningTeamName,
  pointsAwarded,
}) => {
  // Split answers into 2 columns for game show board (e.g., 1-4 and 5-8)
  const midpoint = Math.ceil(answers.length / 2);
  const leftCol = answers.slice(0, midpoint);
  const rightCol = answers.slice(midpoint);

  const handleCardClick = (actualIndex: number) => {
    if (!answers[actualIndex].isRevealed && onManualReveal) {
      sounds.playFlip();
      setTimeout(() => sounds.playCorrectAnswerChime(actualIndex + 1), 150);
      onManualReveal(actualIndex);
    }
  };

  const renderSlot = (answer: SurveyAnswer, actualIndex: number) => {
    const isRevealed = answer.isRevealed;
    const glow = getAnswerGlowProfile(answer.points, isRevealed);

    return (
      <div
        key={answer.id}
        onClick={() => isHostControlsOpen && handleCardClick(actualIndex)}
        className={`group relative h-16 sm:h-20 w-full perspective-1000 select-none ${
          isHostControlsOpen && !isRevealed ? 'cursor-pointer' : ''
        }`}
      >
        <div
          className={`w-full h-full transform-style-3d transition-transform ${
            isRevealed ? 'rotate-x-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isRevealed ? 'rotateX(180deg)' : 'rotateX(0deg)',
            transition: 'transform 600ms cubic-bezier(0.34, 1.45, 0.64, 1)',
          }}
        >
          {/* FRONT (Unrevealed Number Slot) */}
          <div
            className="absolute inset-0 backface-hidden rounded-lg border-2 border-amber-500/50 bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 shadow-inner flex items-center justify-center overflow-hidden transition-colors"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Subtle light mesh and golden number circle */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0,transparent_70%)]" />
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400/80 bg-blue-950 shadow-md shadow-amber-500/20 flex items-center justify-center group-hover:border-amber-300 transition-colors">
              <span className="font-mono font-black text-xl sm:text-2xl text-amber-300 tabular-nums">
                {actualIndex + 1}
              </span>
            </div>

            {isHostControlsOpen && (
              <span className="absolute bottom-1 right-2 text-[10px] text-amber-400/80 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <Eye className="w-3 h-3" /> Host Reveal
              </span>
            )}
          </div>

          {/* BACK (Revealed Answer + Proportional Glow + Light Sheen Sweep) */}
          <div
            className={`absolute inset-0 backface-hidden rounded-lg border-2 ${glow.borderColor} ${glow.bgGradient} text-white flex items-center justify-between px-3 sm:px-4 shadow-lg overflow-hidden transition-all duration-500`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              boxShadow: glow.boxShadow,
            }}
          >
            {/* Dynamic Light Sheen Sweep on Reveal */}
            {isRevealed && (
              <div
                className={`absolute inset-0 pointer-events-none w-1/2 bg-gradient-to-r ${glow.sheenGradient} animate-sheen-sweep`}
              />
            )}

            {/* Answer Text & Rank */}
            <div className="flex items-center gap-2 pr-2 min-w-0 z-10">
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-300 tabular-nums shrink-0 flex items-center gap-1">
                {glow.isTopAnswer && (
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                )}
                <span>{actualIndex + 1}.</span>
              </span>
              <p className="font-bold text-xs sm:text-sm md:text-base leading-tight text-white tracking-wide truncate">
                {answer.text}
              </p>
            </div>

            {/* Satisfying Points Value Badge with Pop Animation */}
            <div className="shrink-0 pl-2 z-10">
              <div
                className={`${glow.badgeBg} ${glow.badgeTextColor} font-mono font-black text-sm sm:text-base px-2.5 py-1 rounded border border-amber-200/80 shadow-inner tabular-nums ${
                  isRevealed ? 'animate-badge-pop' : ''
                }`}
                title={`${answer.points} points awarded`}
              >
                {answer.points}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-4">
      {/* Outer Studio Marquee Board */}
      <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-700 via-amber-900 to-slate-950 border-4 border-amber-500 shadow-2xl shadow-amber-500/30">
        {/* Top Board Crown: Bank Counter */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-200">
              Board Value
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300/80 uppercase tracking-wider font-semibold">
              Round Bank:
            </span>
            <div className="bg-black/80 px-4 py-1 rounded border-2 border-amber-400/80 font-mono font-black text-xl sm:text-2xl text-amber-300 shadow-inner tabular-nums">
              {roundScore}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2.5 sm:space-y-3">
            {leftCol.map((ans, idx) => renderSlot(ans, idx))}
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {rightCol.map((ans, idx) => renderSlot(ans, midpoint + idx))}
          </div>
        </div>

        {/* Round Win Particles & Confetti */}
        <RoundWinParticles
          isActive={isRoundWon}
          winningTeamName={winningTeamName}
          points={pointsAwarded}
        />
      </div>
    </div>
  );
};

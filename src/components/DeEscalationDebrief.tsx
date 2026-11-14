import React, { useEffect } from 'react';
import { FeudQuestion, Team } from '../types/game';
import { Award, BookOpen, ArrowRight, HeartHandshake } from 'lucide-react';
import { RoundWinParticles } from './RoundWinParticles';
import { sounds } from '../utils/audio';
import { TeamAvatarBadge } from './TeamAvatarBadge';

interface DeEscalationDebriefProps {
  question: FeudQuestion;
  winningTeam: Team;
  pointsAwarded: number;
  isLastRound: boolean;
  onContinue: () => void;
  onGoToFastMoney: () => void;
}

export const DeEscalationDebrief: React.FC<DeEscalationDebriefProps> = ({
  question,
  winningTeam,
  pointsAwarded,
  isLastRound,
  onContinue,
  onGoToFastMoney,
}) => {
  useEffect(() => {
    sounds.playCrowdCheer(2.2);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-2xl animate-fadeIn">
      {/* Particle celebration */}
      <RoundWinParticles isActive={true} winningTeamName={winningTeam.name} points={pointsAwarded} />
      {/* Round Outcome Banner */}
      <div className="text-center pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-widest mb-3 border border-amber-400/30">
          <TeamAvatarBadge avatarId={winningTeam.avatar} size="xs" />
          <span>Round Won By {winningTeam.name}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          +{pointsAwarded} Points Awarded to {winningTeam.name}!
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Total Score: {winningTeam.name} now has {winningTeam.score} pts
        </p>
      </div>

      {/* Counselor Debrief Card */}
      <div className="my-6 p-5 sm:p-6 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <BookOpen className="w-4 h-4" />
          <span>The Counselor's Debrief: Why This Works</span>
        </div>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
          {question.counselorTip}
        </p>
      </div>

      {/* All Survey Solutions Revealed */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-amber-400" />
          Top 100 Survey Solutions for this Argument:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.answers.map((ans, idx) => (
            <div
              key={ans.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                <span className="text-slate-300 truncate">{ans.text}</span>
              </div>
              <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
                {ans.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onGoToFastMoney}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-sm transition-colors cursor-pointer"
        >
          Jump to Fast Money Bonus
        </button>

        <button
          onClick={onContinue}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>{isLastRound ? 'Fast Money Round' : 'Next Argument Round'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Team, SurveyAnswer } from '../types/game';
import { sounds } from '../utils/audio';
import { Bell, ArrowRight, Sparkles, User, AlertCircle, Zap, Volume2 } from 'lucide-react';
import { TeamAvatarBadge } from './TeamAvatarBadge';
import { PodiumCharacter } from './PodiumCharacter';
import { QuestionAdvicePopover } from './QuestionAdvicePopover';

interface FaceOffPodiumProps {
  question: string;
  category: string;
  counselorTip?: string;
  teams: [Team, Team];
  answers: SurveyAnswer[];
  onFaceOffWinner: (winningTeamId: 1 | 2, action: 'PLAY' | 'PASS') => void;
  onSubmitGuess: (guess: string) => Promise<{ matched: boolean; index: number }>;
}

export const FaceOffPodium: React.FC<FaceOffPodiumProps> = ({
  question,
  category,
  counselorTip,
  teams,
  answers,
  onFaceOffWinner,
  onSubmitGuess,
}) => {
  const [buzzedTeam, setBuzzedTeam] = useState<1 | 2 | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Track face-off attempt states
  const [firstContestantAnswerIndex, setFirstContestantAnswerIndex] = useState<number | null>(null);
  const [firstContestantTeam, setFirstContestantTeam] = useState<1 | 2 | null>(null);
  const [passPlayEligibleTeam, setPassPlayEligibleTeam] = useState<1 | 2 | null>(null);

  // Keyboard shortcut listener for podium buzzers (A for Team 1, L for Team 2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (buzzedTeam || passPlayEligibleTeam) return;
      if (e.key === 'a' || e.key === 'A') {
        handleBuzz(1);
      } else if (e.key === 'l' || e.key === 'L') {
        handleBuzz(2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzedTeam, passPlayEligibleTeam]);

  const handleBuzz = (teamId: 1 | 2) => {
    if (buzzedTeam || passPlayEligibleTeam) return;
    // Play team-specific signature buzzer sound effect
    sounds.playTeamBuzzer(teamId);
    setBuzzedTeam(teamId);
    setResultMessage(null);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || !buzzedTeam || isSubmitting) return;

    setIsSubmitting(true);
    setResultMessage(null);

    const match = await onSubmitGuess(guessInput.trim());
    setIsSubmitting(false);

    if (match.matched && match.index >= 0) {
      const matchedRank = match.index + 1; // 1-based rank (1 is top answer)
      const matchedAnswer = answers[match.index];
      sounds.playCorrectAnswerChime(matchedRank);

      // If they hit the #1 answer right away, they automatically win face-off!
      if (match.index === 0) {
        sounds.playCrowdCheer(2.2);
        setResultMessage(`NUMBER ONE ANSWER! "${matchedAnswer.text}" (${matchedAnswer.points} pts)! ${teams[buzzedTeam - 1].name} wins control!`);
        setPassPlayEligibleTeam(buzzedTeam);
        setBuzzedTeam(null);
        setGuessInput('');
        return;
      }

      // If this was the first guess
      if (firstContestantTeam === null) {
        setFirstContestantTeam(buzzedTeam);
        setFirstContestantAnswerIndex(match.index);
        const otherTeam: 1 | 2 = buzzedTeam === 1 ? 2 : 1;
        setResultMessage(
          `Good answer! #${matchedRank}: "${matchedAnswer.text}" (${matchedAnswer.points} pts). Now ${teams[otherTeam - 1].name} gets a chance to guess higher!`
        );
        setBuzzedTeam(otherTeam);
        setGuessInput('');
      } else {
        // Second contestant guessed
        const firstTeam = firstContestantTeam;
        const firstIndex = firstContestantAnswerIndex!;
        if (match.index < firstIndex) {
          // Second guess is higher rank (lower index)
          setResultMessage(
            `HIGHER ANSWER! #${matchedRank}: "${matchedAnswer.text}" beats #${firstIndex + 1}! ${teams[buzzedTeam - 1].name} wins control!`
          );
          setPassPlayEligibleTeam(buzzedTeam);
        } else {
          // First guess was better
          setResultMessage(
            `#${matchedRank}: "${matchedAnswer.text}" was not as high as #${firstIndex + 1}. ${teams[firstTeam - 1].name} wins control!`
          );
          setPassPlayEligibleTeam(firstTeam);
        }
        setBuzzedTeam(null);
        setGuessInput('');
      }
    } else {
      // Missed / strike on face off
      sounds.playStrike();
      if (firstContestantTeam === null) {
        const otherTeam: 1 | 2 = buzzedTeam === 1 ? 2 : 1;
        setResultMessage(`Not on the board! Strike! Chance passes to ${teams[otherTeam - 1].name}!`);
        setFirstContestantTeam(buzzedTeam);
        setFirstContestantAnswerIndex(999); // very low rank
        setBuzzedTeam(otherTeam);
        setGuessInput('');
      } else {
        // Second contestant also failed or first one was better
        const winner = firstContestantAnswerIndex! < 999 ? firstContestantTeam : buzzedTeam;
        setResultMessage(`Not on the board! ${teams[winner - 1].name} takes control by default!`);
        setPassPlayEligibleTeam(winner);
        setBuzzedTeam(null);
        setGuessInput('');
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl">
      {/* Category & Feud Question */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Face-Off · {category}
          </span>
          <QuestionAdvicePopover
            category={category}
            counselorTip={counselorTip}
            question={question}
          />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-1 text-balance">
          "{question}"
        </h2>
      </div>

      {/* Face-off Podiums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Team 1 Podium */}
        <div
          className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-between text-center overflow-hidden relative ${
            buzzedTeam === 1
              ? 'bg-amber-950/40 border-amber-400 ring-4 ring-amber-400/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="w-full flex flex-col items-center">
            {/* Animated Contestant Character */}
            <div className="mb-2">
              <PodiumCharacter
                teamName={teams[0].name}
                avatarId={teams[0].avatar || 'crown'}
                teamNumber={1}
                isBuzzed={buzzedTeam === 1}
                isCheering={passPlayEligibleTeam === 1}
                state={
                  passPlayEligibleTeam === 1
                    ? 'cheering'
                    : passPlayEligibleTeam === 2
                    ? 'gasping'
                    : buzzedTeam === 1
                    ? 'buzzed'
                    : buzzedTeam === 2
                    ? 'anticipating'
                    : 'idle'
                }
                score={teams[0].score}
                onBuzzerClick={() => {
                  if (buzzedTeam === null && passPlayEligibleTeam === null) {
                    handleBuzz(1);
                  }
                }}
              />
            </div>
            <h3 className="font-bold text-lg text-white">{teams[0].name}</h3>
            <p className="text-xs text-slate-400">Press 'A' key or click buzzer</p>
          </div>

          <button
            onClick={() => handleBuzz(1)}
            disabled={buzzedTeam !== null || passPlayEligibleTeam !== null}
            className={`mt-4 w-full py-4 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer ${
              buzzedTeam === 1
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/50 scale-105 ring-4 ring-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>{buzzedTeam === 1 ? 'TURN CLAIMED!' : 'CLAIM TURN · BUZZ IN (A)'}</span>
          </button>
          <span className="text-[11px] text-amber-300/80 mt-1.5 flex items-center gap-1 font-medium">
            <Volume2 className="w-3 h-3" /> Golden Bell Buzzer
          </span>
        </div>

        {/* Team 2 Podium */}
        <div
          className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-between text-center overflow-hidden relative ${
            buzzedTeam === 2
              ? 'bg-blue-950/40 border-blue-400 ring-4 ring-blue-400/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="w-full flex flex-col items-center">
            {/* Animated Contestant Character */}
            <div className="mb-2">
              <PodiumCharacter
                teamName={teams[1].name}
                avatarId={teams[1].avatar || 'heart'}
                teamNumber={2}
                isBuzzed={buzzedTeam === 2}
                isCheering={passPlayEligibleTeam === 2}
                state={
                  passPlayEligibleTeam === 2
                    ? 'cheering'
                    : passPlayEligibleTeam === 1
                    ? 'gasping'
                    : buzzedTeam === 2
                    ? 'buzzed'
                    : buzzedTeam === 1
                    ? 'anticipating'
                    : 'idle'
                }
                score={teams[1].score}
                onBuzzerClick={() => {
                  if (buzzedTeam === null && passPlayEligibleTeam === null) {
                    handleBuzz(2);
                  }
                }}
              />
            </div>
            <h3 className="font-bold text-lg text-white">{teams[1].name}</h3>
            <p className="text-xs text-slate-400">Press 'L' key or click buzzer</p>
          </div>

          <button
            onClick={() => handleBuzz(2)}
            disabled={buzzedTeam !== null || passPlayEligibleTeam !== null}
            className={`mt-4 w-full py-4 rounded-xl font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer ${
              buzzedTeam === 2
                ? 'bg-blue-400 text-slate-950 shadow-blue-400/50 scale-105 ring-4 ring-blue-300 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>{buzzedTeam === 2 ? 'TURN CLAIMED!' : 'CLAIM TURN · BUZZ IN (L)'}</span>
          </button>
          <span className="text-[11px] text-blue-300/80 mt-1.5 flex items-center gap-1 font-medium">
            <Volume2 className="w-3 h-3" /> Cyber Horn Buzzer
          </span>
        </div>
      </div>

      {/* Status & Input Form */}
      {buzzedTeam && !passPlayEligibleTeam && (
        <form onSubmit={handleAnswerSubmit} className="mt-4 p-4 rounded-xl bg-slate-900 border border-amber-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-amber-300">
              {teams[buzzedTeam - 1].name} is on the clock!
            </span>
            <span className="text-xs text-slate-400">
              Type healthy conflict solution & press Enter
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="e.g., Take a 20 min cooling-off timeout..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!guessInput.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-lg font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Judging...' : 'Guess'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Result feedback */}
      {resultMessage && (
        <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-amber-500/30 text-center font-medium text-amber-200 text-sm">
          {resultMessage}
        </div>
      )}

      {/* Decision: PLAY or PASS after winning face-off */}
      {passPlayEligibleTeam && (
        <div className="mt-6 p-6 rounded-xl bg-amber-500/10 border-2 border-amber-400 text-center">
          <h3 className="text-xl font-bold text-amber-300 mb-1">
            {teams[passPlayEligibleTeam - 1].name} Won the Face-Off!
          </h3>
          <p className="text-slate-300 text-sm mb-5">
            Will your team <strong className="text-white">PLAY</strong> the board to sweep the points, or <strong className="text-white">PASS</strong> to the other team hoping they get 3 strikes so you can steal?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onFaceOffWinner(passPlayEligibleTeam, 'PLAY')}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              PLAY THE BOARD
            </button>
            <button
              onClick={() => {
                const otherTeam: 1 | 2 = passPlayEligibleTeam === 1 ? 2 : 1;
                onFaceOffWinner(otherTeam, 'PASS');
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-lg uppercase tracking-wider transition-colors cursor-pointer"
            >
              PASS TO {teams[passPlayEligibleTeam === 1 ? 1 : 0].name.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

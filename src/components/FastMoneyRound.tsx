import React, { useState, useEffect } from 'react';
import { FAST_MONEY_QUESTIONS } from '../data/defaultQuestions';
import { sounds } from '../utils/audio';
import { normalizeText, extractKeywords } from '../utils/matcher';
import { Timer, Zap, Trophy, RotateCcw } from 'lucide-react';

interface FastMoneyRoundProps {
  onFinish: (totalPoints: number, passedThreshold: boolean) => void;
  teamName: string;
}

export const FastMoneyRound: React.FC<FastMoneyRoundProps> = ({ onFinish, teamName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isRunning, setIsRunning] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Array<{ prompt: string; userGuess: string; matchedAnswer: string; points: number }>
  >([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || isCompleted) return;

    if (timeLeft <= 0) {
      handleComplete(submittedAnswers);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= 6) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isCompleted, submittedAnswers]);

  const handleStart = () => {
    setIsRunning(true);
    sounds.playBuzzer();
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning || isCompleted) return;

    const question = FAST_MONEY_QUESTIONS[currentIndex];
    const guess = currentInput.trim();
    const normGuess = normalizeText(guess);

    // Evaluate against answers
    let matchedItem = { text: 'Zero Points', points: 0 };
    if (guess) {
      for (const ans of question.answers) {
        const normAns = normalizeText(ans.text);
        if (normAns.includes(normGuess) || normGuess.includes(normAns)) {
          matchedItem = { text: ans.text, points: ans.points };
          break;
        }
        const hasKeyword = ans.keywords.some((kw) => normGuess.includes(normalizeText(kw)));
        if (hasKeyword) {
          matchedItem = { text: ans.text, points: ans.points };
          break;
        }
      }
    }

    if (matchedItem.points > 0) {
      const rank = matchedItem.points >= 35 ? 1 : matchedItem.points >= 20 ? 2 : 4;
      sounds.playCorrectAnswerChime(rank);
    } else {
      sounds.playStrike();
    }

    const updated = [
      ...submittedAnswers,
      {
        prompt: question.prompt,
        userGuess: guess || '(Passed)',
        matchedAnswer: matchedItem.text,
        points: matchedItem.points,
      },
    ];
    setSubmittedAnswers(updated);
    setCurrentInput('');

    if (currentIndex + 1 < FAST_MONEY_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleComplete(updated);
    }
  };

  const handleComplete = (
    answersList: Array<{ prompt: string; userGuess: string; matchedAnswer: string; points: number }>
  ) => {
    setIsCompleted(true);
    setIsRunning(false);
    const total = answersList.reduce((acc, curr) => acc + curr.points, 0);
    const passed = total >= 150; // 150 points for resolution threshold

    if (passed) {
      sounds.playCelebrationSequence();
    } else {
      sounds.playTripleStrike();
    }

    setTimeout(() => {
      onFinish(total, passed);
    }, 4500);
  };

  const totalPoints = submittedAnswers.reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-4 border-amber-500 shadow-2xl">
      {/* Header marquee */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Bonus Round
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Fast Money: De-escalation Lightning Round
          </h2>
          <p className="text-xs text-slate-300">
            Playing for: <strong className="text-amber-300">{teamName}</strong> · Goal: 150+ Points!
          </p>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-xl border-2 border-amber-400">
          <Timer className="w-5 h-5 text-amber-400" />
          <span className="font-mono font-black text-2xl text-amber-300 tabular-nums">
            {timeLeft}s
          </span>
        </div>
      </div>

      {!isRunning && !isCompleted ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 animate-bounce">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">5 Rapid Conflict Questions</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            You'll have 40 seconds to answer 5 instant relationship dispute questions. Give the first healthy solution that comes to your mind!
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            START FAST MONEY CLOCK
          </button>
        </div>
      ) : (
        <div className="my-6">
          {/* Active Question Prompt */}
          {!isCompleted && (
            <div className="p-5 rounded-xl bg-slate-900 border-2 border-amber-400/50 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Question {currentIndex + 1} of {FAST_MONEY_QUESTIONS.length}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                "{FAST_MONEY_QUESTIONS[currentIndex].prompt}"
              </h3>

              <form onSubmit={handleAnswerSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Your rapid answer..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-base"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentInput('pass');
                    // auto trigger submit
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleAnswerSubmit(fakeEvent);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Pass
                </button>
              </form>
            </div>
          )}

          {/* Results Tracker Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Responses & Points:
            </h4>
            {submittedAnswers.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-sm"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-xs text-slate-400 block truncate">{item.prompt}</span>
                  <span className="font-bold text-white">Your Answer: "{item.userGuess}"</span>
                  {item.points > 0 && (
                    <span className="text-xs text-amber-300 block">Matched: {item.matchedAnswer}</span>
                  )}
                </div>
                <div className="shrink-0 bg-blue-900/60 border border-blue-400/40 px-3 py-1 rounded font-mono font-black text-amber-300 text-lg tabular-nums">
                  {item.points}
                </div>
              </div>
            ))}
          </div>

          {/* Total score box */}
          <div className="mt-6 p-4 rounded-xl bg-black/60 border border-amber-500/50 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Fast Money Total Score
            </span>
            <div className="font-mono font-black text-3xl text-amber-400 tabular-nums">
              {totalPoints} / 150 pts
            </div>
          </div>

          {isCompleted && (
            <div className="mt-4 p-4 rounded-xl text-center font-bold text-lg bg-amber-500/20 border border-amber-400 text-amber-200 animate-fadeIn">
              {totalPoints >= 150 ? (
                <span>🎉 WINNER! You reached 150+ points! True Conflict Masters!</span>
              ) : (
                <span>Great effort! You racked up {totalPoints} points in 40 seconds!</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

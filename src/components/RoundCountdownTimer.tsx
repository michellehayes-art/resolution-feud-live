import React from 'react';
import { Timer, Pause, Play, RotateCcw, AlertTriangle } from 'lucide-react';

interface RoundCountdownTimerProps {
  timeLeft: number;
  maxTime: number;
  isRunning: boolean;
  isPaused: boolean;
  onTogglePause?: () => void;
  onResetTimer?: () => void;
  teamName: string;
  isStealRound?: boolean;
}

export const RoundCountdownTimer: React.FC<RoundCountdownTimerProps> = ({
  timeLeft,
  maxTime,
  isRunning,
  isPaused,
  onTogglePause,
  onResetTimer,
  teamName,
  isStealRound = false,
}) => {
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  // Circular progress calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border transition-all duration-300 shadow-md ${
        isUrgent
          ? 'bg-red-950/70 border-red-500/80 shadow-red-500/30 animate-pulse'
          : isStealRound
          ? 'bg-amber-950/40 border-amber-500/50'
          : 'bg-slate-900/90 border-slate-700/80'
      }`}
    >
      {/* Left: Timer Icon & Label */}
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 rounded-lg ${
            isUrgent
              ? 'bg-red-500 text-white animate-bounce'
              : 'bg-slate-800 text-amber-400'
          }`}
        >
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Timer className="w-4 h-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isUrgent ? 'text-red-300' : 'text-slate-200'
              }`}
            >
              {isStealRound ? 'Steal Clock' : 'Turn Clock'}
            </span>
            {isPaused && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-400/40">
                Paused
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
            {teamName}'s Guess
          </span>
        </div>
      </div>

      {/* Right: Circular Progress Ring & Digital Display */}
      <div className="flex items-center gap-3">
        {/* Host Pause / Reset Quick Buttons */}
        {onTogglePause && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePause}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={isPaused ? 'Resume Timer' : 'Pause Timer'}
              aria-label={isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            {onResetTimer && (
              <button
                type="button"
                onClick={onResetTimer}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Reset Turn Clock"
                aria-label="Reset Turn Clock"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Circular SVG Meter */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 52 52">
            {/* Background Ring */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Active Progress Ring */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke="currentColor"
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isUrgent
                  ? 'text-red-500'
                  : timeLeft <= 10
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            />
          </svg>

          {/* Centered Digital Countdown Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-mono font-black text-sm tabular-nums ${
                isUrgent
                  ? 'text-red-400 text-base font-extrabold animate-ping-short'
                  : 'text-white'
              }`}
            >
              {timeLeft}
              <span className="text-[10px] font-normal text-slate-400">s</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

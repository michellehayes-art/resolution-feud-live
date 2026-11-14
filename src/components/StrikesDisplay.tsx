import React from 'react';

interface StrikesDisplayProps {
  strikes: number; // 0, 1, 2, or 3
  teamName: string;
}

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes, teamName }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-red-900/60 shadow-inner">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Strikes:
      </span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((slot) => {
          const isStruck = slot <= strikes;
          return (
            <div
              key={slot}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-black text-lg transition-all duration-300 ${
                isStruck
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 scale-105 border border-red-400 animate-pulse'
                  : 'bg-slate-900 text-slate-700 border border-slate-800'
              }`}
            >
              {isStruck ? 'X' : '·'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const StrikePopup: React.FC<{ count: number; onDismiss: () => void }> = ({ count, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 1300);
    return () => clearTimeout(timer);
  }, [count, onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer select-none animate-fadeIn"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400 text-white font-black text-6xl sm:text-8xl flex items-center justify-center shadow-2xl shadow-red-600/80 transform scale-100 animate-bounce"
          >
            X
          </div>
        ))}
      </div>
    </div>
  );
};

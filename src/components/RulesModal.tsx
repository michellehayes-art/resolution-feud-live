import React from 'react';
import { X, HelpCircle, Heart, Bell, Zap, Trophy, ShieldCheck } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">How to Play Resolution Feud</h3>
            <p className="text-xs text-slate-400">
              The Family Feud style game where healthy communication wins the points!
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Heart className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">1. The Survey</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Each round poses a real argument (e.g. dinner deadlocks, chore resentment, money stress). 100 couples and relationship therapists were surveyed for the best, most practical resolutions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">2. The Face-Off</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Two contestants step up to the podium and buzz in (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs">A</kbd> for Team 1, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs">L</kbd> for Team 2). Whoever names the higher-ranked survey solution wins control and chooses to <strong>PLAY</strong> or <strong>PASS</strong>!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">3. 3 Strikes & The Steal</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                The controlling team guesses answers to clear the board. If you guess wrong 3 times (3 Strikes <span className="text-red-400 font-bold">XXX</span>), the opposing team gets ONE single chance to steal all accumulated round points!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">4. Fast Money Lightning Round</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                After the main dispute rounds, play the 40-second Fast Money round. Answer 5 rapid-fire conflict questions and aim for 150+ points!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-base">5. Smart Matching & Host Override</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Our engine uses semantic matching to accept natural synonyms (e.g. "Say sorry" matches "Apologize sincerely"). If someone makes a great point in person, you can always use the discreet <strong>Host Reveal</strong> button!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

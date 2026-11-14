import React, { useState, useRef, useEffect } from 'react';
import { Info, X, Lightbulb, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface QuestionAdvicePopoverProps {
  category: string;
  counselorTip?: string;
  question?: string;
  className?: string;
  buttonVariant?: 'subtle' | 'pill' | 'badge';
}

const CATEGORY_ADVICE_MAP: Record<
  string,
  {
    principle: string;
    advice: string;
    phrase: string;
    color: string;
    badgeBg: string;
  }
> = {
  'Everyday Friction': {
    principle: 'Physiological Check & The 5-2-1 Rule',
    advice:
      'Check for low blood sugar ("hanger") or fatigue before debating. When stuck on trivial choices, pre-agreed narrowing algorithms remove ego.',
    phrase: '"I want us both to enjoy this. Let\'s pick together or take turns deciding."',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  'Home & Chores': {
    principle: 'Softened Startup (Gottman Method)',
    advice:
      'Describe what you see factually without saying "you always" or "you never". Express how the clutter affects your calm, then ask for a clear request.',
    phrase: '"I feel overwhelmed when dishes pile up. Could we tackle them together for 5 minutes?"',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  'Communication & Feelings': {
    principle: 'Validation Before Explanation',
    advice:
      'Listen to understand, not to rebut. Mirror back what your partner felt before defending your intent. People cannot de-escalate until they feel heard.',
    phrase: '"What I hear you saying is that you felt unheard. Did I get that right?"',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  'Money & Plans': {
    principle: 'Shared Team Vision',
    advice:
      'Focus on long-term safety and values rather than individual past expenses. Treat budgeting as a joint puzzle rather than a test of discipline.',
    phrase: '"Let\'s look at our goals together so we both feel secure and excited about the future."',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  'Family & Social': {
    principle: 'United Front & Boundaries',
    advice:
      'Always protect the couple bubble first. Agree in private on social boundaries before gatherings so neither partner feels stranded or pressured.',
    phrase: '"We\'re on the same team. Let\'s agree on our game plan before heading in."',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  'Spicy & Romance': {
    principle: 'State Longing Instead of Criticism',
    advice:
      'Express romantic needs as positive desires rather than past shortcomings. Vulnerability creates safety, which is the foundation of intimacy.',
    phrase: '"I love when we have uninterrupted time together. I miss feeling that closeness."',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  'Intimacy & Dating': {
    principle: 'Curiosity & Playfulness',
    advice:
      'Ask open-ended questions about your partner\'s inner world. Daily rituals of connection strengthen emotional reserves during disagreements.',
    phrase: '"What\'s been on your mind lately that you haven\'t had a chance to share?"',
    color: 'text-pink-400',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
  'Custom Dispute': {
    principle: 'The 20-Minute Cortisol Reset',
    advice:
      'When heart rates exceed 100 BPM during a disagreement, the rational brain shuts down. Take a physical pause before seeking resolution.',
    phrase: '"I care about solving this with you, but I need 15 minutes to cool down so I can listen well."',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
};

export const QuestionAdvicePopover: React.FC<QuestionAdvicePopoverProps> = ({
  category,
  counselorTip,
  question,
  className = '',
  buttonVariant = 'pill',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTick();
    setIsOpen((prev) => !prev);
  };

  const adviceData =
    CATEGORY_ADVICE_MAP[category] || {
      principle: 'Core De-escalation Principle',
      advice:
        counselorTip ||
        'Focus on connection over correctness. Ask yourself: "Do I want to win this moment, or do I want to build our relationship?"',
      phrase: '"I care more about our connection than winning this disagreement."',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* 'i' Info Trigger Button */}
      {buttonVariant === 'pill' ? (
        <button
          type="button"
          onClick={handleToggle}
          className={`group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            isOpen
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300'
          }`}
          title="Click to view therapist communication advice for this dispute category"
          aria-label="Communication advice for this dispute category"
          aria-expanded={isOpen}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
            <Info className="w-2.5 h-2.5" />
          </div>
          <span className="text-[11px] font-bold">Advice</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isOpen
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-400/30 scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-cyan-300 border-slate-700 hover:border-cyan-400/80 hover:bg-slate-800'
          }`}
          title="Communication advice"
          aria-label="Communication advice"
          aria-expanded={isOpen}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Popover Tooltip Card */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-84 p-4 rounded-xl bg-slate-900/98 border-2 border-cyan-500/50 shadow-2xl shadow-black/80 z-50 text-left animate-fadeIn backdrop-blur-md">
          {/* Subtle Pointer Notch */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t-2 border-l-2 border-cyan-500/50 rotate-45" />

          {/* Popover Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Communication Advice
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${adviceData.badgeBg}`}>
                {category}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close advice popover"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Principle & Core Advice */}
          <div className="my-3 space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block mb-0.5">
                Key Principle
              </span>
              <p className="font-bold text-slate-100 text-xs sm:text-sm leading-snug">
                {adviceData.principle}
              </p>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {counselorTip || adviceData.advice}
            </p>

            {/* Try Saying Phrase */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 mt-2">
              <span className="text-[10px] uppercase font-black text-amber-300 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Try Saying This:
              </span>
              <p className="text-[11px] text-slate-200 italic leading-snug font-medium">
                {adviceData.phrase}
              </p>
            </div>
          </div>

          {/* Footer Note Reinforcing Core Purpose */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Goal: De-escalate &amp; Connect</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
            >
              Got it 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

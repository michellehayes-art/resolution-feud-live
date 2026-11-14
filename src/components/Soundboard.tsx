import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Music,
  Laugh,
  PartyPopper,
  Zap,
  Sparkles,
  Minimize2,
  Maximize2,
  Radio,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { sounds } from '../utils/audio';

export interface SoundboardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

interface SoundItem {
  id: string;
  label: string;
  tag: string;
  emoji: string;
  category: 'cheer' | 'funny' | 'suspense';
  action: () => void;
  color: string;
  border: string;
  badge: string;
}

export const Soundboard: React.FC<SoundboardProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [lastPlayedName, setLastPlayedName] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'cheer' | 'funny' | 'suspense'>('all');
  const [isMinimized, setIsMinimized] = useState(false);

  // Clear active highlight after brief animation
  useEffect(() => {
    if (!activeSoundId) return;
    const timer = setTimeout(() => {
      setActiveSoundId(null);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeSoundId]);

  const soundClips: SoundItem[] = [
    // 👏 Encouraging & Cheering
    {
      id: 'applause',
      label: 'Applause & Cheers',
      tag: 'Live Crowd',
      emoji: '👏',
      category: 'cheer',
      color: 'from-amber-600/30 to-yellow-600/20 hover:from-amber-500/40 hover:to-yellow-500/30 text-amber-200',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
      action: () => sounds.playCrowdCheer(2.5),
    },
    {
      id: 'good-answer',
      label: 'Good Answer!',
      tag: 'Studio Chant',
      emoji: '🗣️',
      category: 'cheer',
      color: 'from-emerald-600/30 to-teal-600/20 hover:from-emerald-500/40 hover:to-teal-500/30 text-emerald-200',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      action: () => {
        sounds.playCorrectAnswerChime(2);
        setTimeout(() => sounds.speakPhrase('Good answer! Good answer!', 'hype'), 200);
      },
    },
    {
      id: 'correct-ding',
      label: 'Golden Correct',
      tag: 'Top Answer Chime',
      emoji: '✨',
      category: 'cheer',
      color: 'from-yellow-600/30 to-amber-600/20 hover:from-yellow-500/40 hover:to-amber-500/30 text-yellow-200',
      border: 'border-yellow-500/40 hover:border-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-300',
      action: () => sounds.playCorrectAnswerChime(1),
    },
    {
      id: 'win-fanfare',
      label: 'Victory Fanfare',
      tag: 'Grand Trumpets',
      emoji: '🎺',
      category: 'cheer',
      color: 'from-purple-600/30 to-indigo-600/20 hover:from-purple-500/40 hover:to-indigo-500/30 text-purple-200',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-300',
      action: () => sounds.playWinFanfare(),
    },
    {
      id: 'hype-cheer',
      label: "That's What I'm Talking About!",
      tag: 'Hype Voice',
      emoji: '🔥',
      category: 'cheer',
      color: 'from-orange-600/30 to-amber-600/20 hover:from-orange-500/40 hover:to-amber-500/30 text-orange-200',
      border: 'border-orange-500/40 hover:border-orange-400',
      badge: 'bg-orange-500/20 text-orange-300',
      action: () => {
        sounds.playCameraOn();
        sounds.speakPhrase("That's what I'm talking about!", 'hype');
      },
    },

    // 🤪 Funny & Drama
    {
      id: 'oops-trombone',
      label: 'Oops! (Sad Trombone)',
      tag: 'Wah Wah Waaah',
      emoji: '🤦‍♂️',
      category: 'funny',
      color: 'from-rose-600/30 to-red-600/20 hover:from-rose-500/40 hover:to-red-500/30 text-rose-200',
      border: 'border-rose-500/40 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
      action: () => sounds.playOops(),
    },
    {
      id: 'rimshot',
      label: 'Ba-Dum-Tsss!',
      tag: 'Joke Punchline',
      emoji: '🥁',
      category: 'funny',
      color: 'from-pink-600/30 to-rose-600/20 hover:from-pink-500/40 hover:to-rose-500/30 text-pink-200',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/20 text-pink-300',
      action: () => sounds.playRimshot(),
    },
    {
      id: 'airhorn',
      label: 'DJ Air Horn',
      tag: 'Triple Blast',
      emoji: '📢',
      category: 'funny',
      color: 'from-cyan-600/30 to-blue-600/20 hover:from-cyan-500/40 hover:to-blue-500/30 text-cyan-200',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300',
      action: () => sounds.playAirhorn(),
    },
    {
      id: 'audience-gasp',
      label: 'Dramatic Gasp',
      tag: 'Audience Ohhh!',
      emoji: '😱',
      category: 'funny',
      color: 'from-violet-600/30 to-purple-600/20 hover:from-violet-500/40 hover:to-purple-500/30 text-violet-200',
      border: 'border-violet-500/40 hover:border-violet-400',
      badge: 'bg-violet-500/20 text-violet-300',
      action: () => sounds.playGasp(),
    },
    {
      id: 'slide-up',
      label: 'Whistle Slide Up',
      tag: 'Cartoon Lift',
      emoji: '🚀',
      category: 'funny',
      color: 'from-teal-600/30 to-emerald-600/20 hover:from-teal-500/40 hover:to-emerald-500/30 text-teal-200',
      border: 'border-teal-500/40 hover:border-teal-400',
      badge: 'bg-teal-500/20 text-teal-300',
      action: () => sounds.playSlideWhistle('up'),
    },
    {
      id: 'slide-down',
      label: 'Whistle Drop',
      tag: 'Cartoon Fall',
      emoji: '📉',
      category: 'funny',
      color: 'from-amber-700/30 to-rose-700/20 hover:from-amber-600/40 hover:to-rose-600/30 text-amber-200',
      border: 'border-amber-600/40 hover:border-amber-500',
      badge: 'bg-amber-600/20 text-amber-300',
      action: () => sounds.playSlideWhistle('down'),
    },
    {
      id: 'oh-no-you-didnt',
      label: "Oh No You Didn't!",
      tag: 'Dramatic Voice',
      emoji: '👀',
      category: 'funny',
      color: 'from-red-600/30 to-orange-600/20 hover:from-red-500/40 hover:to-orange-500/30 text-red-200',
      border: 'border-red-500/40 hover:border-red-400',
      badge: 'bg-red-500/20 text-red-300',
      action: () => {
        sounds.playOops();
        sounds.speakPhrase("Oh no you didn't!", 'funny');
      },
    },

    // ⚡ Game Suspense & Reactions
    {
      id: 'strike-buzzer',
      label: 'Red Strike Buzzer',
      tag: 'Classic X Buzzer',
      emoji: '❌',
      category: 'suspense',
      color: 'from-red-700/40 to-rose-900/40 hover:from-red-600/50 hover:to-rose-800/50 text-red-100',
      border: 'border-red-500/50 hover:border-red-400',
      badge: 'bg-red-500/30 text-red-200',
      action: () => sounds.playStrike(),
    },
    {
      id: 'triple-strike',
      label: 'Triple Strike',
      tag: '3x Buzzer Steal',
      emoji: '🚨',
      category: 'suspense',
      color: 'from-rose-800/40 to-red-950/50 hover:from-rose-700/50 hover:to-red-900/50 text-rose-100',
      border: 'border-rose-500/60 hover:border-rose-400',
      badge: 'bg-rose-500/30 text-rose-200',
      action: () => sounds.playTripleStrike(),
    },
    {
      id: 'drumroll',
      label: 'Drumroll',
      tag: 'Suspense Snare',
      emoji: '🥁',
      category: 'suspense',
      color: 'from-blue-700/30 to-indigo-800/30 hover:from-blue-600/40 hover:to-indigo-700/40 text-blue-200',
      border: 'border-blue-500/40 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-300',
      action: () => sounds.playDrumroll(1.8),
    },
    {
      id: 'heartbeat',
      label: 'Heartbeat Thump',
      tag: 'Tension Lub-Dub',
      emoji: '💓',
      category: 'suspense',
      color: 'from-red-900/40 to-purple-900/40 hover:from-red-800/50 hover:to-purple-800/50 text-red-200',
      border: 'border-red-600/40 hover:border-red-500',
      badge: 'bg-red-600/20 text-red-300',
      action: () => sounds.playHeartbeat(),
    },
    {
      id: 'magic-sparkle',
      label: 'Magical Shimmer',
      tag: 'Celestial Chime',
      emoji: '🧙‍♂️',
      category: 'suspense',
      color: 'from-indigo-600/30 to-purple-600/30 hover:from-indigo-500/40 hover:to-purple-500/40 text-indigo-200',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300',
      action: () => sounds.playMagicalEntrance(),
    },
    {
      id: 'de-escalate',
      label: 'De-escalate, Peace!',
      tag: 'Wisdom Voice',
      emoji: '🕊️',
      category: 'suspense',
      color: 'from-emerald-700/30 to-teal-800/30 hover:from-emerald-600/40 hover:to-teal-700/40 text-emerald-200',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      action: () => {
        sounds.playCameraOn();
        sounds.speakPhrase('De-escalate, do not escalate! Choose peace!', 'encouraging');
      },
    },
  ];

  const handlePlayClip = (item: SoundItem) => {
    setActiveSoundId(item.id);
    setLastPlayedName(`${item.emoji} ${item.label}`);
    item.action();
  };

  const filteredClips =
    activeCategory === 'all'
      ? soundClips
      : soundClips.filter((c) => c.category === activeCategory);

  if (!isOpen) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 border-2 border-amber-400/80 text-amber-300 shadow-2xl shadow-amber-500/30 font-black text-xs uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          title="Restore full Live Soundboard"
        >
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
            <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
          <span className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>Soundboard</span>
          </span>
          <Maximize2 className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/60 shadow-2xl p-4 sm:p-6 text-left z-10 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/30 to-yellow-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/20">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-sans">
                  Live Studio Soundboard
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Instant FX
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger audience reactions, funny stingers, and encouraging cheers live during gameplay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Audio Settings"
                aria-label="Audio Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize to floating pill"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Soundboard"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Audio Status Banner & Last Triggered Clip */}
        <div className="flex items-center justify-between py-2.5 px-3 my-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.12s]" />
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.24s]" />
            </div>
            <span className="text-slate-400 truncate">
              {lastPlayedName ? (
                <>
                  Playing Now:{' '}
                  <strong className="text-amber-300 font-bold">{lastPlayedName}</strong>
                </>
              ) : (
                'Ready to play · Tap any pad below'
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-400 font-mono">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">100% Offline Synthesizer</span>
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveCategory('all');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All ({soundClips.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveCategory('cheer');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeCategory === 'cheer'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>👏 Cheers</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveCategory('funny');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeCategory === 'funny'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>🤪 Funny</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveCategory('suspense');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeCategory === 'suspense'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>⚡ Drama</span>
          </button>
        </div>

        {/* Sound Pads Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto pr-1 py-1 custom-scrollbar">
          {filteredClips.map((item) => {
            const isPlaying = activeSoundId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePlayClip(item)}
                className={`relative group p-3 rounded-xl border bg-gradient-to-br ${item.color} ${item.border} text-left transition-all duration-150 active:scale-95 cursor-pointer shadow-md flex flex-col justify-between overflow-hidden select-none min-h-[82px] ${
                  isPlaying ? 'ring-2 ring-amber-400 scale-[0.98] brightness-125' : ''
                }`}
                title={`Play ${item.label}`}
              >
                {/* Active Ripple Animation */}
                {isPlaying && (
                  <span className="absolute inset-0 bg-white/20 animate-ping pointer-events-none rounded-xl" />
                )}

                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="text-2xl leading-none transition-transform group-hover:scale-110">
                    {item.emoji}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.badge} truncate`}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Tips Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Use soundboard clips to cheer on your partner or playfully tease funny answers!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer shrink-0 ml-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

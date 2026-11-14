import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Bell,
  Users,
  Mic,
  AlertOctagon,
  Trophy,
  Play,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { sounds, SoundCategorySettings } from '../utils/audio';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: (settings: SoundCategorySettings) => void;
}

interface CategoryConfig {
  id: keyof Omit<SoundCategorySettings, 'master'>;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeText: string;
  testAction: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [settings, setSettings] = useState<SoundCategorySettings>(() => sounds.getSettings());
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(sounds.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (key: keyof SoundCategorySettings) => {
    const nextVal = !settings[key];
    sounds.setCategory(key, nextVal);
    const updated = sounds.getSettings();
    setSettings(updated);
    if (onSettingsChanged) {
      onSettingsChanged(updated);
    }

    // Play subtle feedback tick if toggling an on state
    if (nextVal && key !== 'master') {
      sounds.playTick();
    }
  };

  const handleToggleMaster = () => {
    const nextVal = !settings.master;
    sounds.setCategory('master', nextVal);
    const updated = sounds.getSettings();
    setSettings(updated);
    if (onSettingsChanged) {
      onSettingsChanged(updated);
    }
    if (nextVal) {
      sounds.playTick();
    }
  };

  const handleEnableAll = () => {
    sounds.playTick();
    const allEnabled: SoundCategorySettings = {
      master: true,
      gameChimes: true,
      crowdReactions: true,
      voiceEffects: true,
      buzzers: true,
      fanfares: true,
    };
    Object.entries(allEnabled).forEach(([k, v]) => {
      sounds.setCategory(k as keyof SoundCategorySettings, v);
    });
    setSettings(allEnabled);
    if (onSettingsChanged) onSettingsChanged(allEnabled);
  };

  const handleMuteAll = () => {
    sounds.playTick();
    const allMuted: SoundCategorySettings = {
      master: false,
      gameChimes: false,
      crowdReactions: false,
      voiceEffects: false,
      buzzers: false,
      fanfares: false,
    };
    Object.entries(allMuted).forEach(([k, v]) => {
      sounds.setCategory(k as keyof SoundCategorySettings, v);
    });
    setSettings(allMuted);
    if (onSettingsChanged) onSettingsChanged(allMuted);
  };

  const handleTestCategory = (id: string, testFn: () => void) => {
    // If master is muted, prompt user or temporarily allow
    if (!settings.master) {
      sounds.setCategory('master', true);
      setSettings(sounds.getSettings());
    }
    // If specific category is off, turn it on so they can hear it
    if (!settings[id as keyof SoundCategorySettings]) {
      sounds.setCategory(id as keyof SoundCategorySettings, true);
      setSettings(sounds.getSettings());
    }

    setActiveTestingId(id);
    testFn();
    setTimeout(() => {
      setActiveTestingId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const categories: CategoryConfig[] = [
    {
      id: 'gameChimes',
      title: 'Game Chimes & Bells',
      description: 'Golden bell chime on correct answers, board card flips, turn clock ticks, and camera snapshots.',
      icon: <Bell className="w-4 h-4 text-amber-400" />,
      accentColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      badgeText: 'Harmonic Bells',
      testAction: () => sounds.playCorrectAnswerChime(1),
    },
    {
      id: 'crowdReactions',
      title: 'Crowd Reactions & Applause',
      description: 'Authentic live studio audience cheering, clapping transients, and enthusiastic crowd roar swells.',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      accentColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      badgeText: 'Studio Audience',
      testAction: () => sounds.playCrowdCheer(2.2),
    },
    {
      id: 'voiceEffects',
      title: 'Voice Effects & Announcer',
      description: 'Theatrical booming wizard game-show host speech and mystical cosmic gong arpeggios.',
      icon: <Mic className="w-4 h-4 text-purple-400" />,
      accentColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      badgeText: 'Speech Synthesizer',
      testAction: () => sounds.speakMagicalAnnouncement('Welcome to Resolution Feud! Prepare thy compromises!'),
    },
    {
      id: 'buzzers',
      title: 'Buzzers & Strikes',
      description: 'Classic harsh strike buzzers (X) and distinctive electronic podium buzzers for Team 1 & Team 2.',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400" />,
      accentColor: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      badgeText: 'Klaxons & Strikes',
      testAction: () => {
        sounds.playStrike();
        setTimeout(() => sounds.playTeamBuzzer(1), 350);
      },
    },
    {
      id: 'fanfares',
      title: 'Victory Fanfares',
      description: 'Triumphant game show brass fanfare chords and sparkling arpeggios when rounds are won.',
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      accentColor: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
      badgeText: 'Round Win Brass',
      testAction: () => sounds.playWinFanfare(),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 text-left overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1 shrink-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
              Audio Equalizer &amp; Sound FX
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Studio Sound Settings
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4 shrink-0">
          Toggle each sound category independently so you can customize your gameplay atmosphere.
        </p>

        {/* Master Audio Controller Card */}
        <div className="p-4 mb-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-lg flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                settings.master
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {settings.master ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-sm text-white">
                <span>Master Sound Engine</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    settings.master
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {settings.master ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {settings.master
                  ? 'All selected game audio is live and playing'
                  : 'All audio is muted across the entire application'}
              </p>
            </div>
          </div>

          {/* Master Toggle Pill */}
          <button
            type="button"
            onClick={handleToggleMaster}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.master ? 'bg-amber-400' : 'bg-slate-800'
            }`}
            title="Toggle Master Sound"
            aria-label="Toggle Master Audio"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.master ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {categories.map((cat) => {
            const isCategoryOn = settings.master && settings[cat.id];
            const isTesting = activeTestingId === cat.id;

            return (
              <div
                key={cat.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCategoryOn
                    ? 'bg-slate-950/90 border-slate-700/80 hover:border-amber-400/40'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Category Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${cat.accentColor}`}>
                      {cat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white truncate">
                          {cat.title}
                        </h4>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Test Sound & Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    <button
                      type="button"
                      onClick={() => handleTestCategory(cat.id, cat.testAction)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTesting
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                      title={`Preview ${cat.title}`}
                    >
                      <Play className={`w-3 h-3 ${isTesting ? 'fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
                      <span>{isTesting ? 'Playing...' : 'Test'}</span>
                    </button>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings[cat.id] ? 'bg-amber-400' : 'bg-slate-800'
                      }`}
                      title={`Toggle ${cat.title}`}
                      aria-label={`Toggle ${cat.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                          settings[cat.id] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Quick Preset Actions */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enable All</span>
            </button>
            <button
              type="button"
              onClick={handleMuteAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Mute All</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

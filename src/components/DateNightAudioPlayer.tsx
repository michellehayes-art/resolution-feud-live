import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Music,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import {
  dateNightAudio,
  DATE_NIGHT_VIBES,
  DateNightVibe,
  VibePlayerState,
} from '../utils/dateNightVibeAudio';
import { sounds } from '../utils/audio';

interface DateNightAudioPlayerProps {
  variant?: 'full' | 'compact' | 'floating-pill';
  className?: string;
  onVibeChange?: (vibe: DateNightVibe) => void;
}

export const DateNightAudioPlayer: React.FC<DateNightAudioPlayerProps> = ({
  variant = 'full',
  className = '',
  onVibeChange,
}) => {
  const [playerState, setPlayerState] = useState<VibePlayerState>(() => dateNightAudio.getState());
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = dateNightAudio.subscribe((newState) => {
      setPlayerState(newState);
    });
    return () => unsubscribe();
  }, []);

  const activeVibe =
    DATE_NIGHT_VIBES.find((v) => v.id === playerState.activeVibeId) || DATE_NIGHT_VIBES[0];

  const handleSelectVibe = (vibeId: string) => {
    sounds.playTick();
    dateNightAudio.selectVibe(vibeId);
    const chosen = DATE_NIGHT_VIBES.find((v) => v.id === vibeId);
    if (chosen && onVibeChange) {
      onVibeChange(chosen);
    }
  };

  const handleTogglePlay = () => {
    sounds.playTick();
    dateNightAudio.togglePlay();
  };

  const handleNext = () => {
    sounds.playTick();
    const currIndex = DATE_NIGHT_VIBES.findIndex((v) => v.id === playerState.activeVibeId);
    const nextVibe = DATE_NIGHT_VIBES[(currIndex + 1) % DATE_NIGHT_VIBES.length];
    dateNightAudio.selectVibe(nextVibe.id);
    if (onVibeChange) onVibeChange(nextVibe);
  };

  const handlePrev = () => {
    sounds.playTick();
    const currIndex = DATE_NIGHT_VIBES.findIndex((v) => v.id === playerState.activeVibeId);
    const prevVibe =
      DATE_NIGHT_VIBES[(currIndex - 1 + DATE_NIGHT_VIBES.length) % DATE_NIGHT_VIBES.length];
    dateNightAudio.selectVibe(prevVibe.id);
    if (onVibeChange) onVibeChange(prevVibe);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ========================================================================
  // FLOATING PILL VARIANT (For inside Unwrap Modal & Floating Overlay)
  // ========================================================================
  if (variant === 'floating-pill') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/60 shadow-xl backdrop-blur-md select-none ${className}`}
      >
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
            playerState.isPlaying
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/40'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={playerState.isPlaying ? 'Pause Date Night Vibe' : 'Play Date Night Vibe'}
        >
          {playerState.isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Vibe Title & Animated Equalizer */}
        <div className="flex items-center gap-2">
          <span className="text-base">{activeVibe.icon}</span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white leading-none">
                {activeVibe.name}
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                {formatTimer(playerState.secondsElapsed)}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium block leading-tight truncate max-w-[140px]">
              {playerState.isPlaying ? 'Now Playing Vibe' : 'Tap to set mood'}
            </span>
          </div>
        </div>

        {/* Dynamic Equalizer Frequency Bars */}
        <div className="flex items-end gap-0.5 h-4 px-1">
          {[
            { delay: '0ms', activeH: 'h-4', pausedH: 'h-1.5' },
            { delay: '150ms', activeH: 'h-3', pausedH: 'h-2' },
            { delay: '300ms', activeH: 'h-4', pausedH: 'h-1' },
            { delay: '100ms', activeH: 'h-2.5', pausedH: 'h-2' },
          ].map((bar, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-amber-400 transition-all ${
                playerState.isPlaying
                  ? `${bar.activeH} animate-pulse duration-700`
                  : `${bar.pausedH} opacity-40`
              }`}
              style={{ animationDelay: bar.delay }}
            />
          ))}
        </div>

        {/* Quick Next Track Button */}
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Switch to next Date Night Vibe"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ========================================================================
  // COMPACT VARIANT
  // ========================================================================
  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-lg flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
              playerState.isPlaying
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            {playerState.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{activeVibe.icon}</span>
              <strong className="text-xs font-black text-white truncate block">
                {activeVibe.name}
              </strong>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {activeVibe.subtitle}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-end gap-0.5 h-3.5 px-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-amber-400 transition-all ${
                  playerState.isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Next Vibe"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // FULL STUDIO PLAYER VARIANT (Embedded into Experience Gallery)
  // ========================================================================
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 shadow-xl space-y-4 ${className}`}
    >
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md shadow-amber-500/20 shrink-0">
            🎵
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>Date Night Mood Audio Player</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Live Synthesizer
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Set the mood while creating and unwrapping your romantic truce vouchers!
            </p>
          </div>
        </div>

        {/* Auto-Play Toggle */}
        <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={playerState.autoPlayOnUnwrap}
            onChange={(e) => {
              sounds.playTick();
              dateNightAudio.setAutoPlayOnUnwrap(e.target.checked);
            }}
            className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
          />
          <span className="text-[11px] font-medium text-slate-300">
            Auto-play mood when unwrapping vouchers
          </span>
        </label>
      </div>

      {/* Date Night Vibe Selector Tiles */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-amber-400" />
          <span>Select Date Night Vibe:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DATE_NIGHT_VIBES.map((vibe) => {
            const isSelected = vibe.id === playerState.activeVibeId;
            const isThisPlaying = isSelected && playerState.isPlaying;

            return (
              <button
                key={vibe.id}
                type="button"
                onClick={() => handleSelectVibe(vibe.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{vibe.icon}</span>
                    {isThisPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-1 h-3 rounded-full bg-amber-400 animate-pulse" />
                        <span className="w-1 h-2 rounded-full bg-amber-400 animate-pulse delay-100" />
                        <span className="w-1 h-3 rounded-full bg-amber-400 animate-pulse delay-200" />
                      </div>
                    ) : isSelected ? (
                      <span className="text-[9px] font-mono text-amber-400 font-bold">READY</span>
                    ) : null}
                  </div>
                  <h5 className="font-extrabold text-xs text-white truncate">{vibe.name}</h5>
                  <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{vibe.subtitle}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="font-mono">{vibe.bpm} BPM</span>
                  {isSelected && (
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Player Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
        {/* Track info & Live Dancing Waveform */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {activeVibe.icon}
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-black text-white truncate">{activeVibe.name}</h5>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {formatTimer(playerState.secondsElapsed)}
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
              {activeVibe.description}
            </p>
          </div>
        </div>

        {/* Player Controls & Volume */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {/* Dancing Equalizer Spectrum Bars */}
          <div className="flex items-end gap-1 h-6 px-2">
            {[
              { activeH: 'h-6', delay: '0ms' },
              { activeH: 'h-4', delay: '120ms' },
              { activeH: 'h-6', delay: '240ms' },
              { activeH: 'h-3', delay: '360ms' },
              { activeH: 'h-5', delay: '180ms' },
            ].map((bar, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 transition-all ${
                  playerState.isPlaying
                    ? `${bar.activeH} animate-pulse duration-500`
                    : 'h-1.5 opacity-30'
                }`}
                style={{ animationDelay: bar.delay }}
              />
            ))}
          </div>

          {/* Previous / Play / Next */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              title="Previous Vibe"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-lg ${
                playerState.isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {playerState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Vibe</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Vibe</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              title="Next Vibe"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                dateNightAudio.setVolume(playerState.volume > 0 ? 0 : 0.75);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={playerState.volume > 0 ? 'Mute' : 'Unmute'}
            >
              {playerState.volume > 0 ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playerState.volume}
              onChange={(e) => {
                dateNightAudio.setVolume(parseFloat(e.target.value));
              }}
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
              title={`Volume: ${Math.round(playerState.volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

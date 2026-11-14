import React, { useState, useRef, useEffect } from 'react';
import { CONFLICT_ARCHETYPES, RelationshipArchetype } from '../data/archetypes';
import { Sparkles, Dices, Check, ChevronDown } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ArchetypeTeamInputProps {
  value: string;
  onChange: (name: string) => void;
  onSelectAvatar?: (avatarId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  teamLabel?: string;
}

export const ArchetypeTeamInput: React.FC<ArchetypeTeamInputProps> = ({
  value,
  onChange,
  onSelectAvatar,
  disabled = false,
  placeholder = 'Enter team or partner name...',
  teamLabel = 'Team',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter archetypes based on current input text if typed
  const filteredArchetypes = React.useMemo(() => {
    if (!value.trim()) return CONFLICT_ARCHETYPES;
    const lower = value.toLowerCase();
    const matches = CONFLICT_ARCHETYPES.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.tagline.toLowerCase().includes(lower) ||
        a.category.toLowerCase().includes(lower)
    );
    // If no direct matches, return all so suggestions are still available
    return matches.length > 0 ? matches : CONFLICT_ARCHETYPES;
  }, [value]);

  const handleSelectArchetype = (archetype: RelationshipArchetype) => {
    onChange(archetype.name);
    if (onSelectAvatar && archetype.suggestedAvatar) {
      onSelectAvatar(archetype.suggestedAvatar);
    }
    sounds.playTick();
    setIsOpen(false);
  };

  const handlePickRandom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const randomIndex = Math.floor(Math.random() * CONFLICT_ARCHETYPES.length);
    const chosen = CONFLICT_ARCHETYPES[randomIndex];
    handleSelectArchetype(chosen);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Input container with focus & icon hint */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={value}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3.5 pr-16 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-sm font-medium disabled:opacity-60 transition-all"
        />

        {/* Right Action Icons (Dice Randomizer & Sparkles dropdown toggle) */}
        {!disabled && (
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handlePickRandom}
              title="Pick a random conflict archetype"
              className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Dices className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              title="Show archetype suggestions"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isOpen
                  ? 'text-amber-400 bg-amber-500/20'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestion Dropdown Menu (Triggers on Focus) */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden animate-fadeIn">
          {/* Header Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Relationship Archetypes</span>
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">
                    Popular Picks
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Select an archetype to autofill name &amp; avatar
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePickRandom}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold transition-colors cursor-pointer"
            >
              <Dices className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>

          {/* Archetypes List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-800/60">
            {filteredArchetypes.map((archetype) => {
              const isSelected = value.trim() === archetype.name;
              return (
                <button
                  key={archetype.id}
                  type="button"
                  onClick={() => handleSelectArchetype(archetype)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-400/60'
                      : 'hover:bg-slate-800/80 hover:border-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 group-hover:scale-110 transition-transform">
                      {archetype.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {archetype.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                          {archetype.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[260px] sm:max-w-[320px]">
                        {archetype.tagline}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="p-1 rounded-full bg-amber-400 text-slate-950 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-400/60 group-hover:text-amber-300 font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      Use &rarr;
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick chip footer */}
          <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-3">
            <span>Or type your own custom team name above</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

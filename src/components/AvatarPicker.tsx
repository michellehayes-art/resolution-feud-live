import React, { useState } from 'react';
import { AVATAR_OPTIONS, getAvatarById, AvatarOption } from '../data/avatars';
import { TeamAvatarBadge } from './TeamAvatarBadge';
import { Sparkles, X, Check, Smile } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AvatarPickerProps {
  selectedAvatarId?: string;
  onSelectAvatar: (avatarId: string) => void;
  teamLabel?: string;
  disabled?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatarId = 'crown',
  onSelectAvatar,
  teamLabel = 'Team',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentAvatar = getAvatarById(selectedAvatarId);

  const handlePick = (avatar: AvatarOption) => {
    sounds.playDing(1);
    onSelectAvatar(avatar.id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`group relative flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-800'
            : 'bg-slate-950/80 hover:bg-slate-900 border-slate-700 hover:border-amber-400/80 shadow-md active:scale-95'
        }`}
        title={disabled ? undefined : `Change avatar for ${teamLabel}`}
        aria-label={`Change avatar for ${teamLabel}. Currently ${currentAvatar.name}`}
      >
        <TeamAvatarBadge avatarId={selectedAvatarId} size="md" />

        <div className="hidden sm:flex flex-col text-left pr-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Avatar
          </span>
          <span className="text-xs font-semibold text-amber-300 truncate max-w-[80px]">
            {currentAvatar.name}
          </span>
        </div>

        {!disabled && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow text-[9px] group-hover:scale-110 transition-transform">
            <Smile className="w-2.5 h-2.5" />
          </div>
        )}
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/50 shadow-2xl p-5 sm:p-6 text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Choose Avatar for {teamLabel}
                  </h3>
                  <p className="text-xs text-slate-400">
                    This icon displays on the scoreboard and podiums during gameplay.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1 py-1">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = avatar.id === selectedAvatarId;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handlePick(avatar)}
                    className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <span>{avatar.emoji}</span>
                    </div>

                    <span
                      className={`text-[11px] font-semibold truncate w-full text-center ${
                        isSelected ? 'text-amber-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {avatar.name}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

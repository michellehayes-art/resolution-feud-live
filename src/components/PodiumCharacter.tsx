import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Heart, Zap, Star } from 'lucide-react';
import { getAvatarById } from '../data/avatars';

export type CharacterPoseState = 'idle' | 'buzzed' | 'cheering' | 'anticipating' | 'gasping';

export interface PodiumCharacterProps {
  teamName: string;
  avatarId?: string;
  teamNumber: 1 | 2;
  state?: CharacterPoseState;
  isBuzzed?: boolean;
  isCheering?: boolean;
  score?: number;
  className?: string;
  onBuzzerClick?: () => void;
  showSpotlight?: boolean;
}

export const PodiumCharacter: React.FC<PodiumCharacterProps> = ({
  teamName,
  avatarId = 'crown',
  teamNumber,
  state,
  isBuzzed = false,
  isCheering = false,
  score,
  className = '',
  onBuzzerClick,
  showSpotlight = true,
}) => {
  const avatar = getAvatarById(avatarId);

  // Determine active visual pose
  let effectiveState: CharacterPoseState = 'idle';
  if (isCheering) {
    effectiveState = 'cheering';
  } else if (isBuzzed) {
    effectiveState = 'buzzed';
  } else if (state) {
    effectiveState = state;
  }

  const isTeam1 = teamNumber === 1;

  // Outfit theme colors
  const theme = isTeam1
    ? {
        blazer: 'from-amber-600 via-amber-700 to-slate-900',
        lapel: 'border-amber-400 bg-amber-500/30',
        accent: 'text-amber-300',
        glow: 'rgba(245, 158, 11, 0.4)',
        ring: 'ring-amber-400/50',
        badgeBg: 'bg-amber-400 text-slate-950',
      }
    : {
        blazer: 'from-blue-600 via-indigo-700 to-slate-900',
        lapel: 'border-blue-400 bg-blue-500/30',
        accent: 'text-blue-300',
        glow: 'rgba(59, 130, 246, 0.4)',
        ring: 'ring-blue-400/50',
        badgeBg: 'bg-blue-400 text-slate-950',
      };

  // Animation class selection
  const animationClass =
    effectiveState === 'cheering'
      ? 'animate-podium-cheer'
      : effectiveState === 'buzzed'
      ? 'animate-podium-slap'
      : 'animate-podium-breathe';

  return (
    <div
      onClick={onBuzzerClick}
      className={`relative flex flex-col items-center justify-end select-none ${className}`}
    >
      {/* ============================================================== */}
      {/* OVERHEAD STUDIO SPOTLIGHT BEAM */}
      {/* ============================================================== */}
      {showSpotlight && (
        <div
          className={`absolute -top-16 inset-x-0 h-44 pointer-events-none transition-opacity duration-300 ${
            effectiveState === 'cheering' || effectiveState === 'buzzed'
              ? 'opacity-80'
              : 'opacity-30'
          }`}
        >
          <div
            className={`w-full h-full bg-gradient-to-b ${
              isTeam1
                ? 'from-amber-400/40 via-yellow-300/15 to-transparent'
                : 'from-blue-400/40 via-cyan-300/15 to-transparent'
            } blur-md rounded-t-full`}
          />
        </div>
      )}

      {/* Floating Victory Celebratory Sparkles */}
      <AnimatePresence>
        {effectiveState === 'cheering' && (
          <div className="absolute -top-10 inset-x-0 flex items-center justify-around pointer-events-none z-30">
            <motion.div
              initial={{ y: 10, scale: 0, opacity: 0 }}
              animate={{ y: [-10, -25], scale: [0.8, 1.3, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.1 }}
              className="text-amber-300"
            >
              ✨
            </motion.div>
            <motion.div
              initial={{ y: 5, scale: 0, opacity: 0 }}
              animate={{ y: [-5, -30], scale: [0.9, 1.4, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }}
              className="text-yellow-200"
            >
              ⭐
            </motion.div>
            <motion.div
              initial={{ y: 10, scale: 0, opacity: 0 }}
              animate={{ y: [-8, -22], scale: [0.7, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.1, delay: 0.5 }}
              className="text-pink-300"
            >
              🎉
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* ANIMATED CONTESTANT CHARACTER BODY HIERARCHY */}
      {/* ============================================================== */}
      <div className={`relative flex flex-col items-center z-10 ${animationClass}`}>
        {/* Floating Head Accessory / Crown / Halo */}
        <div className="h-6 flex items-center justify-center">
          {effectiveState === 'cheering' ? (
            <motion.div
              animate={{ rotate: [-6, 6, -6], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="text-lg filter drop-shadow-md"
            >
              👑
            </motion.div>
          ) : effectiveState === 'buzzed' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              className="text-base text-yellow-300 font-black animate-pulse"
            >
              ⚡
            </motion.div>
          ) : null}
        </div>

        {/* ============================================================ */}
        {/* CHARACTER HEAD & EXPRESSIVE FACE */}
        {/* ============================================================ */}
        <div className="relative">
          {/* Main Stylized Head Shell */}
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${avatar.bgGradient} border-4 ${avatar.borderColor} shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-transform`}
            style={{
              boxShadow: `0 8px 20px ${theme.glow}`,
            }}
          >
            {/* Ambient specular highlight reflection */}
            <div className="absolute top-1 left-2 w-7 h-3 rounded-full bg-white/30 rotate-[-15deg] pointer-events-none" />

            {/* Stylized Eyes with CSS Natural Blinking */}
            <div className="flex items-center justify-center gap-3.5 mb-1 z-10 animate-eye-blink">
              {effectiveState === 'cheering' ? (
                // Happy curved eyes (^ ^)
                <>
                  <svg className="w-3.5 h-3 text-slate-900" viewBox="0 0 16 12" fill="none">
                    <path
                      d="M2 9C4.5 3 11.5 3 14 9"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg className="w-3.5 h-3 text-slate-900" viewBox="0 0 16 12" fill="none">
                    <path
                      d="M2 9C4.5 3 11.5 3 14 9"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </>
              ) : effectiveState === 'buzzed' ? (
                // Focused determined wide eyes
                <>
                  <div className="w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center border border-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center border border-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </>
              ) : (
                // Natural friendly eyes
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white -mt-0.5 -ml-0.5" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white -mt-0.5 -ml-0.5" />
                  </div>
                </>
              )}
            </div>

            {/* Stylized Mouth & Expression */}
            <div className="z-10 mt-0.5 flex items-center justify-center">
              {effectiveState === 'cheering' ? (
                // Joyful open cheering mouth :D
                <div className="w-4 h-3 bg-red-600 rounded-b-full border-t-2 border-slate-900 flex items-start justify-center overflow-hidden">
                  <div className="w-2.5 h-1 bg-white rounded-b-sm" />
                </div>
              ) : effectiveState === 'buzzed' ? (
                // Smug, victorious grin
                <svg className="w-4 h-2 text-slate-900" viewBox="0 0 16 8" fill="none">
                  <path
                    d="M2 2C5 7 11 7 14 2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : effectiveState === 'gasping' ? (
                // Surprised "O" mouth
                <div className="w-2.5 h-3 rounded-full bg-slate-900 border border-slate-800" />
              ) : (
                // Warm friendly smile
                <svg className="w-3.5 h-2 text-slate-900" viewBox="0 0 16 8" fill="none">
                  <path
                    d="M3 2C5.5 6 10.5 6 13 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            {/* Team Avatar Badge Emblem (Bottom-Right Ear Pin) */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-white/30 flex items-center justify-center text-xs shadow">
              <span>{avatar.emoji}</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CONTESTANT TORSO & ARMS */}
        {/* ============================================================ */}
        <div className="relative w-28 sm:w-32 flex flex-col items-center -mt-2">
          {/* CHEERING ARMS (Raised High \o/ when Cheering) */}
          {effectiveState === 'cheering' ? (
            <div className="absolute -top-7 inset-x-0 flex justify-between px-1 pointer-events-none z-20">
              {/* Left Raised Arm */}
              <motion.div
                animate={{ rotate: [-10, 15, -10] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-4 h-10 rounded-full bg-gradient-to-t from-slate-900 via-amber-600 to-amber-400 border border-amber-300 shadow flex items-start justify-center pt-1 text-xs"
              >
                🖐️
              </motion.div>
              {/* Right Raised Arm */}
              <motion.div
                animate={{ rotate: [10, -15, 10] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                className="w-4 h-10 rounded-full bg-gradient-to-t from-slate-900 via-amber-600 to-amber-400 border border-amber-300 shadow flex items-start justify-center pt-1 text-xs"
              >
                🖐️
              </motion.div>
            </div>
          ) : effectiveState === 'buzzed' ? (
            /* BUZZED ARM (Slapping Down Toward Buzzer) */
            <div className="absolute -bottom-4 inset-x-0 flex justify-center pointer-events-none z-20">
              <motion.div
                initial={{ y: -15, scale: 1.3 }}
                animate={{ y: 2, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-sm font-black"
              >
                💥
              </motion.div>
            </div>
          ) : (
            /* IDLE POISED ARMS (Hands resting near front of podium) */
            <div className="absolute -bottom-1 inset-x-0 flex justify-between px-2.5 pointer-events-none z-20">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-700 shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-700 shadow-sm" />
            </div>
          )}

          {/* Contestant Blazer / Outfit */}
          <div
            className={`w-22 h-14 sm:w-26 sm:h-16 rounded-t-3xl bg-gradient-to-b ${theme.blazer} border-t-2 border-x-2 border-white/20 shadow-lg relative flex flex-col items-center pt-1 overflow-hidden`}
          >
            {/* Lapels / Shirt Collar V-Neck */}
            <div className="w-9 h-7 border-b-2 border-x-2 border-amber-300/40 bg-slate-950/80 rounded-b-xl flex flex-col items-center justify-center">
              {/* Tie or Necklace */}
              <div className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-sm" />
            </div>

            {/* Official Contestant Name Pin / Badge */}
            <div className="mt-1 px-2 py-0.5 rounded-md bg-black/60 border border-white/20 flex items-center gap-1 max-w-[85%] shadow-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${isTeam1 ? 'bg-amber-400' : 'bg-blue-400'}`} />
              <span className="text-[9px] font-black text-white truncate leading-none">
                {teamName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

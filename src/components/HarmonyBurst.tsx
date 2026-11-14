import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/audio';

interface HarmonyBurstProps {
  isActive: boolean;
  voucherType?: 'dozen-roses' | 'dinner-on-me' | string;
  voucherTitle?: string;
  recipientName?: string;
  onDismiss?: () => void;
}

interface BurstParticle {
  id: number;
  char?: string;
  type: 'emoji' | 'sparkle' | 'ring' | 'star' | 'disc';
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  rotate: number;
  duration: number;
  delay: number;
  scaleKeyframes: number[];
}

const DINNER_PALETTE = ['#F59E0B', '#FBBF24', '#FCD34D', '#F43F5E', '#FB7185', '#FFFFFF', '#FEF08A'];
const ROSES_PALETTE = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#F59E0B', '#FBBF24', '#FFFFFF'];

export const HarmonyBurst: React.FC<HarmonyBurstProps> = ({
  isActive,
  voucherType = 'dozen-roses',
  voucherTitle = 'A Dozen Roses & Fragrant Perfume',
  recipientName = 'Your Partner',
  onDismiss,
}) => {
  const isRoses =
    voucherType.includes('rose') ||
    voucherTitle.toLowerCase().includes('rose') ||
    voucherType === 'dozen-roses';
  const isDinner =
    voucherType.includes('dinner') ||
    voucherTitle.toLowerCase().includes('dinner') ||
    voucherType === 'dinner-on-me';

  // Play celebration audio on activation
  useEffect(() => {
    if (isActive) {
      if (isRoses) {
        sounds.playRoseShower();
      } else {
        sounds.playJackpotReveal();
      }

      // Auto dismiss after 3.2 seconds
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [isActive, isRoses]);

  // Generate 85 vibrant radial blast particles
  const particles = useMemo<BurstParticle[]>(() => {
    if (!isActive) return [];

    const palette = isRoses ? ROSES_PALETTE : DINNER_PALETTE;
    const emojis = isRoses
      ? ['🌹', '🌸', '✨', '💖', '💕', '🌷', '⭐', '💎']
      : ['🍝', '🥂', '✨', '⭐', '🍷', '🍽️', '🍾', '🎉', '💛'];

    return Array.from({ length: 85 }).map((_, i) => {
      const angle = (i / 85) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      // Explode outward with high initial velocity and deceleration
      const distance = 160 + Math.random() * 380;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - (isRoses ? 40 : 20); // slightly float upward

      const isEmoji = i % 2 === 0;
      const char = isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined;
      const types: BurstParticle['type'][] = ['emoji', 'sparkle', 'star', 'disc'];
      const type = isEmoji ? 'emoji' : types[Math.floor(Math.random() * types.length)];

      return {
        id: i,
        char,
        type,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: isEmoji ? Math.floor(Math.random() * 14) + 18 : Math.floor(Math.random() * 10) + 8,
        initialX: 0,
        initialY: 0,
        targetX,
        targetY,
        rotate: Math.random() * 720 - 360,
        duration: 1.6 + Math.random() * 1.4,
        delay: Math.random() * 0.2,
        scaleKeyframes: [0, 1.4, 1, 0],
      };
    });
  }, [isActive, isRoses]);

  return (
    <AnimatePresence>
      {isActive && (
        <div
          onClick={onDismiss}
          className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-[2px] transition-all cursor-pointer select-none"
        >
          {/* Radial Expanding Energy Shockwaves */}
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: [0.1, 2.2, 3.0], opacity: [0.9, 0.4, 0] }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className={`absolute w-[450px] h-[450px] rounded-full blur-2xl pointer-events-none ${
              isRoses
                ? 'bg-[radial-gradient(circle,rgba(244,63,94,0.6)_0%,rgba(225,29,72,0.3)_45%,transparent_70%)]'
                : 'bg-[radial-gradient(circle,rgba(251,191,36,0.6)_0%,rgba(245,158,11,0.3)_45%,transparent_70%)]'
            }`}
          />

          <motion.div
            initial={{ scale: 0.2, opacity: 1, borderWidth: 8 }}
            animate={{ scale: 2.8, opacity: 0, borderWidth: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute w-[320px] h-[320px] rounded-full pointer-events-none border-dashed ${
              isRoses ? 'border-rose-400' : 'border-amber-400'
            }`}
          />

          {/* Golden/Rose Light Beams Ray Burst */}
          <motion.div
            initial={{ rotate: 0, opacity: 0.8, scale: 0.5 }}
            animate={{ rotate: 180, opacity: [0.8, 0.3, 0], scale: [0.5, 1.6, 2.2] }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute w-[600px] h-[600px] pointer-events-none flex items-center justify-center"
          >
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                style={{ transform: `rotate(${deg}deg)` }}
                className={`absolute w-1 h-[500px] rounded-full opacity-60 ${
                  isRoses
                    ? 'bg-gradient-to-t from-transparent via-rose-400 to-transparent'
                    : 'bg-gradient-to-t from-transparent via-amber-300 to-transparent'
                }`}
              />
            ))}
          </motion.div>

          {/* Flying Particles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: p.targetX,
                  y: p.targetY,
                  scale: p.scaleKeyframes,
                  rotate: p.rotate,
                  opacity: [1, 1, 0.8, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute flex items-center justify-center"
                style={{
                  color: p.color,
                  fontSize: p.char ? `${p.size}px` : undefined,
                }}
              >
                {p.char ? (
                  <span className="drop-shadow-md select-none">{p.char}</span>
                ) : p.type === 'sparkle' ? (
                  <svg
                    width={p.size}
                    height={p.size}
                    viewBox="0 0 24 24"
                    fill={p.color}
                    className="drop-shadow-sm"
                  >
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                ) : (
                  <div
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                    }}
                    className="rounded-full shadow-md"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Central Celebratory Achievement Badge Flare */}
          <motion.div
            initial={{ scale: 0.2, y: 40, opacity: 0 }}
            animate={{
              scale: [0.2, 1.15, 1],
              y: [40, -10, 0],
              opacity: [0, 1, 1],
            }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 p-6 sm:p-7 rounded-3xl max-w-sm sm:max-w-md mx-4 text-center shadow-2xl border-4 backdrop-blur-md bg-slate-950/95"
            style={{
              borderColor: isRoses ? '#FB7185' : '#FBBF24',
              boxShadow: isRoses
                ? '0 25px 60px -15px rgba(244, 63, 94, 0.5)'
                : '0 25px 60px -15px rgba(245, 158, 11, 0.5)',
            }}
          >
            {/* Top Glowing Emblem */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-3 shadow-xl border-2 ${
                isRoses
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-500 border-rose-300 shadow-rose-500/40 text-white'
                  : 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-yellow-200 shadow-amber-500/40 text-slate-950'
              }`}
            >
              {isRoses ? '🌹' : isDinner ? '🍝' : '🎁'}
            </motion.div>

            {/* Achievement Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/20 mb-2">
              <span>✨ HARMONY BURST UNLOCKED ✨</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {voucherTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              Successfully generated &amp; dedicated for{' '}
              <strong className={isRoses ? 'text-rose-300' : 'text-amber-300'}>
                {recipientName}
              </strong>
              !
            </p>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="animate-pulse">Tap anywhere to beam voucher</span>
              <span>•</span>
              <span className="font-mono text-amber-300">Official Truce Signed</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

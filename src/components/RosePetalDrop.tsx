import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface RosePetalDropProps {
  isActive: boolean;
  onDismiss: () => void;
  senderName?: string;
  recipientName?: string;
  customMessage?: string;
}

interface PetalParticle {
  id: number;
  emoji: string;
  startX: number; // 0 - 100vw
  swayX: number;  // offset in px
  size: number;   // px font size
  duration: number; // seconds
  delay: number;  // seconds
  rotateStart: number;
  rotateEnd: number;
  opacity: number;
}

const PETAL_EMOJIS = ['🌹', '🌸', '🌹', '🌺', '🍃', '💖', '✨', '💐', '🌹', '🌷'];

export const RosePetalDrop: React.FC<RosePetalDropProps> = ({
  isActive,
  onDismiss,
  senderName = 'Your Partner',
  recipientName = 'You',
  customMessage,
}) => {
  useEffect(() => {
    if (isActive) {
      sounds.playRoseShower();
      // Auto dismiss after 5.5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onDismiss]);

  // Generate 55 unique drifting rose and petal particles
  const particles = useMemo<PetalParticle[]>(() => {
    return Array.from({ length: 55 }).map((_, index) => {
      const emoji = PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)];
      return {
        id: index,
        emoji,
        startX: Math.random() * 96 + 2, // 2% to 98% of screen width
        swayX: (Math.random() - 0.5) * 140, // sway left/right
        size: emoji === '🌹' ? 28 + Math.random() * 20 : 18 + Math.random() * 16,
        duration: 3.2 + Math.random() * 2.2, // 3.2s to 5.4s
        delay: Math.random() * 1.6, // staggered cascade
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 720 - 360,
        opacity: 0.85 + Math.random() * 0.15,
      };
    });
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div
          onClick={onDismiss}
          className="fixed inset-0 z-50 pointer-events-auto cursor-pointer overflow-hidden flex flex-col items-center justify-between p-4 bg-gradient-to-b from-rose-950/40 via-pink-950/20 to-black/60 backdrop-blur-xs select-none"
        >
          {/* Falling Roses and Petals Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${p.startX}vw`,
                  y: '-10vh',
                  rotate: p.rotateStart,
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  x: [`${p.startX}vw`, `${p.startX + p.swayX * 0.05}vw`, `${p.startX}vw`],
                  y: '105vh',
                  rotate: p.rotateEnd,
                  scale: [0.6, 1.1, 1],
                  opacity: [0, p.opacity, p.opacity, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  fontSize: `${p.size}px`,
                  filter:
                    p.emoji === '🌹'
                      ? 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.7))'
                      : 'drop-shadow(0 0 6px rgba(251, 113, 133, 0.5))',
                }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </div>

          {/* Sweet Floating Truce Toast Banner */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 mt-6 max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-rose-950/95 via-pink-950/90 to-rose-950/95 border-2 border-rose-400 shadow-2xl shadow-rose-500/30 text-center"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="absolute top-2.5 right-2.5 p-1 rounded-full text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-spin" />
              <span>Sweet Truce &amp; Affection</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-spin" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              <span>🌹 A Dozen Roses for {recipientName}! 🌹</span>
            </h3>

            <p className="text-xs sm:text-sm text-rose-100/90 mt-1.5 font-medium leading-relaxed">
              {customMessage ||
                `Sent with love by ${senderName}. Disagreements settled, peace restored, and date night begins now!`}
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-[11px] font-bold text-rose-200">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
              <span>Tap anywhere to dismiss</span>
            </div>
          </motion.div>

          <div />
        </div>
      )}
    </AnimatePresence>
  );
};

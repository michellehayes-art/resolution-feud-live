import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GameOverConfettiProps {
  isActive?: boolean;
  winnerName?: string;
  avatarId?: string;
  triggerKey?: number | string;
}

interface ConfettiPiece {
  id: number;
  origin: 'left' | 'right' | 'top';
  type: 'strip' | 'ribbon' | 'star' | 'heart' | 'disc';
  color: string;
  width: number;
  height: number;
  startX: number;
  startY: number;
  peakX: number;
  peakY: number;
  endX: number;
  endY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
  delay: number;
}

const PALETTE = [
  '#F59E0B', // Amber Gold
  '#FBBF24', // Sun Gold
  '#FDE047', // Brilliant Yellow
  '#3B82F6', // TV Studio Blue
  '#60A5FA', // Sky Blue
  '#EC4899', // Empathy Pink
  '#F43F5E', // Rose Heart
  '#10B981', // Harmony Emerald
  '#34D399', // Mint Green
  '#A855F7', // Royal Violet
  '#FFFFFF', // Diamond White Sparkle
];

export const GameOverConfetti: React.FC<GameOverConfettiProps> = ({
  isActive = true,
  triggerKey = 0,
}) => {
  // Generate a rich batch of 100 physics-based confetti particles across 3 origins
  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (!isActive) return [];

    return Array.from({ length: 110 }).map((_, i) => {
      // 40% from left cannon, 40% from right cannon, 20% raining from the ceiling
      const rand = Math.random();
      const origin: ConfettiPiece['origin'] =
        rand < 0.4 ? 'left' : rand < 0.8 ? 'right' : 'top';

      const typeChoices: ConfettiPiece['type'][] = [
        'strip',
        'strip',
        'ribbon',
        'star',
        'heart',
        'disc',
      ];
      const type = typeChoices[Math.floor(Math.random() * typeChoices.length)];
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      let startX = 0;
      let startY = 100;
      let peakX = 50;
      let peakY = 20;
      let endX = 50;
      let endY = 115;

      if (origin === 'left') {
        // Cannon at bottom left shooting up and inward
        startX = Math.random() * 8; // 0% - 8% vw
        startY = 95 + Math.random() * 10; // near bottom
        const shootSpread = 25 + Math.random() * 45; // shoots towards 25% - 70% vw
        peakX = startX + shootSpread;
        peakY = 8 + Math.random() * 25; // upward arc (8% - 33% vh)
        endX = peakX + (Math.random() * 20 - 5); // drift slightly further right
        endY = 110 + Math.random() * 10;
      } else if (origin === 'right') {
        // Cannon at bottom right shooting up and inward
        startX = 92 + Math.random() * 8; // 92% - 100% vw
        startY = 95 + Math.random() * 10; // near bottom
        const shootSpread = 25 + Math.random() * 45; // shoots towards left
        peakX = startX - shootSpread;
        peakY = 8 + Math.random() * 25; // upward arc (8% - 33% vh)
        endX = peakX - (Math.random() * 20 - 5); // drift slightly further left
        endY = 110 + Math.random() * 10;
      } else {
        // Sky fall from ceiling
        startX = Math.random() * 100; // 0% - 100% vw
        startY = -5 - Math.random() * 10; // above viewport
        peakX = startX + (Math.random() * 14 - 7);
        peakY = 25 + Math.random() * 20;
        endX = startX + (Math.random() * 30 - 15);
        endY = 110 + Math.random() * 10;
      }

      const size = Math.floor(Math.random() * 8) + 8; // 8px - 16px
      const width = type === 'ribbon' ? size * 0.7 : size;
      const height =
        type === 'strip' ? size * 1.8 : type === 'ribbon' ? size * 2.8 : size;

      return {
        id: i,
        origin,
        type,
        color,
        width,
        height,
        startX,
        startY,
        peakX,
        peakY,
        endX,
        endY,
        rotateX: Math.random() * 1080 - 540,
        rotateY: Math.random() * 1440 - 720,
        rotateZ: Math.random() * 720 - 360,
        duration: 2.4 + Math.random() * 1.8,
        delay: origin === 'top' ? 0.3 + Math.random() * 0.8 : Math.random() * 0.45,
      };
    });
  }, [isActive, triggerKey]);

  return (
    <AnimatePresence>
      {isActive && (
        <div
          className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
          aria-hidden="true"
        >
          {/* Ambient Victory Aura Flash */}
          <motion.div
            key={`flash-${triggerKey}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.25, 1.4] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-[radial-gradient(ellipse,rgba(251,191,36,0.38)_0%,rgba(236,72,153,0.18)_40%,rgba(59,130,246,0.12)_65%,transparent_80%)] blur-3xl"
          />

          {/* Left Cannon Launch Flash */}
          <motion.div
            key={`cannon-l-${triggerKey}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.8, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute left-4 bottom-8 w-28 h-28 rounded-full bg-amber-400/40 blur-xl"
          />

          {/* Right Cannon Launch Flash */}
          <motion.div
            key={`cannon-r-${triggerKey}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.8, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute right-4 bottom-8 w-28 h-28 rounded-full bg-amber-400/40 blur-xl"
          />

          {/* Confetti Particle Elements */}
          {pieces.map((p) => (
            <motion.div
              key={`${p.id}-${triggerKey}`}
              initial={{
                left: `${p.startX}%`,
                top: `${p.startY}%`,
                scale: 0,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
              }}
              animate={{
                left: [`${p.startX}%`, `${p.peakX}%`, `${p.endX}%`],
                top: [`${p.startY}%`, `${p.peakY}%`, `${p.endY}%`],
                scale: [0, 1.3, 1, 0.85],
                opacity: [0, 1, 1, 0],
                rotateX: p.rotateX,
                rotateY: p.rotateY,
                rotateZ: p.rotateZ,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                times: [0, 0.35, 1],
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute will-change-transform"
              style={{
                width: p.width,
                height: p.height,
              }}
            >
              {/* Rectangular Confetti Paper */}
              {p.type === 'strip' && (
                <div
                  className="w-full h-full rounded-[2px] shadow-sm"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 2px 6px ${p.color}66`,
                  }}
                />
              )}

              {/* Twisting Ribbon Streamer */}
              {p.type === 'ribbon' && (
                <div
                  className="w-full h-full rounded-sm opacity-90"
                  style={{
                    backgroundColor: p.color,
                    clipPath: 'polygon(0 0, 100% 12%, 85% 100%, 0 88%)',
                    boxShadow: `0 2px 8px ${p.color}88`,
                  }}
                />
              )}

              {/* Shimmering Coin Disc */}
              {p.type === 'disc' && (
                <div
                  className="w-full h-full rounded-full shadow-md"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                />
              )}

              {/* Five-point Gold Celebration Star */}
              {p.type === 'star' && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full filter drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                  fill={p.color}
                >
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              )}

              {/* Empathy / Couples Love Heart */}
              {p.type === 'heart' && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full filter drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]"
                  fill={p.color}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

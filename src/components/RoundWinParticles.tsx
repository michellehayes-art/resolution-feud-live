import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoundWinParticlesProps {
  isActive: boolean;
  winningTeamName?: string;
  points?: number;
}

interface Particle {
  id: number;
  type: 'confetti' | 'star' | 'circle' | 'sparkle';
  color: string;
  size: number;
  targetX: number;
  targetY: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  duration: number;
  delay: number;
  curveY: number;
}

const PALETTE = [
  '#F59E0B', // Amber
  '#FBBF24', // Golden yellow
  '#FCD34D', // Light gold
  '#3B82F6', // TV Studio Blue
  '#60A5FA', // Sky Blue
  '#10B981', // Harmony Emerald
  '#34D399', // Mint green
  '#EC4899', // Celebration Pink
  '#F43F5E', // Rose
  '#FFFFFF', // White sparkle
];

export const RoundWinParticles: React.FC<RoundWinParticlesProps> = ({
  isActive,
  winningTeamName,
  points,
}) => {
  // Generate 70 varied celebration particles with physics trajectories
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 70 }).map((_, i) => {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      // Burst spread: wider horizontally, high upward arc
      const velocity = 180 + Math.random() * 360;
      const targetX = Math.cos(angle) * velocity;
      // Strong upward bias (-Y is up)
      const targetY = -Math.abs(Math.sin(angle)) * (velocity * 0.9) - 60 + (Math.random() * 80 - 40);

      const types: Particle['type'][] = ['confetti', 'star', 'circle', 'sparkle'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      return {
        id: i,
        type: chosenType,
        color,
        size: Math.floor(Math.random() * 10) + 8,
        targetX,
        targetY,
        rotationX: Math.random() * 720 - 360,
        rotationY: Math.random() * 720 - 360,
        rotationZ: Math.random() * 720 - 360,
        duration: 1.8 + Math.random() * 1.2,
        delay: Math.random() * 0.35,
        curveY: targetY + 120 + Math.random() * 100, // Gravity pull downward
      };
    });
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible flex items-center justify-center">
          {/* Subtle Ambient Radial Flash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.45, 0], scale: [0.5, 1.4, 1.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.35)_0%,rgba(59,130,246,0.15)_45%,transparent_70%)] blur-2xl"
          />

          {/* Floating Victory Banner Flare */}
          {winningTeamName && (
            <motion.div
              initial={{ scale: 0.4, y: 30, opacity: 0 }}
              animate={{
                scale: [0.4, 1.12, 1],
                y: [30, -10, 0],
                opacity: [0, 1, 1],
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-6 sm:-top-8 z-40 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-amber-400/50 border-2 border-white/80 flex items-center gap-2"
            >
              <span className="text-xl">🏆</span>
              <span>{winningTeamName} Sweeps the Board!</span>
              {points !== undefined && points > 0 && (
                <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                  +{points} pts
                </span>
              )}
            </motion.div>
          )}

          {/* Particles Burst */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
              }}
              animate={{
                x: p.targetX,
                y: [0, p.targetY, p.curveY],
                scale: [0, 1.3, 1, 0.7],
                opacity: [0, 1, 1, 0],
                rotateX: p.rotationX,
                rotateY: p.rotationY,
                rotateZ: p.rotationZ,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                times: [0, 0.4, 0.85, 1],
                ease: 'easeOut',
              }}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                width: p.size,
                height: p.type === 'confetti' ? p.size * 1.8 : p.size,
              }}
            >
              {p.type === 'confetti' && (
                <div
                  className="w-full h-full rounded-[2px] shadow-sm"
                  style={{ backgroundColor: p.color }}
                />
              )}

              {p.type === 'circle' && (
                <div
                  className="w-full h-full rounded-full shadow-md"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                />
              )}

              {p.type === 'star' && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  fill={p.color}
                >
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              )}

              {p.type === 'sparkle' && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  fill={p.color}
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, X, Wand2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MagicalAnnouncerBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  announcementText?: string;
}

export const MagicalAnnouncerBanner: React.FC<MagicalAnnouncerBannerProps> = ({
  isVisible,
  onDismiss,
  announcementText = 'You have entered Resolution Feud! Enjoy, everyone!',
}) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5.5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  const handleReplay = () => {
    sounds.speakMagicalAnnouncement(
      'You have entered Resolution Feud! Prepare thy compromises, and enjoy, everyone!'
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-slate-950 to-amber-950 border-2 border-amber-400/80 shadow-2xl shadow-purple-950/80 p-4 sm:p-5 text-center backdrop-blur-md">
            {/* Ambient Background Glow Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.25)_0%,rgba(168,85,247,0.2)_50%,transparent_80%)] animate-pulse" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Wizard Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">
              <Wand2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Magical Announcer Decrees</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>

            {/* Main Catchphrase Headline */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
              "YOU HAVE ENTERED RESOLUTION FEUD!{' '}
              <span className="text-amber-300">ENJOY, EVERYONE!</span>"
            </h2>

            {/* Funny subtitle */}
            <p className="text-xs text-purple-200 mt-1 font-medium">
              🧙‍♂️ Put down your defensiveness, prepare thy compromises, and let the healing begin!
            </p>

            {/* Replay Sound Action */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleReplay}
                className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Hear Loud Voice Again</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Mic,
  Award,
  Heart,
  Flame,
  Check,
  RotateCcw,
  Smile,
  Crown,
} from 'lucide-react';
import { sounds } from '../utils/audio';

export interface CouplePodiumBuzzerProps {
  partner1Name?: string;
  partner2Name?: string;
  partner1Avatar?: string;
  partner2Avatar?: string;
  prizeTitle?: string;
  voucherType?: string;
  pledge?: string;
  className?: string;
  onAnnounceComplete?: () => void;
}

export const CouplePodiumBuzzer: React.FC<CouplePodiumBuzzerProps> = ({
  partner1Name = 'Taylor',
  partner2Name = 'Michelle',
  partner1Avatar = '👑',
  partner2Avatar = '💖',
  prizeTitle = 'Home-Cooked Dinner Pass',
  voucherType = 'home-cooked-dinner-pass',
  pledge = 'A full 3-course homemade feast cooked from scratch with 100% kitchen cleanup!',
  className = '',
}) => {
  const [isBuzzerPressed, setIsBuzzerPressed] = useState(false);
  const [activeBuzzerPartner, setActiveBuzzerPartner] = useState<1 | 2>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [podiumMode, setPodiumMode] = useState<'COUPLE' | 'SOLO'>('COUPLE');

  // Trigger voice announcement
  const handleTriggerBuzzer = (buzzerTapper: 1 | 2 = 1) => {
    setActiveBuzzerPartner(buzzerTapper);
    setIsBuzzerPressed(true);
    setTimeout(() => setIsBuzzerPressed(false), 300);

    const sender = buzzerTapper === 1 ? partner1Name : partner2Name;
    const recipient = buzzerTapper === 1 ? partner2Name : partner1Name;

    // Generate speech text for bubble display
    const typeLower = (voucherType + ' ' + prizeTitle).toLowerCase();
    let displayLine = `Official verdict: ${sender} owes ${recipient} ${prizeTitle}!`;
    if (typeLower.includes('dinner') || typeLower.includes('cook')) {
      displayLine = `Attention studio! ${sender} officially owes ${recipient} a homemade 3-course dinner! 100% dish cleanup is on ${sender}!`;
    } else if (typeLower.includes('massage')) {
      displayLine = `Grab the essential oils! ${sender} has pledged a 15-minute deluxe candlelit back massage for ${recipient}!`;
    } else if (typeLower.includes('rose')) {
      displayLine = `A royal peace pact! ${recipient} is awarded one dozen fresh long-stem roses and treats from ${sender}!`;
    } else if (typeLower.includes('movie')) {
      displayLine = `Remote control surrendered! ${recipient} is crowned Movie Night Czar! ${sender} handles popcorn duty!`;
    } else if (typeLower.includes('breakfast')) {
      displayLine = `Order up for the royal suite! ${sender} is serving fresh warm croissants & coffee in bed to ${recipient}!`;
    } else if (typeLower.includes('ice cream')) {
      displayLine = `Late-night siren! ${sender} takes ${recipient} on a midnight pajama ice cream run with all extra fudge!`;
    } else if (typeLower.includes('chore')) {
      displayLine = `24-hour chore immunity granted to ${recipient}! ${sender} assumes all dish & laundry duty with a smile!`;
    }

    setSpeechText(displayLine);
    setShowSpeechBubble(true);
    setIsSpeaking(true);

    // Call voice synthesizer
    sounds.speakPrizeVerdict({
      sender,
      recipient,
      prizeTitle,
      voucherType,
      pledge,
    });

    // Reset speaking state after typical utterance duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, 7000);
  };

  const handleStopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setShowSpeechBubble(false);
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-2xl relative overflow-hidden select-none text-center ${className}`}
    >
      {/* Studio Stage Overhead Spotlights */}
      <div className="absolute top-0 inset-x-0 flex justify-around pointer-events-none opacity-40">
        <div className="w-24 h-40 bg-gradient-to-b from-amber-400/30 via-yellow-300/10 to-transparent blur-xl" />
        <div className="w-24 h-40 bg-gradient-to-b from-rose-500/30 via-pink-300/10 to-transparent blur-xl" />
        <div className="w-24 h-40 bg-gradient-to-b from-cyan-400/30 via-blue-300/10 to-transparent blur-xl" />
      </div>

      {/* Top Header & Mode Toggle */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow">
            🔔
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>Game Show Buzzer Podium</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Voice Announcer
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Slap the buzzer to have the TV host loudly announce who owes the prize!
            </p>
          </div>
        </div>

        {/* Mode & Voice Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setPodiumMode('COUPLE');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                podiumMode === 'COUPLE'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👫 Couple Podium
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setPodiumMode('SOLO');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                podiumMode === 'SOLO'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎙️ Solo Host
            </button>
          </div>

          {isSpeaking && (
            <button
              type="button"
              onClick={handleStopVoice}
              className="py-1 px-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3 h-3" />
              <span>Stop Voice</span>
            </button>
          )}
        </div>
      </div>

      {/* Announcer Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border-2 border-amber-400 shadow-xl max-w-xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">
              <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>🎙️ LIVE STUDIO VERDICT ANNOUNCEMENT 🎙️</span>
              <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
              &ldquo;{speechText}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 3D GAME SHOW PODIUM & COUPLE SCENE */}
      {/* ============================================================== */}
      <div className="relative my-4 flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2">
        {/* PARTNER 1 (Left Character) */}
        {podiumMode === 'COUPLE' && (
          <motion.div
            animate={{
              y: isBuzzerPressed && activeBuzzerPartner === 1 ? [0, -8, 2, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center z-10 w-28 sm:w-36 text-center"
          >
            {/* Animated Character Avatar */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 border-4 border-amber-200 shadow-xl flex items-center justify-center text-3xl sm:text-4xl">
                {partner1Avatar || '👑'}
              </div>
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-slate-900 border border-amber-400 text-[9px] font-black uppercase text-amber-300">
                P1
              </span>
            </div>

            {/* Name Badge */}
            <div className="bg-slate-900/90 px-2.5 py-1 rounded-xl border border-amber-400/40 shadow-sm max-w-full">
              <span className="text-xs font-black text-white truncate block">
                {partner1Name}
              </span>
              <span className="text-[9px] text-amber-300/80 font-mono block">
                Contestant 1
              </span>
            </div>

            {/* Hand slap trigger button */}
            <button
              type="button"
              onClick={() => handleTriggerBuzzer(1)}
              className="mt-2 py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider transition-transform active:scale-90 cursor-pointer"
            >
              🖐️ Slap Buzzer
            </button>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* CENTRAL PODIUM WITH BIG GLOWING RED/GOLD DOME BUZZER */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center z-20 mx-1 sm:mx-2">
          {/* Studio Gooseneck Microphone */}
          <div className="flex flex-col items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-slate-400 border border-slate-300 shadow flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="w-1 h-7 bg-slate-600 rounded-full" />
          </div>

          {/* THE BIG INTERACTIVE GAME SHOW BUZZER */}
          <div className="relative group cursor-pointer" onClick={() => handleTriggerBuzzer(1)}>
            {/* Buzzer Light Halo Effect */}
            <motion.div
              animate={{
                scale: isBuzzerPressed ? [1, 1.8, 2.4] : [1, 1.15, 1],
                opacity: isBuzzerPressed ? [1, 0.6, 0] : [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: isBuzzerPressed ? 0.4 : 2,
                repeat: isBuzzerPressed ? 0 : Infinity,
              }}
              className="absolute inset-0 -m-3 rounded-full bg-rose-500/40 blur-md pointer-events-none"
            />

            {/* Chrome Podium Mount Base Ring */}
            <div className="w-24 h-10 sm:w-28 sm:h-12 rounded-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 p-1 shadow-2xl border border-slate-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                {/* 3D Red Dome Buzzer Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9, y: 4 }}
                  animate={{
                    y: isBuzzerPressed ? 4 : 0,
                    boxShadow: isBuzzerPressed
                      ? '0 2px 5px rgba(225, 29, 72, 0.9)'
                      : '0 8px 25px rgba(225, 29, 72, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
                  }}
                  className="w-18 h-18 sm:w-20 sm:h-20 -mt-6 rounded-full bg-gradient-to-b from-rose-500 via-rose-600 to-red-800 border-4 border-rose-300 flex items-center justify-center cursor-pointer transition-transform shadow-2xl relative"
                  title="Slap the buzzer to announce the prize verdict!"
                >
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 fill-yellow-300 text-yellow-200 drop-shadow" />
                  <span className="sr-only">Buzz in</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Podiums Digital Scoreboard & Metallic Stand */}
          <div className="w-32 sm:w-44 mt-2 p-2.5 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-2xl text-center">
            {/* LED Status Display */}
            <div className="bg-black/80 px-2 py-1 rounded-lg border border-amber-400/40 mb-1">
              <span className="font-mono font-black text-[10px] sm:text-xs text-amber-300 tracking-wider flex items-center justify-center gap-1 animate-pulse">
                <span>VERDICT:</span>
                <span className="truncate max-w-[120px]">{prizeTitle}</span>
              </span>
            </div>

            {/* Neon Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 rounded-full" />
            <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 block">
              FEUD VERDICT PODIUM
            </span>
          </div>
        </div>

        {/* PARTNER 2 (Right Character) */}
        {podiumMode === 'COUPLE' ? (
          <motion.div
            animate={{
              y: isBuzzerPressed && activeBuzzerPartner === 2 ? [0, -8, 2, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center z-10 w-28 sm:w-36 text-center"
          >
            {/* Animated Character Avatar */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-700 border-4 border-rose-200 shadow-xl flex items-center justify-center text-3xl sm:text-4xl">
                {partner2Avatar || '💖'}
              </div>
              <span className="absolute -bottom-2 -left-1 px-1.5 py-0.5 rounded-full bg-slate-900 border border-rose-400 text-[9px] font-black uppercase text-rose-300">
                P2
              </span>
            </div>

            {/* Name Badge */}
            <div className="bg-slate-900/90 px-2.5 py-1 rounded-xl border border-rose-400/40 shadow-sm max-w-full">
              <span className="text-xs font-black text-white truncate block">
                {partner2Name}
              </span>
              <span className="text-[9px] text-rose-300/80 font-mono block">
                Contestant 2
              </span>
            </div>

            {/* Hand slap trigger button */}
            <button
              type="button"
              onClick={() => handleTriggerBuzzer(2)}
              className="mt-2 py-1 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-400/40 text-[10px] font-black uppercase tracking-wider transition-transform active:scale-90 cursor-pointer"
            >
              🖐️ Slap Buzzer
            </button>
          </motion.div>
        ) : (
          /* SOLO HOST AVATAR */
          <div className="flex flex-col items-center z-10 w-28 sm:w-36 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-slate-900 border-4 border-purple-300 shadow-xl flex items-center justify-center text-3xl sm:text-4xl mb-2">
              🎩
            </div>
            <div className="bg-slate-900/90 px-2.5 py-1 rounded-xl border border-purple-400/40 shadow-sm">
              <span className="text-xs font-black text-white block">Game Show Host</span>
              <span className="text-[9px] text-purple-300 font-mono block">Official Arbiter</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleTriggerBuzzer(1)}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 fill-current" />
          <span>📢 Announce Prize With Voice (Slap Buzzer!)</span>
        </button>

        <span className="text-[11px] text-slate-400">
          Owed: <strong className="text-amber-300">{partner1Name}</strong> owes{' '}
          <strong className="text-rose-300">{partner2Name}</strong>
        </span>
      </div>
    </div>
  );
};

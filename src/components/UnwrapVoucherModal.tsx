import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Printer,
  Share2,
  RotateCcw,
  Heart,
  CheckCircle2,
  Gift,
  Award,
  Scissors,
  Check,
  Copy,
  Mic,
} from 'lucide-react';
import QRCode from 'qrcode';
import { sounds } from '../utils/audio';
import { DateNightAudioPlayer } from './DateNightAudioPlayer';
import { dateNightAudio } from '../utils/dateNightVibeAudio';

export interface UnwrappedVoucherData {
  title: string;
  subtitle?: string;
  emoji: string;
  code: string;
  sender: string;
  recipient: string;
  cost?: number;
  pledge: string;
  finePrint?: string;
  voucherType?: string;
}

interface UnwrapVoucherModalProps {
  isOpen: boolean;
  voucher: UnwrappedVoucherData | null;
  onClose: () => void;
  onPrint?: () => void;
}

interface FallingPetal {
  id: number;
  emoji: string;
  startX: number;
  swayX: number;
  size: number;
  duration: number;
  delay: number;
  rotateStart: number;
  rotateEnd: number;
  opacity: number;
}

const PETAL_EMOJIS = ['🌹', '🌸', '🌹', '💕', '✨', '🌷', '🌸', '🌹', '💖'];

export const UnwrapVoucherModal: React.FC<UnwrapVoucherModalProps> = ({
  isOpen,
  voucher,
  onClose,
  onPrint,
}) => {
  // 'WRAPPED' | 'UNWRAPPING' | 'UNWRAPPED'
  const [unwrapState, setUnwrapState] = useState<'WRAPPED' | 'UNWRAPPING' | 'UNWRAPPED'>('WRAPPED');
  const [showRoseShower, setShowRoseShower] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Reset state when opening a new voucher
  useEffect(() => {
    if (isOpen) {
      setUnwrapState('WRAPPED');
      setShowRoseShower(false);
      setIsCopied(false);
    }
  }, [isOpen, voucher?.code]);

  // Generate QR code for verification
  useEffect(() => {
    if (!voucher || !isOpen) return;
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?rf_voucher=1&vcode=${voucher.code}&to=${encodeURIComponent(
            voucher.recipient
          )}`
        : '';
    if (url) {
      QRCode.toDataURL(url, {
        width: 140,
        margin: 1,
        color: { dark: '#030712', light: '#ffffff' },
      })
        .then((u) => setQrCodeUrl(u))
        .catch(() => {});
    }
  }, [voucher, isOpen]);

  // Petals for the digital rose shower
  const petals = useMemo<FallingPetal[]>(() => {
    if (!showRoseShower) return [];
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      emoji: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
      startX: Math.random() * 94 + 3,
      swayX: (Math.random() - 0.5) * 160,
      size: i % 3 === 0 ? 30 : 20 + Math.random() * 10,
      duration: 3.5 + Math.random() * 2.2,
      delay: Math.random() * 1.5,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720 - 360,
      opacity: 0.85 + Math.random() * 0.15,
    }));
  }, [showRoseShower]);

  if (!isOpen || !voucher) return null;

  const isRoses =
    voucher.voucherType?.includes('rose') ||
    voucher.title.toLowerCase().includes('rose') ||
    voucher.emoji === '🌹';

  // Trigger the 3D-like fold-out animation with sounds & rose shower
  const handleUnwrap = () => {
    if (unwrapState !== 'WRAPPED') return;

    // 1. Play unwrap ribbon rustle & celestial harp glissando
    sounds.playGiftUnwrap();
    setUnwrapState('UNWRAPPING');

    // Trigger chosen Date Night Vibe mood music if auto-play is enabled
    if (dateNightAudio.getState().autoPlayOnUnwrap) {
      dateNightAudio.play();
    }

    // 2. Play rose shower arpeggio and start the petal cascade
    setTimeout(() => {
      sounds.playRoseShower();
      setShowRoseShower(true);
      setUnwrapState('UNWRAPPED');

      // Automatically announce the prize with the energetic TV game show host voice!
      setTimeout(() => {
        sounds.speakPrizeVerdict({
          sender: voucher.sender,
          recipient: voucher.recipient,
          prizeTitle: voucher.title,
          voucherType: voucher.voucherType,
          pledge: voucher.pledge,
        });
      }, 750);
    }, 450);
  };

  const handleRewrap = () => {
    sounds.playTick();
    setUnwrapState('WRAPPED');
    setShowRoseShower(false);
  };

  const handleShowerRosesAgain = () => {
    sounds.playRoseShower();
    setShowRoseShower(false);
    setTimeout(() => setShowRoseShower(true), 50);
  };

  const handleCopyCode = async () => {
    sounds.playTick();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `🎁 ${voucher.title} Voucher Code: ${voucher.code}\nFrom: ${voucher.sender} To: ${voucher.recipient}\n"${voucher.pledge}"`
        );
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden select-none">
      {/* ============================================================== */}
      {/* SHOWER OF DIGITAL ROSE PETALS */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showRoseShower && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {petals.map((p) => (
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
                  y: '108vh',
                  rotate: p.rotateEnd,
                  scale: [0.6, 1.15, 1],
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
                      ? 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.75))'
                      : 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.5))',
                }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Date Night Vibe Pill Player */}
      <div className="absolute top-4 left-4 z-50 max-w-[calc(100vw-80px)]">
        <DateNightAudioPlayer variant="floating-pill" />
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer shadow-lg"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main 3D Perspective Stage Container */}
      <div
        className="relative w-full max-w-lg sm:max-w-xl mx-auto flex flex-col items-center justify-center z-30"
        style={{ perspective: 1200 }}
      >
        {/* ============================================================ */}
        {/* STAGE 1: THE WRAPPED LUXURY GIFT PARCEL */}
        {/* ============================================================ */}
        {unwrapState === 'WRAPPED' && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={handleUnwrap}
            className="w-full cursor-pointer group"
          >
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-950 to-rose-950/90 border-4 border-amber-400/80 shadow-2xl shadow-amber-500/25 overflow-hidden text-center transition-all duration-300 group-hover:scale-[1.02] group-hover:border-amber-300">
              {/* Background ambient glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

              {/* Wrapped Satin Ribbons Cross Pattern */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-90 shadow-lg border-y border-yellow-200/50 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-amber-500 via-yellow-400 to-amber-500 opacity-90 shadow-lg border-x border-yellow-200/50 pointer-events-none" />

              {/* Gift Parcel Header Badge */}
              <div className="relative z-10 flex items-center justify-between text-xs mb-4">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow">
                  🎁 Sealed Gift Parcel
                </span>
                <span className="font-mono text-xs text-amber-200/80 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                  {voucher.code}
                </span>
              </div>

              {/* Central Golden Wax Seal Button */}
              <div className="relative z-10 my-6 py-4 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      '0 0 20px rgba(245, 158, 11, 0.4)',
                      '0 0 35px rgba(245, 158, 11, 0.8)',
                      '0 0 20px rgba(245, 158, 11, 0.4)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-4 border-yellow-200 shadow-2xl flex items-center justify-center text-3xl cursor-pointer"
                >
                  <span className="drop-shadow-md">{voucher.emoji || '🎁'}</span>
                </motion.div>

                {/* Shimmering pulse pill */}
                <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Click to Unwrap Voucher</span>
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                </div>
              </div>

              {/* Gift Tag Info */}
              <div className="relative z-10 bg-slate-950/80 p-3.5 rounded-2xl border border-amber-400/40 text-left space-y-1 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Presented To:
                  </span>
                  <strong className="text-white font-extrabold">{voucher.recipient}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Pledged With Love By:
                  </span>
                  <strong className="text-amber-300 font-extrabold">{voucher.sender}</strong>
                </div>
                <div className="pt-1.5 border-t border-slate-800 text-center">
                  <span className="text-xs font-bold text-amber-200 truncate block">
                    ✨ {voucher.title}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-4 text-[11px] text-slate-400 italic">
                &ldquo;Tap the seal above to trigger the 3D fold-out unwrap &amp; rose shower!&rdquo;
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2 & 3: 3D FOLD-OUT ANIMATION & UNWRAPPED VOUCHER */}
        {/* ============================================================ */}
        {(unwrapState === 'UNWRAPPING' || unwrapState === 'UNWRAPPED') && (
          <motion.div
            initial={{
              rotateX: 85,
              scale: 0.6,
              opacity: 0,
              y: 50,
            }}
            animate={{
              rotateX: 0,
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            transition={{
              type: 'spring',
              damping: 18,
              stiffness: 140,
              mass: 1.1,
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="w-full relative"
          >
            {/* Cut line decoration */}
            <div className="flex items-center justify-between text-[10px] text-amber-300/70 font-mono mb-1.5 px-2 select-none">
              <span>✂️ - - - - - - - - - -</span>
              <span className="font-bold uppercase tracking-wider">
                OFFICIAL UNWRAPPED GIFT CERTIFICATE
              </span>
              <span>- - - - - - - - - - ✂️</span>
            </div>

            {/* The 3D Unfolded Certificate Container */}
            <div
              className={`p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl border-4 backdrop-blur-md transition-all ${
                isRoses
                  ? 'bg-gradient-to-b from-rose-950/95 via-slate-950 to-pink-950/90 border-rose-400 text-rose-50 shadow-rose-500/25'
                  : 'bg-gradient-to-b from-amber-950/95 via-slate-950 to-yellow-950/90 border-amber-400 text-amber-50 shadow-amber-500/25'
              }`}
            >
              {/* Metallic Foil Reflection Highlight Sweep */}
              <motion.div
                initial={{ x: '-150%', opacity: 0.7 }}
                animate={{ x: '200%', opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                className="absolute inset-0 w-1/2 -skew-x-25 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
              />

              {/* Certificate Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/20 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                      isRoses
                        ? 'bg-rose-500 text-white border-rose-300'
                        : 'bg-amber-400 text-slate-950 border-amber-300'
                    }`}
                  >
                    ★ Date Night Truce Pact ★
                  </span>
                  <span className="font-mono text-xs opacity-75">Resolution Feud</span>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm bg-black/50 px-2.5 py-1 rounded-lg border border-white/15">
                  {voucher.code}
                </span>
              </div>

              {/* Main Title & Emoji */}
              <div className="my-4 text-left">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 ${
                      isRoses
                        ? 'bg-rose-600/30 border-rose-400 text-white'
                        : 'bg-amber-500/30 border-amber-400 text-amber-300'
                    }`}
                  >
                    {voucher.emoji}
                  </div>
                  <div>
                    <h3
                      className={`text-lg sm:text-2xl font-black leading-tight ${
                        isRoses ? 'text-rose-200' : 'text-amber-300'
                      }`}
                    >
                      {voucher.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {voucher.subtitle || 'Official Redeemable Relationship Experience'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient & Issuer Credentials */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-black/45 border border-white/15 text-left mb-3.5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    Presented To (Bearer):
                  </span>
                  <strong className="text-white text-xs sm:text-sm truncate block font-black">
                    {voucher.recipient}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    Pledged By (Issuer):
                  </span>
                  <strong
                    className={`text-xs sm:text-sm truncate block font-black ${
                      isRoses ? 'text-rose-300' : 'text-amber-300'
                    }`}
                  >
                    {voucher.sender}
                  </strong>
                </div>
              </div>

              {/* Custom Romantic / Fun Pledge Accordion Block */}
              <div className="text-left mb-3.5">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1 tracking-wider">
                  Solemn Pledge &amp; Experience Terms:
                </span>
                <p className="text-xs sm:text-sm leading-relaxed italic bg-black/35 p-3 rounded-xl border border-white/15 text-slate-100 shadow-inner">
                  &ldquo;{voucher.pledge}&rdquo;
                </p>
              </div>

              {/* Fine Print & QR Code Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/20 text-[10px] text-left">
                <div className="max-w-[72%]">
                  <div className="opacity-90 font-medium leading-tight">
                    ⚖️ {voucher.finePrint || 'Disputes settled in full. Valid anytime with a smile.'}
                  </div>
                  <div className="font-mono opacity-70 text-[9px] mt-1 text-amber-200">
                    Serial: {voucher.code} • Guaranteed by Resolution Feud Studio
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="p-1.5 rounded-xl bg-white shadow-md shrink-0">
                    <img src={qrCodeUrl} alt="Voucher QR Code" className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar Beneath Unfolded Voucher */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShowerRosesAgain}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 cursor-pointer transition-transform active:scale-95"
                  title="Drop another shower of digital roses"
                >
                  <span>🌹 Shower Roses</span>
                </button>

                <button
                  type="button"
                  onClick={handleRewrap}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Wrap voucher back up to experience the 3D fold-out again"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-wrap Gift</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.speakPrizeVerdict({
                      sender: voucher.sender,
                      recipient: voucher.recipient,
                      prizeTitle: voucher.title,
                      voucherType: voucher.voucherType,
                      pledge: voucher.pledge,
                    });
                  }}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
                  title="Speak prize verdict aloud with the game show announcer voice"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>📢 Announce Prize</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    if (onPrint) {
                      onPrint();
                    } else if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/25 cursor-pointer transition-transform active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

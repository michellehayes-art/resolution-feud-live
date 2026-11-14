import React, { useState } from 'react';
import { Team } from '../types/game';
import { sounds } from '../utils/audio';
import {
  Sparkles,
  Heart,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  X,
  Flame,
  Utensils,
  Coffee,
  Smile,
  QrCode,
  Download,
} from 'lucide-react';

export interface VibeCheckRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: [Team, Team];
  fastMoneyScore?: number;
  mode?: string;
  onTriggerRoseDrop?: (sender: string, recipient: string, message: string) => void;
}

interface RelationshipReward {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: 'Romantic' | 'Tasty' | 'Pampering' | 'Fun';
  badgeColor: string;
  borderColor: string;
  gradient: string;
  pledge: string;
  finePrint: string;
}

const REWARDS_CATALOG: RelationshipReward[] = [
  {
    id: 'roses-perfume',
    title: 'A Dozen Roses & Fragrant Perfume',
    subtitle: 'The Classic Romantic Truce',
    emoji: '🌹',
    category: 'Romantic',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    gradient: 'from-rose-950/80 via-pink-950/60 to-rose-950/80',
    pledge:
      'The bearer is officially awarded one dozen fresh long-stem roses and a delightful bottle of their favorite perfume. Delivered with a dramatic royal bow!',
    finePrint: 'Redeemable anytime. Complaints, grumbling, or eye rolls strictly forbidden by game rules.',
  },
  {
    id: 'dinner-on-me',
    title: 'Dinner On Me (Winner’s Choice!)',
    subtitle: 'Gourmet Dispute Settlement',
    emoji: '🍝',
    category: 'Tasty',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    gradient: 'from-amber-950/80 via-yellow-950/60 to-slate-950',
    pledge:
      'One all-inclusive magnificent dinner date at the restaurant of the bearer’s choice. Appetizers, entrees, cocktails, and decadent desserts fully covered!',
    finePrint: 'Winner selects the cuisine, music playlist on the drive, and reserves full dessert rights.',
  },
  {
    id: 'back-massage',
    title: '15-Minute Deluxe Back Massage',
    subtitle: 'Candlelit Tension Release',
    emoji: '💆',
    category: 'Pampering',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
    gradient: 'from-emerald-950/80 via-teal-950/60 to-slate-950',
    pledge:
      '15 minutes of uninterrupted shoulder, neck, and back pampering with soothing essential oils, relaxing spa lo-fi music, and zero phone distractions.',
    finePrint: 'Strict minimum of 15 full minutes. Timer must be visible. Deep sighs of relief encouraged.',
  },
  {
    id: 'lunch-date-invite',
    title: 'Official Lunch Date Invitation',
    subtitle: 'Midday Sweet Truce',
    emoji: '🍱',
    category: 'Tasty',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/50 hover:border-blue-400',
    gradient: 'from-blue-950/80 via-indigo-950/60 to-slate-950',
    pledge:
      'A formal peace pact: You are cordially invited out for sushi, artisan burgers, or tacos this week to celebrate laughing off our differences!',
    finePrint: 'Valid during any standard lunch hour. Both parties agree to talk exclusively about fun dreams.',
  },
  {
    id: 'breakfast-in-bed',
    title: 'Breakfast in Bed & Royal Coffee Pass',
    subtitle: 'Weekend Morning Indulgence',
    emoji: '☕',
    category: 'Pampering',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    borderColor: 'border-orange-500/50 hover:border-orange-400',
    gradient: 'from-orange-950/80 via-amber-950/60 to-slate-950',
    pledge:
      'Golden pancakes or avocado toast, fresh berries, and steaming custom coffee served directly to your bedside pillow on a lazy weekend morning.',
    finePrint: 'Recipient gets to sleep in as long as desired without disruption or chore requests.',
  },
  {
    id: 'midnight-ice-cream',
    title: 'Midnight Pajama Ice Cream Run',
    subtitle: 'Comfort Food Truce',
    emoji: '🍨',
    category: 'Fun',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    gradient: 'from-purple-950/80 via-fuchsia-950/60 to-slate-950',
    pledge:
      'A spontaneous late-night drive in oversized sweatpants to pick up waffle cones or pints. Winner gets first choice of flavors and extra fudge toppings!',
    finePrint: 'Car singing permitted and highly encouraged. Zero counting of calories allowed.',
  },
];

export const VibeCheckRewardsModal: React.FC<VibeCheckRewardsModalProps> = ({
  isOpen,
  onClose,
  teams,
  fastMoneyScore = 0,
  mode = 'COUPLES',
  onTriggerRoseDrop,
}) => {
  const [selectedReward, setSelectedReward] = useState<RelationshipReward | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const winner = teams[0].score >= teams[1].score ? teams[0] : teams[1];
  const runnerUp = teams[0].score >= teams[1].score ? teams[1] : teams[0];
  const isTie = teams[0].score === teams[1].score;
  const totalPoints = teams[0].score + teams[1].score + fastMoneyScore;

  // Calculate dynamic Harmony Score (88% - 100%)
  const scoreDiff = Math.abs(teams[0].score - teams[1].score);
  const closenessBonus = Math.max(0, 15 - Math.floor(scoreDiff / 15));
  const pointsBonus = Math.min(25, Math.floor(totalPoints / 16));
  const rawHarmony = 72 + closenessBonus + pointsBonus;
  const harmonyScore = Math.min(100, Math.max(88, rawHarmony));

  let vibeTitle = 'Cosmic Soulmates 🌌';
  let vibeDescription = 'Incredible mutual empathy! You listen actively and know how to find common ground with humor.';
  if (harmonyScore >= 98) {
    vibeTitle = 'Supreme Peacemakers 🕊️';
    vibeDescription = 'Gold standard communication! Arguments dissolve into laughter, compromises, and delicious dates.';
  } else if (harmonyScore >= 93) {
    vibeTitle = 'Golden Chemistry ✨';
    vibeDescription = 'Playful, responsive, and quick to de-escalate. Both partners bring huge heart to the table!';
  } else {
    vibeTitle = 'Passionate Diplomats 🔥';
    vibeDescription = 'Spirited debate with deep underlying affection. The best make-up energy in the game show!';
  }

  const handleCopyVoucherText = (reward: RelationshipReward) => {
    const text = `✨ OFFICIAL RESOLUTION FEUD RELATIONSHIP VOUCHER ✨
🏆 Awarded To: ${winner.name}
💌 Issued By: ${runnerUp.name}
🎁 Reward: ${reward.emoji} ${reward.title}
📜 Terms: ${reward.pledge}
🌟 Harmony Vibe Score: ${harmonyScore}% (${vibeTitle})
⚖️ Game Show Verdict: All arguments settled in full!`;

    navigator.clipboard.writeText(text);
    sounds.playDing(1);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareVoucher = async (reward: RelationshipReward) => {
    sounds.playTick();
    const shareData = {
      title: `Resolution Feud Truce Voucher: ${reward.title}`,
      text: `✨ I lost in Resolution Feud, so I officially owe ${winner.name} a ${reward.title}! 💖 Harmony Score: ${harmonyScore}%`,
      url: typeof window !== 'undefined' ? window.location.origin : '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyVoucherText(reward);
      }
    } else {
      handleCopyVoucherText(reward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-4 border-amber-500/70 shadow-2xl p-5 sm:p-7 text-left z-10 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Rewards"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Vibe Check & Harmony Score */}
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              Post-Match Relationship Vibe Check
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>Harmony Score:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-pink-400 font-mono">
                  {harmonyScore}%
                </span>
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{vibeTitle}</span>
              </div>
            </div>

            {/* Quick Rose Action */}
            {onTriggerRoseDrop && (
              <button
                type="button"
                onClick={() => {
                  onTriggerRoseDrop(
                    runnerUp.name,
                    winner.name,
                    `Sent with love by ${runnerUp.name}! Truce locked in: dinner & sweet treats on the way!`
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-500/30 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
                title="Shower the screen with falling roses & petals"
              >
                <span>🌹 Send Virtual Roses</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {vibeDescription} Celebrate your match by unlocking and gifting an official, shareable
            relationship reward voucher below!
          </p>
        </div>

        {/* Reward Voucher Cards Grid */}
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Unlockable Relationship Truce Vouchers (Tap to Preview &amp; Share):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {REWARDS_CATALOG.map((reward) => (
              <div
                key={reward.id}
                onClick={() => {
                  sounds.playTick();
                  setSelectedReward(reward);
                }}
                className={`p-3 rounded-2xl border bg-gradient-to-br ${reward.gradient} ${reward.borderColor} transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{reward.emoji}</span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${reward.badgeColor}`}
                    >
                      {reward.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{reward.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{reward.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <span>View Voucher</span>
                    <span>→</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">Ready to Redeem</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Reward Coupon Preview Modal / Overlay */}
        {selectedReward && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-amber-400 p-5 sm:p-7 shadow-2xl text-center">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Voucher"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Ornamental Coupon Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-dashed border-amber-400/80 shadow-inner text-left relative overflow-hidden">
                <div className="absolute top-2 right-2 text-3xl opacity-20 pointer-events-none select-none">
                  {selectedReward.emoji}
                </div>

                {/* Top Voucher Badge */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{selectedReward.emoji}</span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Official Resolution Feud Voucher
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/80 uppercase font-bold">
                    SERIES: RF-LOVE-2026
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white">{selectedReward.title}</h3>
                <p className="text-xs text-amber-300 font-semibold mb-3">
                  Awarded to: <strong className="text-white underline">{winner.name}</strong> · Issued
                  by: <span className="text-slate-300">{runnerUp.name}</span>
                </p>

                {/* Pledge Box */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed italic mb-3">
                  &ldquo;{selectedReward.pledge}&rdquo;
                </div>

                {/* Fine print & Stamp */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="max-w-[70%]">
                    <span>{selectedReward.finePrint}</span>
                  </div>
                  <div className="text-right font-mono font-bold text-amber-400">
                    <div>100% VALID</div>
                    <div className="text-[9px] text-emerald-400">NO EXPIRATION</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyVoucherText(selectedReward)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Voucher Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareVoucher(selectedReward)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send via WhatsApp / SMS</span>
                </button>

                {onTriggerRoseDrop && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReward(null);
                      onTriggerRoseDrop(
                        runnerUp.name,
                        winner.name,
                        `A dozen roses for ${winner.name}! Redeeming: ${selectedReward.title}`
                      );
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    title="Shower screen with roses"
                  >
                    <span>🌹 Drop Roses</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

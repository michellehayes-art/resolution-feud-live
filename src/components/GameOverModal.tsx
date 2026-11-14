import React, { useEffect, useState, useMemo } from 'react';
import { Team } from '../types/game';
import {
  Trophy,
  Heart,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Share2,
  Zap,
  Flame,
  Bot,
  Users,
  Award,
  Crown,
  Swords,
  Gift,
  QrCode,
  Utensils,
  Smartphone,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { TeamAvatarBadge } from './TeamAvatarBadge';
import { GameOverConfetti } from './GameOverConfetti';
import { ShareResultsModal } from './ShareResultsModal';
import { RosePetalDrop } from './RosePetalDrop';
import { VibeCheckRewardsModal } from './VibeCheckRewardsModal';
import { VoucherShareModal } from './VoucherShareModal';
import { HarmonyBurst } from './HarmonyBurst';
import {
  REDEEMABLE_REWARDS,
  RewardItem,
  PurchasedVoucher,
  getAccruedHarmonyPointsBalance,
  spendHarmonyPoints,
  savePurchasedVoucher,
  generateVoucherCode,
} from '../utils/rewardsStorage';
import {
  getTopFastMoneyByMode,
  recordFastMoneyScore,
  FastMoneyLeaderboardEntry,
} from '../utils/fastMoneyStorage';

interface GameOverModalProps {
  teams: [Team, Team];
  fastMoneyScore?: number;
  onPlayAgain: () => void;
  mode?: string;
  incomingChallenge?: {
    challengerName: string;
    targetScore: number;
    banterMessage?: string;
  } | null;
  kickbackAwarded?: number;
  onOpenInviteFrenemy?: () => void;
}

const MODES = [
  { id: 'COUPLES', label: 'Couples', icon: Heart, color: 'text-pink-400' },
  { id: 'ROMANCE', label: 'Romance', icon: Flame, color: 'text-rose-400' },
  { id: 'SOLO_BOT', label: 'Solo Bot', icon: Bot, color: 'text-cyan-400' },
  { id: 'PARTY', label: 'Party', icon: Users, color: 'text-amber-400' },
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  teams,
  fastMoneyScore = 0,
  onPlayAgain,
  mode = 'COUPLES',
  incomingChallenge,
  kickbackAwarded = 0,
  onOpenInviteFrenemy,
}) => {
  const [confettiTriggerKey, setConfettiTriggerKey] = useState(0);
  const [isConfettiActive, setIsConfettiActive] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRoseDropActive, setIsRoseDropActive] = useState(false);
  const [isVibeCheckOpen, setIsVibeCheckOpen] = useState(false);
  const [roseDropSender, setRoseDropSender] = useState('');
  const [roseDropRecipient, setRoseDropRecipient] = useState('');
  const [roseDropMessage, setRoseDropMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>(() => (mode || 'COUPLES').toUpperCase());
  const [leaderboard, setLeaderboard] = useState<FastMoneyLeaderboardEntry[]>([]);
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);

  const winner = teams[0].score >= teams[1].score ? teams[0] : teams[1];
  const runnerUp = teams[0].score >= teams[1].score ? teams[1] : teams[0];
  const isTie = teams[0].score === teams[1].score;
  const totalPoints = teams[0].score + teams[1].score + fastMoneyScore;

  // Harmony Rewards Wallet & Redemption State
  const [availableHarmonyPoints, setAvailableHarmonyPoints] = useState<number>(() =>
    getAccruedHarmonyPointsBalance(totalPoints)
  );
  const [selectedVoucherForShare, setSelectedVoucherForShare] = useState<PurchasedVoucher | null>(null);
  const [isVoucherShareOpen, setIsVoucherShareOpen] = useState(false);
  const [redeemedToast, setRedeemedToast] = useState<string | null>(null);

  // Harmony Burst Particle Celebration State
  const [isHarmonyBurstActive, setIsHarmonyBurstActive] = useState(false);
  const [burstVoucherType, setBurstVoucherType] = useState('dinner-on-me');
  const [burstVoucherTitle, setBurstVoucherTitle] = useState('');

  const handleTriggerRoses = () => {
    setRoseDropSender(runnerUp.name);
    setRoseDropRecipient(winner.name);
    setRoseDropMessage(
      `Sent with affection from ${runnerUp.name}! Truce locked in: dinner & sweet treats on the way!`
    );
    setIsRoseDropActive(true);
  };

  const handlePurchaseAndShareVoucher = (reward: RewardItem) => {
    if (availableHarmonyPoints < reward.cost) {
      sounds.playStrike();
      alert(`You need ${reward.cost - availableHarmonyPoints} more Harmony Points to redeem ${reward.title}!`);
      return;
    }

    // Deduct points from wallet balance
    spendHarmonyPoints(reward.cost);
    setAvailableHarmonyPoints((prev) => Math.max(0, prev - reward.cost));

    const prefix =
      reward.voucherType === 'dinner-on-me'
        ? 'DINE'
        : reward.voucherType === 'dozen-roses'
        ? 'ROSE'
        : 'HARM';
    const code = generateVoucherCode(prefix);

    const newVoucher: PurchasedVoucher = {
      id: `vouch-${Date.now()}-${code}`,
      voucherType: reward.voucherType,
      title: reward.title,
      code,
      sender: winner.name,
      recipient: runnerUp.name,
      cost: reward.cost,
      issuedAt: Date.now(),
      pledge: reward.pledge,
      finePrint: reward.finePrint,
      emoji: reward.emoji,
    };

    savePurchasedVoucher(newVoucher);
    setSelectedVoucherForShare(newVoucher);
    setIsVoucherShareOpen(true);
    sounds.playBountyReward();

    // Trigger Harmony Burst celebration particle effect
    setBurstVoucherType(reward.voucherType);
    setBurstVoucherTitle(reward.title);
    setIsHarmonyBurstActive(true);

    if (reward.voucherType === 'dozen-roses') {
      handleTriggerRoses();
    }

    // Announce prize verdict with the booming game show host voice
    setTimeout(() => {
      sounds.speakPrizeVerdict({
        sender: winner.name,
        recipient: runnerUp.name,
        prizeTitle: reward.title,
        voucherType: reward.voucherType,
        pledge: reward.pledge,
      });
    }, 600);

    setRedeemedToast(`🎉 Redeemed ${reward.title}! Ready to send to ${runnerUp.name}!`);
    setTimeout(() => setRedeemedToast(null), 4500);
  };

  // Sound sequence and initial record on mount
  useEffect(() => {
    sounds.playCelebrationSequence();

    // Ensure current match's Fast Money score is recorded if > 0 and not yet recorded
    if (fastMoneyScore > 0 && !hasRecordedCurrent) {
      recordFastMoneyScore({
        mode,
        playerName: winner.name,
        avatar: winner.avatar,
        fastMoneyScore,
        totalMatchScore: totalPoints,
      });
      setHasRecordedCurrent(true);
    }
  }, []);

  // Refresh leaderboard when selectedMode changes
  useEffect(() => {
    const topEntries = getTopFastMoneyByMode(selectedMode, 5);
    setLeaderboard(topEntries);
  }, [selectedMode, hasRecordedCurrent]);

  const handleReplayConfetti = () => {
    setConfettiTriggerKey((prev) => prev + 1);
    setIsConfettiActive(true);
    sounds.playCelebrationSequence();
  };

  const isCurrentMatchInTop5 = useMemo(() => {
    if (fastMoneyScore <= 0 || selectedMode.toUpperCase() !== mode.toUpperCase()) return false;
    return leaderboard.some(
      (entry) =>
        entry.playerName === winner.name &&
        entry.fastMoneyScore === fastMoneyScore &&
        entry.isRecent
    );
  }, [leaderboard, fastMoneyScore, selectedMode, mode, winner.name]);

  let relationshipTitle = 'Empathetic Peacemakers';
  if (totalPoints > 350) relationshipTitle = 'Master De-escalation Diplomats';
  else if (totalPoints > 200) relationshipTitle = 'Certified Communication Champions';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Framer Motion Confetti Animation */}
      <GameOverConfetti
        isActive={isConfettiActive}
        winnerName={winner.name}
        avatarId={winner.avatar}
        triggerKey={confettiTriggerKey}
      />

      <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-4 border-amber-500 shadow-2xl p-5 sm:p-7 text-center z-10 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Trophy Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-xl shadow-amber-500/30 animate-bounce">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Match Complete · Final Results
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 flex items-center justify-center gap-2">
          {!isTie && <TeamAvatarBadge avatarId={winner.avatar} size="md" />}
          <span>{isTie ? "It's a Peaceful Tie!" : `${winner.name} Wins!`}</span>
        </h2>

        <div className="inline-block mt-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-semibold">
          Awarded Title: <strong className="text-amber-300">{relationshipTitle}</strong>
        </div>

        {/* INCOMING FRENEMY CHALLENGE RESULT BANNER */}
        {incomingChallenge && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-violet-950/90 via-fuchsia-950/80 to-violet-950/90 border-2 border-violet-400 text-left shadow-xl shadow-violet-500/20 animate-fadeIn">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500 text-white flex items-center gap-1">
                <Swords className="w-3 h-3" />
                <span>Viral Frenemy Challenge Completed!</span>
              </span>
              <span className="text-xs text-amber-300 font-bold font-mono">
                +{kickbackAwarded || Math.max(50, Math.floor(totalPoints * 0.5) + 50)} Bounty Pts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-violet-100 font-bold">
              You answered the challenge issued by{' '}
              <span className="text-amber-300 font-black">{incomingChallenge.challengerName}</span>!
            </p>
            <p className="text-[11px] text-violet-300/90 mt-0.5">
              Target was {incomingChallenge.targetScore} pts. You scored {totalPoints} total harmony pts, banking{' '}
              <strong className="text-amber-300 font-bold">
                +{kickbackAwarded || Math.max(50, Math.floor(totalPoints * 0.5) + 50)} Harmony Bounty points
              </strong>{' '}
              for {incomingChallenge.challengerName} on the Community Scoreboard!
            </p>
          </div>
        )}

        {/* Final Match Scoreboard */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-5">
          <div
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center ${
              teams[0].id === winner.id && !isTie
                ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <TeamAvatarBadge avatarId={teams[0].avatar} size="md" className="mb-1" />
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold truncate max-w-full">
              {teams[0].name}
            </span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-amber-300 tabular-nums">
              {teams[0].score} pts
            </span>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center ${
              teams[1].id === winner.id && !isTie
                ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <TeamAvatarBadge avatarId={teams[1].avatar} size="md" className="mb-1" />
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold truncate max-w-full">
              {teams[1].name}
            </span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-amber-300 tabular-nums">
              {teams[1].score} pts
            </span>
          </div>
        </div>

        {/* Fast Money Match Bonus Notice */}
        {fastMoneyScore > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-between text-left text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-300">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <p className="font-bold text-amber-300">Fast Money Bonus Earned</p>
                <p className="text-slate-300 text-xs">
                  {fastMoneyScore >= 150
                    ? '🏆 150+ Threshold Achieved! Grand Prize winner!'
                    : '⚡ Great rapid-fire answers banked toward final total.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-lg text-amber-300">+{fastMoneyScore}</span>
              <span className="text-xs text-slate-400 block">pts</span>
            </div>
          </div>
        )}

        {/* ALL-TIME FAST MONEY LEADERBOARD CARD */}
        <div className="mb-6 rounded-xl bg-slate-900/80 border-2 border-amber-500/30 p-4 text-left shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-1.5">
                  <span>Fast Money Hall of Fame</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Top 5 All-Time
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Highest-scoring 40-second final rounds saved in local storage
                </p>
              </div>
            </div>

            {/* If recent match made top 5 */}
            {isCurrentMatchInTop5 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-pulse self-start sm:self-auto">
                <Sparkles className="w-3 h-3" />
                <span>New High Score!</span>
              </span>
            )}
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 mt-3 mb-3 p-1 rounded-lg bg-slate-950 border border-slate-800">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = selectedMode.toUpperCase() === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setSelectedMode(m.id);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={`View top 5 Fast Money scores for ${m.label} mode`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : m.color}`} />
                  <span className="truncate hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Top 5 Leaderboard List */}
          <div className="space-y-1.5">
            {leaderboard.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No Fast Money rounds recorded yet for this mode.
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                const isHighlight =
                  entry.isRecent ||
                  (entry.playerName === winner.name && entry.fastMoneyScore === fastMoneyScore);

                // Rank badge styling
                let rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                );
                if (isFirst) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-sm shadow-amber-400/50">
                      🥇
                    </span>
                  );
                } else if (isSecond) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-black flex items-center justify-center">
                      🥈
                    </span>
                  );
                } else if (isThird) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center">
                      🥉
                    </span>
                  );
                }

                return (
                  <div
                    key={entry.id || `entry-${index}`}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all ${
                      isHighlight
                        ? 'bg-amber-950/40 border-amber-400/80 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                        : isFirst
                        ? 'bg-slate-950/80 border-amber-500/40'
                        : 'bg-slate-950/50 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {rankBadge}
                      <TeamAvatarBadge avatarId={entry.avatar} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isHighlight ? 'text-amber-300' : 'text-slate-100'
                            }`}
                          >
                            {entry.playerName}
                          </span>
                          {isHighlight && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                              You
                            </span>
                          )}
                          {entry.passedThreshold ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              🏆 150+ Won
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              ⚡ Bonus
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {entry.dateStr} · Match Total: {entry.totalMatchScore} pts
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span
                        className={`font-mono font-black text-sm sm:text-base tabular-nums ${
                          isFirst || isHighlight ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {entry.fastMoneyScore}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-sans">pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Golden Rules of Healthy Arguments */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-5">
          <div className="font-bold text-amber-300 uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-400" /> Top 3 Relationship Takeaways:
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>20-Minute Timeout:</strong> Pause physically when heart rate rises to let
              cortisol clear.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Softened Startup:</strong> Use &quot;I feel&quot; statements rather than
              &quot;You always&quot;.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>No &quot;But&quot; in Apologies:</strong> A sincere apology validates feelings
              with zero excuses.
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* EXPANDED: HARMONY REWARDS REDEMPTION SECTION */}
        {/* ============================================================== */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 border-2 border-amber-500/40 text-left shadow-xl relative overflow-hidden">
          {/* Header & Live Balance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-lg shadow-md shadow-amber-500/20 shrink-0">
                🎁
              </div>
              <div>
                <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Harmony Rewards Redemption</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Live Vouchers
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Spend your accrued Harmony Points to purchase &amp; beam digital vouchers to {runnerUp.name}&apos;s device!
                </p>
              </div>
            </div>

            {/* Wallet Balance Chip */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Available Wallet
                </span>
                <span className="font-mono font-black text-sm text-amber-300">
                  {availableHarmonyPoints.toLocaleString()} pts
                </span>
              </div>
            </div>
          </div>

          {/* Success / Notification Banner */}
          {redeemedToast && (
            <div className="my-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{redeemedToast}</span>
            </div>
          )}

          {/* Rewards Grid: Dinner On Me & Dozen Roses Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            {REDEEMABLE_REWARDS.map((reward) => {
              const canAfford = availableHarmonyPoints >= reward.cost;
              const isRoses = reward.voucherType === 'dozen-roses';
              const isDinner = reward.voucherType === 'dinner-on-me';

              return (
                <div
                  key={reward.id}
                  className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isRoses
                      ? 'bg-gradient-to-br from-rose-950/70 via-slate-950 to-pink-950/40 border-rose-500/50 hover:border-rose-400'
                      : isDinner
                      ? 'bg-gradient-to-br from-amber-950/70 via-slate-950 to-yellow-950/40 border-amber-500/50 hover:border-amber-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Voucher Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{reward.emoji}</span>
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm leading-tight">
                            {reward.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block">
                            {reward.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Cost Tag */}
                      <span
                        className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg border shrink-0 ${
                          canAfford
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {reward.cost} pts
                      </span>
                    </div>

                    {/* Pledge Summary */}
                    <p className="text-[11px] text-slate-300 line-clamp-2 my-2 italic bg-black/30 p-2 rounded-lg border border-white/5">
                      &ldquo;{reward.pledge}&rdquo;
                    </p>
                  </div>

                  {/* Purchase & Share Action Button */}
                  <div className="pt-2 border-t border-slate-800/80 mt-1">
                    <button
                      type="button"
                      onClick={() => handlePurchaseAndShareVoucher(reward)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm ${
                        canAfford
                          ? isRoses
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-500/25'
                            : isDinner
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>
                        {canAfford ? 'Redeem & Beam to Opponent' : `Need ${reward.cost - availableHarmonyPoints} more pts`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Shortcuts: Drop Roses & Vibe Check */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={handleTriggerRoses}
              className="text-rose-300 hover:text-rose-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>🌹 Drop Free Roses &amp; Petals</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setIsVibeCheckOpen(true);
              }}
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Vibe Check &amp; Rewards Catalog 💌</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Share Results, Celebrate Again & Play Again */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setIsShareModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/25"
            title="Open custom results share card with social media deep-links"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Results 🚀</span>
          </button>

          <button
            type="button"
            onClick={handleReplayConfetti}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-400/50 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            title="Launch another shower of confetti!"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Celebrate 🎊</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>

        {/* Invite a Frenemy Action in GameOver */}
        {onOpenInviteFrenemy && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                onOpenInviteFrenemy();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-900/60 via-fuchsia-900/50 to-violet-900/60 hover:from-violet-800/80 hover:to-fuchsia-800/80 border border-violet-500/50 text-violet-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Swords className="w-4 h-4 text-violet-400" />
              <span>Challenge a Frenemy to Beat This Score! ⚔️</span>
            </button>
          </div>
        )}

        {/* Custom Sleek Share Results Modal */}
        <ShareResultsModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          teams={teams}
          mode={mode}
          fastMoneyScore={fastMoneyScore}
        />

        {/* Digital Voucher Share Modal (QR Code & Deep Linking) */}
        <VoucherShareModal
          voucher={selectedVoucherForShare}
          isOpen={isVoucherShareOpen}
          onClose={() => setIsVoucherShareOpen(false)}
          onTriggerRoseDrop={handleTriggerRoses}
        />

        {/* Vibe Check & Digital Relationship Rewards Modal */}
        <VibeCheckRewardsModal
          isOpen={isVibeCheckOpen}
          onClose={() => setIsVibeCheckOpen(false)}
          teams={teams}
          mode={mode}
          fastMoneyScore={fastMoneyScore}
          onTriggerRoseDrop={(sender, recipient, message) => {
            setRoseDropSender(sender);
            setRoseDropRecipient(recipient);
            setRoseDropMessage(message);
            setIsRoseDropActive(true);
          }}
        />

        {/* Interactive Full-Screen Rose & Petal Drop Effect */}
        <RosePetalDrop
          isActive={isRoseDropActive}
          onDismiss={() => setIsRoseDropActive(false)}
          senderName={roseDropSender || runnerUp.name}
          recipientName={roseDropRecipient || winner.name}
          customMessage={roseDropMessage}
        />

        {/* Harmony Burst Particle Explosion Celebration */}
        <HarmonyBurst
          isActive={isHarmonyBurstActive}
          voucherType={burstVoucherType}
          voucherTitle={burstVoucherTitle}
          recipientName={runnerUp.name}
          onDismiss={() => setIsHarmonyBurstActive(false)}
        />
      </div>
    </div>
  );
};

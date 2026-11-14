import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Share2,
  Trophy,
  Sparkles,
  Flame,
  Swords,
  QrCode,
  Send,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
  Zap,
  Play,
  RotateCcw,
  Heart,
} from 'lucide-react';
import {
  FrenemyChallenge,
  FRENEMY_BANTER_PRESETS,
  createFrenemyChallenge,
  getFrenemyChallenges,
  getUserChallengerProfile,
  getUserTotalViralPoints,
  buildChallengeUrl,
  getCommunityFrenemyLeaderboard,
  simulateFrenemyMatchCompletion,
  CommunityFrenemyLeader,
} from '../utils/frenemyStorage';
import { sounds } from '../utils/audio';

interface InviteFrenemyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChallengerName?: string;
  defaultAvatar?: string;
  onChallengeAcceptedInLobby?: (challengerName: string) => void;
}

export const InviteFrenemyModal: React.FC<InviteFrenemyModalProps> = ({
  isOpen,
  onClose,
  defaultChallengerName = 'Player 1',
  defaultAvatar = 'crown',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'leaderboard' | 'bounties'>('create');

  // Form State
  const [challengerName, setChallengerName] = useState(defaultChallengerName);
  const [targetScore, setTargetScore] = useState(300);
  const [banterMessage, setBanterMessage] = useState(FRENEMY_BANTER_PRESETS[0]);
  const [gameMode, setGameMode] = useState('COUPLES');

  // Created Challenge State
  const [activeChallenge, setActiveChallenge] = useState<FrenemyChallenge | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Community leaderboard & challenges list
  const [challenges, setChallenges] = useState<FrenemyChallenge[]>([]);
  const [communityLeaders, setCommunityLeaders] = useState<CommunityFrenemyLeader[]>([]);
  const [simulationResult, setSimulationResult] = useState<{
    friendName: string;
    points: number;
  } | null>(null);

  // Sync state on open
  useEffect(() => {
    if (!isOpen) return;

    const savedProfile = getUserChallengerProfile();
    if (savedProfile.name && savedProfile.name !== 'Player 1') {
      setChallengerName(savedProfile.name);
    } else if (defaultChallengerName) {
      setChallengerName(defaultChallengerName);
    }

    const existing = getFrenemyChallenges();
    setChallenges(existing);
    setCommunityLeaders(getCommunityFrenemyLeaderboard());

    if (existing.length > 0 && !activeChallenge) {
      setActiveChallenge(existing[0]);
    }
  }, [isOpen, defaultChallengerName]);

  // Construct current share link
  const currentChallengeUrl = useMemo(() => {
    if (!activeChallenge) return '';
    return buildChallengeUrl(activeChallenge);
  }, [activeChallenge]);

  // Generate QR code when active challenge changes
  useEffect(() => {
    if (!currentChallengeUrl) return;

    QRCode.toDataURL(currentChallengeUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR code gen failed', err));
  }, [currentChallengeUrl]);

  if (!isOpen) return null;

  const totalViralPoints = getUserTotalViralPoints();

  const handleGenerateChallenge = () => {
    sounds.playFrenemyChallenge();
    const newChallenge = createFrenemyChallenge({
      challengerName,
      challengerAvatar: defaultAvatar,
      targetScore,
      banterMessage,
      mode: gameMode,
    });

    setActiveChallenge(newChallenge);
    const updated = getFrenemyChallenges();
    setChallenges(updated);
    setCommunityLeaders(getCommunityFrenemyLeaderboard());

    setToastMessage('🔥 Unique Challenge Link Generated!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    if (!currentChallengeUrl) return;
    sounds.playTick();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentChallengeUrl);
        setIsCopied(true);
        setToastMessage('Challenge Link copied to clipboard! Paste it to your frenemy ⚔️');
        setTimeout(() => {
          setIsCopied(false);
          setToastMessage(null), 3500;
        });
      }
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (!activeChallenge || !currentChallengeUrl) return;
    sounds.playTick();

    const shareData = {
      title: `⚔️ ${activeChallenge.challengerName} challenged you on Resolution Feud!`,
      text: `${activeChallenge.banterMessage}\nTarget Score: ${activeChallenge.targetScore} pts. Can you beat it?`,
      url: currentChallengeUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    if (!activeChallenge || !currentChallengeUrl) return;
    sounds.playTick();
    const text = encodeURIComponent(
      `⚔️ *Frenemy Challenge from ${activeChallenge.challengerName}!* ⚔️\n\n"${activeChallenge.banterMessage}"\n\n🎯 Target Score: *${activeChallenge.targetScore} pts*\n\nPlay here: ${currentChallengeUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareSms = () => {
    if (!activeChallenge || !currentChallengeUrl) return;
    sounds.playTick();
    const text = encodeURIComponent(
      `⚔️ Challenge from ${activeChallenge.challengerName}: "${activeChallenge.banterMessage}" Can you beat my ${activeChallenge.targetScore} pts score? Play: ${currentChallengeUrl}`
    );
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handleSimulateFriendPlay = (challengeId: string) => {
    const res = simulateFrenemyMatchCompletion(challengeId);
    sounds.playBountyReward();
    setSimulationResult({
      friendName: res.friendName,
      points: res.pointsEarnedForUser,
    });
    setChallenges(getFrenemyChallenges());
    setCommunityLeaders(getCommunityFrenemyLeaderboard());

    setToastMessage(`🎉 ${res.friendName} completed your challenge! +${res.pointsEarnedForUser} Harmony Points banked for you!`);
    setTimeout(() => {
      setToastMessage(null);
      setSimulationResult(null);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border-2 border-violet-500/50 shadow-2xl text-left custom-scrollbar">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-5 bg-slate-900/95 backdrop-blur-md border-b border-violet-500/30 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-violet-400/50 flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 shrink-0">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  🔥 Viral Harmony Loop
                </span>
                <span className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{totalViralPoints} Bounty Pts</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                Invite a Frenemy Challenge
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert banner */}
        {toastMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-violet-950/90 border border-violet-400 text-violet-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setActiveTab('create');
              }}
              className={`py-2 px-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 Create Link
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setActiveTab('leaderboard');
              }}
              className={`py-2 px-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTick();
                setActiveTab('bounties');
              }}
              className={`py-2 px-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'bounties'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>My Bounties</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-violet-300">
                {challenges.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Create Challenge Link */}
        {activeTab === 'create' && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Value Proposition Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-950 to-fuchsia-950/60 border border-violet-500/30">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">How the Viral Harmony Bounty Works</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Generate your custom Challenge Link and send it to your partner, rival couple, or best friend. When they accept and play, <strong>50% of the points they earn + a 50 pt welcome kickback</strong> are deposited directly to your Viral Harmony Score!
                  </p>
                </div>
              </div>
            </div>

            {/* Challenger Name & Score Target Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Challenger Name
                </label>
                <input
                  type="text"
                  value={challengerName}
                  onChange={(e) => setChallengerName(e.target.value)}
                  placeholder="e.g., Michelle, Taylor, The Peacemaker..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-violet-400 text-white text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Target Score to Beat</span>
                  <span className="text-violet-300 font-mono font-bold">{targetScore} pts</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[200, 300, 400, 500].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => {
                        sounds.playTick();
                        setTargetScore(score);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        targetScore === score
                          ? 'bg-violet-600 text-white border border-violet-400'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banter Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Spicy Banter Message</span>
              </label>
              <select
                value={banterMessage}
                onChange={(e) => setBanterMessage(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-violet-400 text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                {FRENEMY_BANTER_PRESETS.map((msg, idx) => (
                  <option key={idx} value={msg}>
                    {msg}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div>
              <button
                type="button"
                onClick={handleGenerateChallenge}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>{activeChallenge ? 'Regenerate Challenge Link' : 'Generate Unique Challenge Link'}</span>
              </button>
            </div>

            {/* Active Challenge Link & Sharing Toolbar */}
            {activeChallenge && (
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-violet-500/40 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      Code: {activeChallenge.code}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: <strong className="text-white">{activeChallenge.targetScore} pts</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="flex items-center gap-1 text-xs text-violet-300 hover:text-white font-bold cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {/* Challenge URL Display Box */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={currentChallengeUrl}
                    className="flex-1 bg-transparent border-none text-xs text-slate-300 font-mono focus:outline-none truncate px-1"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Action Share Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 hover:border-violet-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Share Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareSms}
                    className="py-2 px-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>SMS Text</span>
                  </button>
                </div>

                {/* QR Code Container */}
                {showQr && qrCodeUrl && (
                  <div className="p-4 rounded-xl bg-white text-center flex flex-col items-center justify-center animate-fadeIn">
                    <img
                      src={qrCodeUrl}
                      alt="Frenemy Challenge QR Code"
                      className="w-48 h-48 rounded-lg shadow-sm"
                    />
                    <p className="text-slate-900 text-xs font-bold mt-2">
                      Scan with camera to launch Challenge
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">
                      Ref Code: {activeChallenge.code}
                    </span>
                  </div>
                )}

                {/* Instant Simulator Test Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Want to preview the kickback right now?</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateFriendPlay(activeChallenge.id)}
                    className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Simulate Friend Match</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Community Viral Harmony Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/80 via-slate-950 to-fuchsia-950/80 border border-violet-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-300">
                  Your Viral Bounty Stats
                </span>
                <div className="text-white font-black text-lg">
                  {totalViralPoints.toLocaleString()} <span className="text-amber-400 text-xs">Harmony Pts Banked</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Friends Converted
                </span>
                <div className="text-violet-300 font-mono font-bold text-lg">
                  {challenges.reduce((sum, c) => sum + (c.friendsPlayedCount || 0), 0)} Players
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Studio-Wide Viral Peacemaker Standings
              </h3>

              {communityLeaders.map((leader, index) => {
                const isUser = leader.isCurrentUser;
                const isGold = index === 0;
                const isSilver = index === 1;
                const isBronze = index === 2;

                return (
                  <div
                    key={leader.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isUser
                        ? 'bg-violet-950/50 border-violet-400 ring-1 ring-violet-400/40 shadow-md'
                        : isGold
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-slate-800 text-slate-300">
                        {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${index + 1}`}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                            {leader.name}
                          </span>
                          {isUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-violet-500 text-white">
                              You
                            </span>
                          )}
                          <span className="text-[10px] text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded-full border border-violet-500/30">
                            {leader.rankTitle}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {leader.frenemiesConverted} friends played · {leader.frenemiesInvited} challenges issued
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="font-mono font-black text-base text-amber-300">
                        {leader.totalViralHarmonyPoints.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Viral Pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: My Challenges & Bounties */}
        {activeTab === 'bounties' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Created Challenge Links ({challenges.length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="text-xs text-violet-300 hover:text-violet-200 font-bold underline cursor-pointer"
              >
                + New Challenge
              </button>
            </div>

            {challenges.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <p>No challenges created yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer"
                >
                  Create Your First Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {challenges.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-violet-300 px-2 py-0.5 rounded bg-violet-950/60 border border-violet-500/30">
                          {c.code}
                        </span>
                        <span className="text-xs text-slate-300 font-bold truncate max-w-[200px]">
                          Target: {c.targetScore} pts
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold font-mono">
                        +{c.harmonyPointsEarned} pts earned
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 italic mb-3">"{c.banterMessage}"</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {c.friendsPlayedCount} friend{c.friendsPlayedCount === 1 ? '' : 's'} played
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChallenge(c);
                            handleSimulateFriendPlay(c.id);
                          }}
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                          title="Simulate friend playing to test viral reward"
                        >
                          🧪 Simulate Play
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChallenge(c);
                            setActiveTab('create');
                          }}
                          className="text-[11px] font-bold text-violet-300 hover:text-violet-200 cursor-pointer"
                        >
                          View / Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Spreading communication &amp; conflict resolution worldwide</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

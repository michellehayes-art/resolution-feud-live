import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { StrikesDisplay, StrikePopup } from './components/StrikesDisplay';
import { FaceOffPodium } from './components/FaceOffPodium';
import { DeEscalationDebrief } from './components/DeEscalationDebrief';
import { CustomDisputeModal } from './components/CustomDisputeModal';
import { FastMoneyRound } from './components/FastMoneyRound';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import { GooglePlayModal } from './components/GooglePlayModal';
import { ShopModal } from './components/ShopModal';
import { RoundCountdownTimer } from './components/RoundCountdownTimer';
import { HistoryView } from './components/HistoryView';
import { saveGameSession } from './utils/historyStorage';
import { recordFastMoneyScore } from './utils/fastMoneyStorage';
import { AvatarPicker } from './components/AvatarPicker';
import { TeamAvatarBadge } from './components/TeamAvatarBadge';
import { ArchetypeTeamInput } from './components/ArchetypeTeamInput';
import { AudioResponseRecorder } from './components/AudioResponseRecorder';
import { MagicalAnnouncerBanner } from './components/MagicalAnnouncerBanner';
import { StudioCamPIP } from './components/StudioCamPIP';
import { ShareResultsModal } from './components/ShareResultsModal';
import { ReportContentModal } from './components/ReportContentModal';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { Soundboard } from './components/Soundboard';
import { QuestionAdvicePopover } from './components/QuestionAdvicePopover';
import { InviteFrenemyModal } from './components/InviteFrenemyModal';
import { ReceivedVoucherViewModal } from './components/ReceivedVoucherViewModal';
import { getCurrentCity } from './utils/location';
import { parseVoucherFromUrl, PurchasedVoucher } from './utils/rewardsStorage';
import {
  parseIncomingChallengeFromUrl,
  recordFriendPlayedChallenge,
  getUserTotalViralPoints,
  IncomingChallenge,
  getPendingIncomingChallenge,
} from './utils/frenemyStorage';
import { CONFLICT_ARCHETYPES } from './data/archetypes';
import { DEFAULT_QUESTIONS, ROMANCE_QUESTIONS, shuffleQuestions, getQuestionsByMode } from './data/defaultQuestions';
import { FeudQuestion, Team, GameMode, GamePhase, SurveyAnswer } from './types/game';
import { checkLocalMatch, checkAiSemanticMatch } from './utils/matcher';
import { sounds } from './utils/audio';
import {
  Users,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  Sliders,
  Flame,
  HelpCircle,
  Smartphone,
  Timer,
  Pause,
  Play,
  Volume2,
  BarChart3,
  Trophy,
  Shuffle,
  SkipForward,
  Wand2,
  Heart,
  Camera,
  Video,
  Share2,
  Check,
  X,
  QrCode,
  MapPin,
  Flag,
  Music,
  Swords,
  Zap,
} from 'lucide-react';

const STAGE_IMAGE = '/src/assets/images/feud_game_stage_1792130964263.jpg';

export default function App() {
  // Game Setup State
  const [mode, setMode] = useState<GameMode>('COUPLES');
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [teams, setTeams] = useState<[Team, Team]>([
    { id: 1, name: 'Partner 1', score: 0, roundScore: 0, strikes: 0, avatar: 'crown' },
    { id: 2, name: 'Partner 2', score: 0, roundScore: 0, strikes: 0, avatar: 'heart' },
  ]);

  // Questions state
  const [questionBank, setQuestionBank] = useState<FeudQuestion[]>(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<FeudQuestion>(DEFAULT_QUESTIONS[0]);
  const [answers, setAnswers] = useState<SurveyAnswer[]>(DEFAULT_QUESTIONS[0].answers);

  // Round Gameplay State
  const [controllingTeamId, setControllingTeamId] = useState<1 | 2>(1);
  const [roundBank, setRoundBank] = useState(0);
  const [currentStrikes, setCurrentStrikes] = useState(0);
  const [activeStrikePopupCount, setActiveStrikePopupCount] = useState<number | null>(null);
  const [roundWinnerId, setRoundWinnerId] = useState<1 | 2>(1);
  const [lastAwardedPoints, setLastAwardedPoints] = useState(0);
  const [fastMoneyScore, setFastMoneyScore] = useState(0);

  // User input during main board play
  const [currentGuess, setCurrentGuess] = useState('');
  const [isEvaluatingGuess, setIsEvaluatingGuess] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Modals & UI Toggles
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isGooglePlayOpen, setIsGooglePlayOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => sounds.enabled);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [lobbyTab, setLobbyTab] = useState<'setup' | 'history'>('setup');
  const [isMagicalIntroVisible, setIsMagicalIntroVisible] = useState(false);
  const [isStudioCamOpen, setIsStudioCamOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [sharedMatchInfo, setSharedMatchInfo] = useState<{
    winner: string;
    wscore: string;
    loser: string;
    lscore: string;
    title: string;
    mode: string;
  } | null>(null);

  // Frenemy Viral Challenge State
  const [isInviteFrenemyOpen, setIsInviteFrenemyOpen] = useState(false);
  const [incomingChallenge, setIncomingChallenge] = useState<IncomingChallenge | null>(null);
  const [kickbackAwarded, setKickbackAwarded] = useState<number>(0);
  const [userViralPoints, setUserViralPoints] = useState<number>(() => getUserTotalViralPoints());
  const [receivedVoucher, setReceivedVoucher] = useState<PurchasedVoucher | null>(null);

  // Detect if opened from a friend's QR code scan, shared link, Frenemy Challenge, or Received Voucher
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('rf_match') === '1') {
        const winner = params.get('winner') || '';
        const wscore = params.get('wscore') || '0';
        const loser = params.get('loser') || '';
        const lscore = params.get('lscore') || '0';
        const title = params.get('title') || 'Empathetic Peacemakers';
        const scannedMode = params.get('mode') || 'COUPLES';
        setSharedMatchInfo({ winner, wscore, loser, lscore, title, mode: scannedMode });
        sounds.playMagicalEntrance();
      }

      // Check for incoming Frenemy Challenge link
      const challenge = parseIncomingChallengeFromUrl(window.location.search);
      if (challenge) {
        setIncomingChallenge(challenge);
        if (challenge.mode && ['COUPLES', 'ROMANCE', 'SOLO_BOT', 'PARTY'].includes(challenge.mode)) {
          setMode(challenge.mode as GameMode);
        }
        setTeams([
          { id: 1, name: 'You (Challenger)', score: 0, roundScore: 0, strikes: 0, avatar: 'crown' },
          { id: 2, name: challenge.challengerName, score: 0, roundScore: 0, strikes: 0, avatar: 'robot' },
        ]);
        sounds.playFrenemyChallenge();
      }

      // Check for incoming Digital Harmony Voucher received by opponent
      const incomingVoucher = parseVoucherFromUrl(window.location.search);
      if (incomingVoucher) {
        setReceivedVoucher(incomingVoucher);
        sounds.playBountyReward();
      }
    }
  }, []);

  // Geolocation & Session Origin State (Opt-in, Client-side only)
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('rf_location_enabled') === 'true';
  });
  const [locationCity, setLocationCity] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('rf_location_city') : null;
  });
  const [isLocating, setIsLocating] = useState(false);

  // In-App Content Moderation & Reporting State (Google Play Policy Compliance)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'QUESTION' | 'CUSTOM_DISPUTE' | 'AUDIO_RECORDING' | 'GENERAL';
    snippet: string;
  } | null>(null);
  const [blockedQuestions, setBlockedQuestions] = useState<string[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('rf_blocked_content') : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Toggle user location origin with geolocation lookup
  const handleToggleLocation = async () => {
    sounds.playTick();
    if (isLocationEnabled) {
      setIsLocationEnabled(false);
      setLocationCity(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rf_location_enabled');
        localStorage.removeItem('rf_location_city');
      }
      setShareToast('Location origin turned off');
      setTimeout(() => setShareToast(null), 2500);
    } else {
      setIsLocating(true);
      try {
        const res = await getCurrentCity();
        setIsLocationEnabled(true);
        setLocationCity(res.displayLabel);
        if (typeof window !== 'undefined') {
          localStorage.setItem('rf_location_enabled', 'true');
          localStorage.setItem('rf_location_city', res.displayLabel);
        }
        setShareToast(`📍 Session Origin Tagged: ${res.displayLabel}`);
        setTimeout(() => setShareToast(null), 3000);
      } catch (err: unknown) {
        console.warn('Geolocation error:', err);
        setShareToast((err as Error)?.message || 'Location unavailable');
        setTimeout(() => setShareToast(null), 3500);
      } finally {
        setIsLocating(false);
      }
    }
  };

  // In-App Report Content Handlers
  const handleOpenReportModal = (
    type: 'QUESTION' | 'CUSTOM_DISPUTE' | 'AUDIO_RECORDING' | 'GENERAL',
    snippet: string
  ) => {
    sounds.playTick();
    setReportTarget({ type, snippet });
    setIsReportModalOpen(true);
  };

  const handleHideReportedContent = (snippet: string) => {
    setBlockedQuestions((prev) => {
      const next = [...prev, snippet];
      try {
        localStorage.setItem('rf_blocked_content', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // If active question was reported, advance to next question immediately
    if (activeQuestion && activeQuestion.question === snippet) {
      handleSkipToNextQuestion();
    }
  };

  // Web Share API handler for game results & score summary
  const handleShareResultsHUD = async () => {
    sounds.playTick();
    const leader = teams[0].score >= teams[1].score ? teams[0] : teams[1];
    const isTie = teams[0].score === teams[1].score;
    const summaryText = isTie
      ? `🤝 Match Tied at ${teams[0].score} pts between ${teams[0].name} and ${teams[1].name} in Resolution Feud!`
      : `🏆 ${leader.name} leads with ${leader.score} pts in Resolution Feud! (${teams[0].name}: ${teams[0].score} pts vs ${teams[1].name}: ${teams[1].score} pts)`;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareMessage = `${summaryText}\nRound ${currentQuestionIndex + 1} of ${questionBank.length}\nCan you resolve arguments better? Play Resolution Feud: ${appUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Resolution Feud Game Summary',
          text: shareMessage,
          url: appUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setShareToast('Results copied to clipboard! 📋');
        setTimeout(() => setShareToast(null), 3000);
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }
    }
  };

  // Particle & Celebration State
  const [isRoundWon, setIsRoundWon] = useState(false);
  const [roundWinWinnerName, setRoundWinWinnerName] = useState('');
  const [roundWinPoints, setRoundWinPoints] = useState(0);

  // Countdown Timer State for Main Round Play Phase
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(20); // 15s, 20s, or 30s
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const triggerRoundWinCelebration = (winnerName: string, points: number) => {
    setIsRoundWon(true);
    setRoundWinWinnerName(winnerName);
    setRoundWinPoints(points);
    sounds.playCelebrationSequence();
    setTimeout(() => {
      setIsRoundWon(false);
    }, 3200);
  };

  // Sync active question when currentQuestionIndex changes
  useEffect(() => {
    if (questionBank[currentQuestionIndex]) {
      const q = questionBank[currentQuestionIndex];
      setActiveQuestion(q);
      setAnswers(q.answers.map((a) => ({ ...a, isRevealed: false })));
      setRoundBank(0);
      setCurrentStrikes(0);
      setGuessFeedback(null);
      setTimeLeft(timerDuration);
      setIsTimerPaused(false);
    }
  }, [currentQuestionIndex, questionBank, timerDuration]);

  // Main Turn Timer Interval
  useEffect(() => {
    if (phase !== 'MAIN_ROUND' && phase !== 'STEAL_ROUND') {
      return;
    }

    if (!timerEnabled || isTimerPaused || isEvaluatingGuess || isRoundWon || activeStrikePopupCount !== null) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Turn Time Expired!
          handleTurnTimeExpired();
          return timerDuration;
        }

        // Play ticking sound during final 5 seconds
        if (prev <= 6) {
          sounds.playTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    phase,
    timerEnabled,
    isTimerPaused,
    isEvaluatingGuess,
    isRoundWon,
    activeStrikePopupCount,
    timerDuration,
    controllingTeamId,
    currentStrikes,
    roundBank,
    teams,
  ]);

  // Turn time expired handler
  const handleTurnTimeExpired = () => {
    sounds.playStrike();
    setTimeLeft(timerDuration);

    if (phase === 'STEAL_ROUND') {
      // Steal time expired: original controlling team wins the bank!
      const originalControllingTeam = controllingTeamId;
      awardPointsToTeam(originalControllingTeam, roundBank);
      triggerRoundWinCelebration(teams[originalControllingTeam - 1].name, roundBank);
      setActiveStrikePopupCount(1);
      setGuessFeedback({
        message: `Time expired on the steal! ${teams[originalControllingTeam - 1].name} wins all ${roundBank} points!`,
        isCorrect: false,
      });
      setTimeout(() => {
        advanceToDebrief(originalControllingTeam, roundBank);
      }, 2600);
      return;
    }

    // MAIN_ROUND: Add a strike for running out of time!
    const newStrikes = currentStrikes + 1;
    setCurrentStrikes(newStrikes);
    setActiveStrikePopupCount(newStrikes);
    setGuessFeedback({
      message: `Time's up! Strike on ${teams[controllingTeamId - 1].name}!`,
      isCorrect: false,
    });

    if (newStrikes >= 3) {
      sounds.playTripleStrike();
      setTimeout(() => {
        setPhase('STEAL_ROUND');
        setTimeLeft(timerDuration);
        const otherTeam: 1 | 2 = controllingTeamId === 1 ? 2 : 1;
        setGuessFeedback({
          message: `3 STRIKES! Turn clock ran out. Chance to STEAL passes to ${teams[otherTeam - 1].name}!`,
          isCorrect: false,
        });
      }, 1300);
    }
  };

  // Shuffle all questions in deck
  const handleShuffleDeck = () => {
    const fresh = getQuestionsByMode(mode);
    setQuestionBank(fresh);
    setCurrentQuestionIndex(0);
    setActiveQuestion(fresh[0]);
    setAnswers(fresh[0].answers.map((a) => ({ ...a, isRevealed: false })));
    sounds.playFlip();
  };

  // Skip to next question immediately
  const handleSkipToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questionBank.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      sounds.playFlip();
    } else {
      handleShuffleDeck();
    }
  };

  // Start the match
  const handleStartMatch = (selectedMode: GameMode) => {
    setMode(selectedMode);
    // Shuffle the deck of questions based on mode so every game has fresh, varied questions
    const modeQuestions = getQuestionsByMode(selectedMode);
    setQuestionBank(modeQuestions);
    setCurrentQuestionIndex(0);
    setActiveQuestion(modeQuestions[0]);
    setAnswers(modeQuestions[0].answers.map((a) => ({ ...a, isRevealed: false })));

    // Adjust default names based on mode
    let t1Name = 'Partner 1';
    let t2Name = 'Partner 2';
    if (selectedMode === 'SOLO_BOT') {
      t1Name = 'You';
      t2Name = 'Coach Harmony (Bot)';
    } else if (selectedMode === 'PARTY') {
      t1Name = 'Team Red';
      t2Name = 'Team Blue';
    } else if (selectedMode === 'ROMANCE') {
      t1Name = 'Sweetheart 1';
      t2Name = 'Sweetheart 2';
    }

    setTeams([
      {
        id: 1,
        name: teams[0].name.trim() || t1Name,
        score: 0,
        roundScore: 0,
        strikes: 0,
        avatar: selectedMode === 'ROMANCE' ? 'heart' : teams[0].avatar || 'crown',
      },
      {
        id: 2,
        name: teams[1].name.trim() || t2Name,
        score: 0,
        roundScore: 0,
        strikes: 0,
        avatar: selectedMode === 'SOLO_BOT' ? 'robot' : selectedMode === 'ROMANCE' ? 'sparkles' : teams[1].avatar || 'heart',
      },
    ]);

    setPhase('FACE_OFF');

    // Trigger loud, magical, serious-yet-hilarious intro voice announcement
    setIsMagicalIntroVisible(true);
    const greeting =
      selectedMode === 'ROMANCE'
        ? 'You have entered Resolution Feud: Romance Edition! Ignite the sparks and enjoy, everyone!'
        : 'You have entered Resolution Feud! Prepare thy compromises, and enjoy, everyone!';
    sounds.speakMagicalAnnouncement(greeting);
  };

  // Face-Off resolved: Winner chose PLAY or PASS
  const handleFaceOffWinner = (controllingId: 1 | 2, action: 'PLAY' | 'PASS') => {
    setControllingTeamId(controllingId);
    setPhase('MAIN_ROUND');
    sounds.playFlip();
  };

  // Check guess during Face-Off (helper)
  const handleFaceOffGuess = async (guess: string) => {
    const unrevealed = answers.filter((a) => !a.isRevealed);
    const local = checkLocalMatch(guess, unrevealed);
    if (local.matched && local.answer) {
      const originalIndex = answers.findIndex((a) => a.id === local.answer?.id);
      revealAnswer(originalIndex, controllingTeamId);
      return { matched: true, index: originalIndex };
    }

    // Try AI semantic matcher if backend available
    const aiMatch = await checkAiSemanticMatch(guess, unrevealed, activeQuestion.question);
    if (aiMatch.matched && aiMatch.index >= 0) {
      const matchedAns = unrevealed[aiMatch.index];
      const originalIndex = answers.findIndex((a) => a.id === matchedAns.id);
      revealAnswer(originalIndex, controllingTeamId);
      return { matched: true, index: originalIndex };
    }

    return { matched: false, index: -1 };
  };

  // Reveal an answer on the board
  const revealAnswer = (index: number, byTeamId?: 1 | 2) => {
    setAnswers((prev) => {
      if (index < 0 || index >= prev.length || prev[index].isRevealed) return prev;
      const copy = [...prev];
      copy[index] = { ...copy[index], isRevealed: true, revealedBy: byTeamId };
      return copy;
    });

    const pts = answers[index]?.points || 0;
    setRoundBank((prev) => prev + pts);
  };

  // Submit guess during MAIN_ROUND or STEAL_ROUND
  const handleSubmitMainGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuess.trim() || isEvaluatingGuess) return;

    setIsEvaluatingGuess(true);
    setGuessFeedback(null);
    const guessText = currentGuess.trim();
    setCurrentGuess('');
    setTimeLeft(timerDuration);

    const unrevealed = answers.filter((a) => !a.isRevealed);
    let matched = false;
    let matchedIndex = -1;

    // 1. Local matcher
    const local = checkLocalMatch(guessText, unrevealed);
    if (local.matched && local.answer) {
      matched = true;
      matchedIndex = answers.findIndex((a) => a.id === local.answer?.id);
    } else {
      // 2. AI semantic fallback
      const aiMatch = await checkAiSemanticMatch(guessText, unrevealed, activeQuestion.question);
      if (aiMatch.matched && aiMatch.index >= 0) {
        matched = true;
        const matchedAns = unrevealed[aiMatch.index];
        matchedIndex = answers.findIndex((a) => a.id === matchedAns.id);
      }
    }

    setIsEvaluatingGuess(false);

    if (matched && matchedIndex >= 0) {
      // Correct answer! Play unique harmonic chime based on rank (#1 gets gold shimmer)
      sounds.playCorrectAnswerChime(matchedIndex + 1);
      revealAnswer(matchedIndex, controllingTeamId);
      const answerObj = answers[matchedIndex];
      setGuessFeedback({
        message: `Good answer! "${answerObj.text}" (+${answerObj.points} pts)`,
        isCorrect: true,
      });

      // If in STEAL_ROUND, the steal was successful!
      if (phase === 'STEAL_ROUND') {
        const stealingTeam = controllingTeamId === 1 ? 2 : 1;
        const totalPointsToAward = roundBank + answerObj.points;
        awardPointsToTeam(stealingTeam, totalPointsToAward);
        triggerRoundWinCelebration(teams[stealingTeam - 1].name, totalPointsToAward);
        setGuessFeedback({
          message: `STEAL SUCCESSFUL! ${teams[stealingTeam - 1].name} steals all ${totalPointsToAward} points!`,
          isCorrect: true,
        });
        setTimeout(() => {
          advanceToDebrief(stealingTeam, totalPointsToAward);
        }, 2600);
        return;
      }

      // Check if board is now completely revealed
      const remainingUnrevealed = answers.filter((a, idx) => idx !== matchedIndex && !a.isRevealed);
      if (remainingUnrevealed.length === 0) {
        // Board swept!
        const finalBank = roundBank + answerObj.points;
        awardPointsToTeam(controllingTeamId, finalBank);
        triggerRoundWinCelebration(teams[controllingTeamId - 1].name, finalBank);
        setTimeout(() => {
          advanceToDebrief(controllingTeamId, finalBank);
        }, 2600);
      }
    } else {
      // Strike!
      sounds.playStrike();
      setGuessFeedback({
        message: `"${guessText}" is not on the board. Strike!`,
        isCorrect: false,
      });

      if (phase === 'STEAL_ROUND') {
        // Steal failed! The original controlling team keeps all banked points!
        const originalControllingTeam = controllingTeamId;
        awardPointsToTeam(originalControllingTeam, roundBank);
        triggerRoundWinCelebration(teams[originalControllingTeam - 1].name, roundBank);
        setActiveStrikePopupCount(1);
        setTimeout(() => {
          advanceToDebrief(originalControllingTeam, roundBank);
        }, 2600);
        return;
      }

      // In regular round, increment strike
      const newStrikes = currentStrikes + 1;
      setCurrentStrikes(newStrikes);
      setActiveStrikePopupCount(newStrikes);

      if (newStrikes >= 3) {
        sounds.playTripleStrike();
        // 3 strikes: chance to steal passes to the other team!
        setTimeout(() => {
          setPhase('STEAL_ROUND');
          const otherTeam: 1 | 2 = controllingTeamId === 1 ? 2 : 1;
          setGuessFeedback({
            message: `3 STRIKES! Chance to STEAL passes to ${teams[otherTeam - 1].name}!`,
            isCorrect: false,
          });
        }, 1300);
      }
    }
  };

  // Award banked points to a team
  const awardPointsToTeam = (teamId: 1 | 2, points: number) => {
    setTeams((prev) => {
      const copy: [Team, Team] = [
        { ...prev[0] },
        { ...prev[1] },
      ];
      const target = copy[teamId - 1];
      target.score += points;
      return copy;
    });
    setRoundWinnerId(teamId);
    setLastAwardedPoints(points);
  };

  // Move to Debrief
  const advanceToDebrief = (winnerId: 1 | 2, points: number) => {
    setRoundWinnerId(winnerId);
    setLastAwardedPoints(points);
    // Reveal all remaining answers on board for educational value
    setAnswers((prev) => prev.map((a) => ({ ...a, isRevealed: true })));
    setPhase('ROUND_DEBRIEF');
  };

  // Continue to next question or Fast Money
  const handleNextRound = () => {
    if (currentQuestionIndex + 1 < questionBank.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setPhase('FACE_OFF');
    } else {
      setPhase('FAST_MONEY');
    }
  };

  // Add custom AI generated question into question bank
  const handleAddCustomQuestion = (newQ: FeudQuestion) => {
    setQuestionBank((prev) => [newQ, ...prev]);
    setCurrentQuestionIndex(0);
    setActiveQuestion(newQ);
    setAnswers(newQ.answers);
    setPhase('FACE_OFF');
    sounds.playWinFanfare();
  };

  // Finish fast money and record session in local storage
  const handleFinishFastMoney = (points: number) => {
    setFastMoneyScore(points);
    setPhase('GAME_OVER');

    // Save session record to browser localStorage
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;
    const t1 = teams[0].score;
    const t2 = teams[1].score;
    const total = t1 + t2 + points;
    const winnerId: 1 | 2 | 'TIE' = t1 > t2 ? 1 : t2 > t1 ? 2 : 'TIE';
    const winnerName =
      winnerId === 'TIE' ? 'Peaceful Tie' : winnerId === 1 ? teams[0].name : teams[1].name;

    saveGameSession({
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      dateStr,
      mode,
      team1Name: teams[0].name,
      team2Name: teams[1].name,
      team1Score: t1,
      team2Score: t2,
      fastMoneyScore: points,
      totalPoints: total,
      winnerName,
      winnerId,
    });

    // Record to all-time Fast Money leaderboard
    const winningTeam = t1 >= t2 ? teams[0] : teams[1];
    if (points > 0) {
      recordFastMoneyScore({
        mode,
        playerName: winningTeam.name,
        avatar: winningTeam.avatar,
        fastMoneyScore,
        totalMatchScore: total,
      });
    }

    // Award Frenemy Viral Kickback if played via challenge link
    const activeIncoming = incomingChallenge || getPendingIncomingChallenge();
    if (activeIncoming) {
      const res = recordFriendPlayedChallenge(activeIncoming.id, teams[0].name, total);
      setKickbackAwarded(res.pointsAwarded);
      setUserViralPoints(getUserTotalViralPoints());
      sounds.playBountyReward();
    }
  };

  // Reset entire game with a fresh shuffle
  const handleResetGame = () => {
    const fresh = shuffleQuestions(DEFAULT_QUESTIONS);
    setQuestionBank(fresh);
    setCurrentQuestionIndex(0);
    setActiveQuestion(fresh[0]);
    setAnswers(fresh[0].answers.map((a) => ({ ...a, isRevealed: false })));
    setTeams([
      { id: 1, name: 'Partner 1', score: 0, roundScore: 0, strikes: 0, avatar: teams[0].avatar || 'crown' },
      { id: 2, name: 'Partner 2', score: 0, roundScore: 0, strikes: 0, avatar: teams[1].avatar || 'heart' },
    ]);
    setRoundBank(0);
    setCurrentStrikes(0);
    setFastMoneyScore(0);
    setPhase('LOBBY');
  };

  const activePlayingTeamName =
    phase === 'STEAL_ROUND'
      ? teams[controllingTeamId === 1 ? 1 : 0].name
      : teams[controllingTeamId - 1].name;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Stage Image with Subtle Dark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={STAGE_IMAGE}
          alt="Resolution Feud TV Stage"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-15 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />
      </div>

      {/* Main Top Bar */}
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenGooglePlayGuide={() => setIsGooglePlayOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenHistory={() => {
          setPhase('LOBBY');
          setLobbyTab('history');
        }}
        onResetGame={handleResetGame}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = sounds.toggleMute();
          setSoundEnabled(next);
        }}
        onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
        onOpenSoundboard={() => setIsSoundboardOpen(true)}
        isStudioCamOpen={isStudioCamOpen}
        onToggleStudioCam={() => setIsStudioCamOpen(!isStudioCamOpen)}
        isLocationEnabled={isLocationEnabled}
        locationCity={locationCity}
        onToggleLocation={handleToggleLocation}
        onOpenReport={() => handleOpenReportModal('GENERAL', 'Resolution Feud Game Experience')}
        onOpenInviteFrenemy={() => setIsInviteFrenemyOpen(true)}
        viralPoints={userViralPoints}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 z-10">
        {/* LOBBY / SETUP SCREEN */}
        {phase === 'LOBBY' && (
          <div className="max-w-3xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-slate-900/90 border-2 border-amber-500/40 shadow-2xl backdrop-blur-md">
            {/* Lobby View Mode Selector: Match Setup vs History */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLobbyTab('setup')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    lobbyTab === 'setup'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Match Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLobbyTab('history')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    lobbyTab === 'history'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>History &amp; D3 Analytics</span>
                </button>
              </div>
            </div>

            {lobbyTab === 'history' ? (
              <HistoryView
                onBackToSetup={() => setLobbyTab('setup')}
                onStartMatch={() => handleStartMatch(mode)}
                onOpenInviteFrenemy={() => setIsInviteFrenemyOpen(true)}
              />
            ) : (
              <>
                <div className="text-center mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Couples &amp; Friends Game Show
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 tracking-tight">
                    Resolution <span className="text-amber-400">Feud</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
                    We surveyed 100 couples and relationship therapists. Can you guess the top ways to resolve real arguments and build lasting harmony?
                  </p>
                </div>

                {/* Banner when opened via scanned QR code or shared link */}
                {sharedMatchInfo && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-400 text-left relative animate-fadeIn shadow-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Shared Match Result from QR Scan</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSharedMatchInfo(null)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Dismiss banner"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-white font-black text-base sm:text-lg">
                      {sharedMatchInfo.winner} scored {sharedMatchInfo.wscore} pts against {sharedMatchInfo.loser} ({sharedMatchInfo.lscore} pts)!
                    </div>
                    <p className="text-xs text-amber-200/90 mt-1">
                      Awarded Title: <strong>{sharedMatchInfo.title}</strong> · Step to the podiums below to see if you can top their score!
                    </p>
                  </div>
                )}

                {/* INCOMING FRENEMY CHALLENGE LOBBY BANNER */}
                {incomingChallenge && (
                  <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/90 via-slate-900 to-fuchsia-950/90 border-2 border-violet-400 text-left relative animate-fadeIn shadow-2xl ring-2 ring-violet-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500 text-white flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5" />
                        <span>⚔️ Frenemy Challenge Received!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIncomingChallenge(null)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Dismiss challenge banner"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-white font-black text-base sm:text-xl">
                      {incomingChallenge.challengerName} threw down the gauntlet!
                    </div>
                    <div className="text-xs text-violet-200 italic my-1.5 p-2 rounded-lg bg-slate-950/60 border border-violet-500/30">
                      "{incomingChallenge.banterMessage}"
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-violet-300">
                        Target to beat: <strong className="text-amber-300 font-bold">{incomingChallenge.targetScore} pts</strong> · All points you score generate <strong>Viral Harmony Bounty</strong>!
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartMatch(mode)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-500/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        Accept &amp; Step Up ⚔️
                      </button>
                    </div>
                  </div>
                )}

                {/* VIRAL FEATURE: INVITE A FRENEMY ACTION BAR IN LOBBY */}
                <div className="mb-6 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-violet-950/70 via-slate-950 to-fuchsia-950/70 border-2 border-violet-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-violet-300/40 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30 shrink-0">
                      ⚔️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white">Invite a Frenemy Challenge</span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500 text-white shadow-sm">
                          Viral Bounty
                        </span>
                      </div>
                      <p className="text-xs text-violet-200/90 mt-0.5 leading-relaxed">
                        Generate a unique Challenge Link. When your friend plays, they earn <strong className="text-amber-300">Harmony Points for YOU</strong> on the community scoreboard!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTick();
                      setIsInviteFrenemyOpen(true);
                    }}
                    className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border border-violet-300/30"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Invite a Frenemy</span>
                    {userViralPoints > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-mono">
                        {userViralPoints} pts
                      </span>
                    )}
                  </button>
                </div>

                {/* Mode Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Game Mode:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('COUPLES')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        mode === 'COUPLES'
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/20 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Users className="w-5 h-5 text-amber-400 mb-2" />
                      <div className="font-bold text-sm text-white">Couples Face-Off</div>
                      <div className="text-xs text-slate-400 mt-0.5">Partner vs Partner head-to-head</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('ROMANCE')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                        mode === 'ROMANCE'
                          ? 'bg-rose-500/20 border-rose-400 ring-2 ring-rose-400/30 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-rose-900/60'
                      }`}
                    >
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow">
                        Hot &amp; Sweet
                      </div>
                      <Heart className="w-5 h-5 text-rose-400 mb-2 fill-rose-500/30" />
                      <div className="font-bold text-sm text-white flex items-center gap-1">
                        Spicy Romance
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Date night intimacy &amp; sparks</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('SOLO_BOT')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        mode === 'SOLO_BOT'
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/20 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Bot className="w-5 h-5 text-blue-400 mb-2" />
                      <div className="font-bold text-sm text-white">Solo vs Coach Bot</div>
                      <div className="text-xs text-slate-400 mt-0.5">Practice communication solo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('PARTY')}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        mode === 'PARTY'
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/20 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Flame className="w-5 h-5 text-pink-400 mb-2" />
                      <div className="font-bold text-sm text-white">Party / Friends</div>
                      <div className="text-xs text-slate-400 mt-0.5">Two teams with multiple players</div>
                    </button>
                  </div>
                </div>

                {/* Team / Contestant Names & Avatars with Archetype Auto-suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        {mode === 'ROMANCE' ? 'Sweetheart 1' : mode === 'COUPLES' ? 'Partner 1' : 'Team 1'}
                      </label>
                      <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Focus for suggestions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AvatarPicker
                        selectedAvatarId={mode === 'ROMANCE' ? 'heart' : teams[0].avatar || 'crown'}
                        onSelectAvatar={(avId) =>
                          setTeams([{ ...teams[0], avatar: avId }, teams[1]])
                        }
                        teamLabel={teams[0].name}
                      />
                      <ArchetypeTeamInput
                        value={teams[0].name}
                        onChange={(name) =>
                          setTeams([
                            { ...teams[0], name },
                            teams[1],
                          ])
                        }
                        onSelectAvatar={(avId) =>
                          setTeams([
                            { ...teams[0], avatar: avId },
                            teams[1],
                          ])
                        }
                        placeholder={
                          mode === 'ROMANCE'
                            ? 'e.g., The Romantics, Stargazers...'
                            : mode === 'COUPLES'
                            ? 'e.g., The Debaters, The Chill Couple...'
                            : 'e.g., The Debaters...'
                        }
                        teamLabel={mode === 'ROMANCE' ? 'Sweetheart 1' : mode === 'COUPLES' ? 'Partner 1' : 'Team 1'}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        {mode === 'ROMANCE'
                          ? 'Sweetheart 2'
                          : mode === 'COUPLES'
                          ? 'Partner 2'
                          : mode === 'SOLO_BOT'
                          ? 'Opponent'
                          : 'Team 2'}
                      </label>
                      {mode !== 'SOLO_BOT' && (
                        <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Focus for suggestions
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AvatarPicker
                        selectedAvatarId={
                          mode === 'SOLO_BOT' ? 'robot' : mode === 'ROMANCE' ? 'sparkles' : teams[1].avatar || 'heart'
                        }
                        onSelectAvatar={(avId) =>
                          setTeams([
                            teams[0],
                            { ...teams[1], avatar: avId },
                          ])
                        }
                        teamLabel={teams[1].name}
                        disabled={mode === 'SOLO_BOT'}
                      />
                      <ArchetypeTeamInput
                        disabled={mode === 'SOLO_BOT'}
                        value={teams[1].name}
                        onChange={(name) =>
                          setTeams([
                            teams[0],
                            { ...teams[1], name },
                          ])
                        }
                        onSelectAvatar={(avId) =>
                          setTeams([
                            teams[0],
                            { ...teams[1], avatar: avId },
                          ])
                        }
                        placeholder={
                          mode === 'SOLO_BOT'
                            ? 'Coach Bot'
                            : mode === 'ROMANCE'
                            ? 'e.g., Hopeless Romantics, Fire & Ice...'
                            : mode === 'COUPLES'
                            ? 'e.g., The Chill Couple, The Peacemakers...'
                            : 'e.g., The Peacemakers...'
                        }
                        teamLabel={
                          mode === 'ROMANCE'
                            ? 'Sweetheart 2'
                            : mode === 'COUPLES'
                            ? 'Partner 2'
                            : mode === 'SOLO_BOT'
                            ? 'Opponent'
                            : 'Team 2'
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Popular Archetype Quick Picks Bar */}
                <div className="mb-8 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Archetypes:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CONFLICT_ARCHETYPES.slice(0, 5).map((archetype) => (
                      <button
                        key={archetype.id}
                        type="button"
                        onClick={() => {
                          if (teams[0].name === 'Partner 1' || teams[0].name === 'Team 1' || !teams[0].name.trim()) {
                            setTeams([
                              { ...teams[0], name: archetype.name, avatar: archetype.suggestedAvatar },
                              teams[1],
                            ]);
                          } else if (
                            mode !== 'SOLO_BOT' &&
                            (teams[1].name === 'Partner 2' || teams[1].name === 'Team 2' || !teams[1].name.trim())
                          ) {
                            setTeams([
                              teams[0],
                              { ...teams[1], name: archetype.name, avatar: archetype.suggestedAvatar },
                            ]);
                          } else {
                            setTeams([
                              { ...teams[0], name: archetype.name, avatar: archetype.suggestedAvatar },
                              teams[1],
                            ]);
                          }
                          sounds.playTick();
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-400/60 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                        title={archetype.tagline}
                      >
                        <span>{archetype.emoji}</span>
                        <span className="font-semibold">{archetype.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video / Camera Feature Spotlight Banner in Lobby */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Contestant Studio Cam (Picture-in-Picture)</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isStudioCamOpen
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isStudioCamOpen ? 'Active 🔴' : 'Optional PIP'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Initiate camera or screen-sharing to see each other live in a floating PIP window while debating!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsStudioCamOpen(!isStudioCamOpen)}
                    className={`shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                      isStudioCamOpen
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isStudioCamOpen ? 'Close Cam' : 'Enable Video Cam'}</span>
                  </button>
                </div>

                {/* Quick Actions & Start */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsStudioCamOpen(!isStudioCamOpen)}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isStudioCamOpen
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-bold shadow-sm shadow-rose-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-amber-400/60'
                      }`}
                      title="Toggle floating Picture-in-Picture contestant camera"
                    >
                      <Camera className={`w-3.5 h-3.5 ${isStudioCamOpen ? 'text-rose-400' : 'text-amber-400'}`} />
                      <span>{isStudioCamOpen ? 'Studio Cam: LIVE 🔴' : 'Studio Cam (PIP) 🎥'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomModalOpen(true)}
                      className="flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Input our own recent argument with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleDeck}
                      className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                      title="Shuffle and re-order the full question deck"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shuffle Deck ({questionBank.length} Questions)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMagicalIntroVisible(true);
                        sounds.speakMagicalAnnouncement(
                          'You have entered Resolution Feud! Prepare thy compromises, and enjoy, everyone!'
                        );
                      }}
                      className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors cursor-pointer"
                      title="Preview the loud magical game entrance voice"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Intro Voice 🧙‍♂️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLobbyTab('history')}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Match History &amp; D3 Stats</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGooglePlayOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Google Play Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleLocation}
                      disabled={isLocating}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isLocationEnabled
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          : 'text-amber-400 hover:text-amber-300 border-amber-500/30 bg-amber-500/10'
                      }`}
                      title="Tag match origin with your city coordinates"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        {isLocating
                          ? 'Locating...'
                          : isLocationEnabled
                          ? (locationCity ? `📍 ${locationCity.split(',')[0]}` : 'Location: ON')
                          : 'Location Origin'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTick();
                        setIsSoundSettingsOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Customize studio sound categories"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sound FX 🎛️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTick();
                        setIsInviteFrenemyOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-violet-500/50 bg-violet-950/40 hover:bg-violet-900/60 text-violet-200 transition-colors cursor-pointer"
                      title="Generate Frenemy Challenge Link"
                    >
                      <Swords className="w-3.5 h-3.5 text-violet-400" />
                      <span>Invite Frenemy ⚔️</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartMatch(mode)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Step to the Podiums</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ACTIVE GAME PLAY HUD (Shows when not in Lobby) */}
        {phase !== 'LOBBY' && phase !== 'FAST_MONEY' && phase !== 'GAME_OVER' && (
          <div className="w-full max-w-4xl mx-auto mb-4">
            {shareToast && (
              <div className="mb-2 p-2 rounded-xl bg-blue-950/90 border border-blue-400 text-blue-200 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn shadow-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{shareToast}</span>
              </div>
            )}

            {/* Subtle Geolocation Badge (displays user city based on coordinates when Location is toggled) */}
            {isLocationEnabled && (
              <div className="flex items-center justify-between px-3.5 py-1.5 mb-2.5 rounded-xl bg-slate-950/80 border border-amber-500/25 text-xs backdrop-blur-md animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Session Origin:
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-amber-300 flex items-center gap-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {isLocating ? 'Detecting coordinates...' : locationCity || 'Local Studio'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLocation}
                  className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer underline"
                  title="Turn off session location"
                >
                  Turn Off
                </button>
              </div>
            )}

            {/* Top Scoreboard Strip */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 backdrop-blur shadow-md">
              {/* Team 1 Score */}
              <div
                className={`flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-lg border transition-all ${
                  controllingTeamId === 1 && phase === 'MAIN_ROUND'
                    ? 'bg-amber-950/40 border-amber-400'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <TeamAvatarBadge avatarId={teams[0].avatar || 'crown'} size="sm" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate max-w-[120px]">
                    {teams[0].name}
                  </span>
                  <span className="font-mono font-black text-lg sm:text-2xl text-amber-300 tabular-nums">
                    {teams[0].score} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>

              {/* Round Indicator & Host Controls Toggle */}
              <div className="text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 block">
                  Round {currentQuestionIndex + 1} of {questionBank.length}
                </span>
                <div className="flex items-center gap-1.5 justify-center mt-1 flex-wrap">
                  {/* Location Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleLocation}
                    disabled={isLocating}
                    className={`text-[11px] flex items-center gap-1 px-2.5 py-0.5 rounded border transition-colors cursor-pointer font-semibold shadow-sm active:scale-95 disabled:opacity-50 ${
                      isLocationEnabled
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title={
                      isLocationEnabled
                        ? `Location Origin ON (${locationCity || 'Detected'}) — Click to disable`
                        : 'Click to detect your city and tag match origin'
                    }
                  >
                    <MapPin className={`w-3 h-3 ${isLocationEnabled ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>
                      {isLocating
                        ? 'Locating...'
                        : isLocationEnabled
                        ? (locationCity ? `📍 ${locationCity.split(',')[0]}` : 'Location: ON')
                        : 'Location'}
                    </span>
                  </button>

                  {/* Share Game Results Button (Opens Sleek Custom Modal) */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTick();
                      setIsShareModalOpen(true);
                    }}
                    className="text-[11px] flex items-center gap-1 px-2.5 py-0.5 rounded border border-blue-400/50 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors cursor-pointer font-semibold shadow-sm active:scale-95"
                    title="Open sleek match results preview card with social media deep-links"
                  >
                    <Share2 className="w-3 h-3 text-blue-400" />
                    <span>Share Results</span>
                  </button>

                  <button
                    onClick={() => setIsHostControlsOpen(!isHostControlsOpen)}
                    className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      isHostControlsOpen
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Toggle Host Manual Reveal Mode"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{isHostControlsOpen ? 'Host: Active' : 'Host Reveal'}</span>
                  </button>

                  {isHostControlsOpen && (
                    <>
                      <button
                        onClick={handleSkipToNextQuestion}
                        className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border border-blue-400/50 bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30 transition-colors cursor-pointer"
                        title="Skip to next conflict scenario"
                      >
                        <SkipForward className="w-3 h-3 text-blue-400" />
                        <span>Next Q</span>
                      </button>
                      <button
                        onClick={handleShuffleDeck}
                        className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        title="Shuffle all 16 scenarios"
                      >
                        <Shuffle className="w-3 h-3 text-emerald-400" />
                        <span>Shuffle</span>
                      </button>
                      <button
                        onClick={() =>
                          triggerRoundWinCelebration(teams[controllingTeamId - 1].name, roundBank || 85)
                        }
                        className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border border-amber-400/50 bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                        title="Test Round Win Particle Animation"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Round Win</span>
                      </button>
                      <button
                        onClick={() => setPhase('GAME_OVER')}
                        className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border border-purple-400/50 bg-purple-500/20 text-purple-300 font-bold hover:bg-purple-500/30 transition-colors cursor-pointer"
                        title="Test Game Over Screen & Confetti"
                      >
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>Game Over</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMagicalIntroVisible(true);
                          sounds.speakMagicalAnnouncement(
                            'You have entered Resolution Feud! Prepare thy compromises, and enjoy, everyone!'
                          );
                        }}
                        className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded border border-purple-400/50 bg-purple-500/20 text-purple-300 font-bold hover:bg-purple-500/30 transition-colors cursor-pointer"
                        title="Replay Loud Magical Intro Voice"
                      >
                        <Wand2 className="w-3 h-3 text-purple-400" />
                        <span>Intro Voice</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Team 2 Score */}
              <div
                className={`flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-lg border transition-all ${
                  controllingTeamId === 2 && phase === 'MAIN_ROUND'
                    ? 'bg-amber-950/40 border-amber-400'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate max-w-[120px]">
                    {teams[1].name}
                  </span>
                  <span className="font-mono font-black text-lg sm:text-2xl text-amber-300 tabular-nums">
                    {teams[1].score} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>
                <TeamAvatarBadge avatarId={teams[1].avatar || 'heart'} size="sm" />
              </div>
            </div>

            {/* Host Controls Panel (when Host Reveal is active) */}
            {isHostControlsOpen && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950/95 border-2 border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
                {/* Left: Timer Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> Turn Clock:
                  </span>

                  {/* Toggle Timer ON / OFF */}
                  <button
                    type="button"
                    onClick={() => {
                      setTimerEnabled(!timerEnabled);
                      setTimeLeft(timerDuration);
                    }}
                    className={`px-2.5 py-1 rounded font-bold uppercase text-[11px] transition-colors cursor-pointer ${
                      timerEnabled
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {timerEnabled ? 'Timer: ON' : 'Timer: OFF'}
                  </button>

                  {/* Duration Presets */}
                  {timerEnabled && (
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                      {[15, 20, 30].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setTimerDuration(sec);
                            setTimeLeft(sec);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                            timerDuration === sec
                              ? 'bg-amber-400 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Pause / Play */}
                  {timerEnabled && (
                    <button
                      type="button"
                      onClick={() => setIsTimerPaused(!isTimerPaused)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isTimerPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                      <span>{isTimerPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                  )}
                </div>

                {/* Right: Confetti, Cheer & Hint */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sounds.playCrowdCheer(2.5)}
                    className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Play Crowd Cheering & Applause"
                  >
                    <Volume2 className="w-3 h-3 text-blue-400" />
                    <span>Crowd Cheer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerRoundWinCelebration(teams[controllingTeamId - 1].name, roundBank || 85)}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Test Confetti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTick();
                      setIsSoundSettingsOpen(true);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Open Sound FX Categories Panel"
                  >
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Sound FX</span>
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Click unrevealed board cards to manually reveal
                  </span>
                </div>
              </div>
            )}

            {/* Question Banner */}
            <div
              className={`mt-3 p-4 rounded-xl text-center shadow-lg transition-all ${
                mode === 'ROMANCE'
                  ? 'bg-gradient-to-r from-rose-950/90 via-pink-950/70 to-rose-950/90 border border-rose-500/50 shadow-rose-950/50'
                  : 'bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 px-1">
                <div className="flex-1 text-left">
                  {locationCity && isLocationEnabled && (
                    <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                      <MapPin className="w-2.5 h-2.5 text-amber-400" />
                      <span className="truncate max-w-[120px]">{locationCity}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {mode === 'ROMANCE' ? (
                    <span className="text-[11px] font-black uppercase tracking-widest text-rose-300 flex items-center gap-1.5 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                      Spicy Romance Edition • {activeQuestion.category}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                      {activeQuestion.category}
                    </span>
                  )}

                  {/* 'i' info button revealing communication advice popover */}
                  <QuestionAdvicePopover
                    category={activeQuestion.category}
                    counselorTip={activeQuestion.counselorTip}
                    question={activeQuestion.question}
                  />
                </div>
                <div className="flex-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleOpenReportModal('QUESTION', activeQuestion.question)}
                    className="text-[10px] text-slate-400 hover:text-rose-300 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                    title="Report offensive or inappropriate content without exiting app"
                  >
                    <Flag className="w-2.5 h-2.5 text-slate-500 hover:text-rose-400" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5 text-balance">
                "{activeQuestion.question}"
              </h2>
            </div>
          </div>
        )}

        {/* PHASE: FACE_OFF */}
        {phase === 'FACE_OFF' && (
          <FaceOffPodium
            question={activeQuestion.question}
            category={activeQuestion.category}
            counselorTip={activeQuestion.counselorTip}
            teams={teams}
            answers={answers}
            onFaceOffWinner={handleFaceOffWinner}
            onSubmitGuess={handleFaceOffGuess}
          />
        )}

        {/* PHASE: MAIN_ROUND or STEAL_ROUND */}
        {(phase === 'MAIN_ROUND' || phase === 'STEAL_ROUND') && (
          <div>
            {/* Control banner & Strike counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    phase === 'STEAL_ROUND'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {phase === 'STEAL_ROUND' ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <TeamAvatarBadge
                        avatarId={controllingTeamId === 1 ? teams[1].avatar : teams[0].avatar}
                        size="xs"
                      />
                      <span>STEAL CHANCE: {activePlayingTeamName}</span>
                    </>
                  ) : (
                    <>
                      <TeamAvatarBadge
                        avatarId={teams[controllingTeamId - 1].avatar}
                        size="xs"
                      />
                      <span>Controlling the Board:</span>
                      <strong className="text-white">{activePlayingTeamName}</strong>
                    </>
                  )}
                </div>
              </div>

              {/* Strikes for controlling team */}
              {phase === 'MAIN_ROUND' && (
                <StrikesDisplay strikes={currentStrikes} teamName={activePlayingTeamName} />
              )}
            </div>

            {/* The 3D Interactive Feud Board with Round Win Particles */}
            <Board
              answers={answers}
              roundScore={roundBank}
              onManualReveal={(idx) => revealAnswer(idx, controllingTeamId)}
              isHostControlsOpen={isHostControlsOpen}
              isRoundWon={isRoundWon}
              winningTeamName={roundWinWinnerName}
              pointsAwarded={roundWinPoints}
            />

            {/* Countdown Turn Clock for Main Round & Steal Round */}
            {timerEnabled && (
              <div className="max-w-4xl mx-auto mt-3">
                <RoundCountdownTimer
                  timeLeft={timeLeft}
                  maxTime={timerDuration}
                  isRunning={!isTimerPaused}
                  isPaused={isTimerPaused}
                  onTogglePause={() => setIsTimerPaused(!isTimerPaused)}
                  onResetTimer={() => setTimeLeft(timerDuration)}
                  teamName={activePlayingTeamName}
                  isStealRound={phase === 'STEAL_ROUND'}
                />
              </div>
            )}

            {/* Contestant Guess Input Bar with Hands-Free Audio Response */}
            <div className="max-w-4xl mx-auto mt-3 p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-xl">
              <form onSubmit={handleSubmitMainGuess} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    placeholder={
                      phase === 'STEAL_ROUND'
                        ? `Confer with your team! One guess to steal: "${activePlayingTeamName}"...`
                        : `Type or speak a resolution solution for "${activePlayingTeamName}"...`
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm sm:text-base"
                  />
                  <AudioResponseRecorder
                    onTranscript={(text) => setCurrentGuess(text)}
                    disabled={isEvaluatingGuess}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!currentGuess.trim() || isEvaluatingGuess}
                  className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEvaluatingGuess ? 'Checking...' : 'Say it!'}</span>
                </button>
              </form>

              {/* Feedback Message */}
              {guessFeedback && (
                <div
                  className={`mt-2.5 text-xs sm:text-sm font-semibold p-2 rounded text-center transition-all ${
                    guessFeedback.isCorrect
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-950/80 text-red-300 border border-red-500/40'
                  }`}
                >
                  {guessFeedback.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHASE: ROUND_DEBRIEF */}
        {phase === 'ROUND_DEBRIEF' && (
          <DeEscalationDebrief
            question={activeQuestion}
            winningTeam={teams[roundWinnerId - 1]}
            pointsAwarded={lastAwardedPoints}
            isLastRound={currentQuestionIndex + 1 >= questionBank.length}
            onContinue={handleNextRound}
            onGoToFastMoney={() => setPhase('FAST_MONEY')}
          />
        )}

        {/* PHASE: FAST_MONEY */}
        {phase === 'FAST_MONEY' && (
          <FastMoneyRound
            teamName={teams[0].score >= teams[1].score ? teams[0].name : teams[1].name}
            onFinish={handleFinishFastMoney}
          />
        )}

        {/* PHASE: GAME_OVER */}
        {phase === 'GAME_OVER' && (
          <GameOverModal
            teams={teams}
            fastMoneyScore={fastMoneyScore}
            onPlayAgain={handleResetGame}
            mode={mode}
            incomingChallenge={incomingChallenge}
            kickbackAwarded={kickbackAwarded}
            onOpenInviteFrenemy={() => setIsInviteFrenemyOpen(true)}
          />
        )}
      </main>

      {/* Strike Visual Flash Popup */}
      {activeStrikePopupCount !== null && (
        <StrikePopup
          count={activeStrikePopupCount}
          onDismiss={() => setActiveStrikePopupCount(null)}
        />
      )}

      {/* Custom Argument Generator Modal */}
      <CustomDisputeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddQuestion={handleAddCustomQuestion}
      />

      {/* How to Play Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Google Play & Install Guide Modal */}
      <GooglePlayModal
        isOpen={isGooglePlayOpen}
        onClose={() => setIsGooglePlayOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />

      {/* Shop & Expansion Packs Modal */}
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

      {/* Loud Magical Game Start Proclamation Banner */}
      <MagicalAnnouncerBanner
        isVisible={isMagicalIntroVisible}
        onDismiss={() => setIsMagicalIntroVisible(false)}
      />

      {/* Floating Picture-in-Picture Contestant Studio Cam */}
      <StudioCamPIP
        isOpen={isStudioCamOpen}
        onClose={() => setIsStudioCamOpen(false)}
        team1Name={teams[0].name}
        team2Name={teams[1].name}
        mode={mode}
      />

      {/* Custom Sleek Share Results Modal */}
      <ShareResultsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        teams={teams}
        roundNumber={currentQuestionIndex + 1}
        totalRounds={questionBank.length}
        mode={mode}
        fastMoneyScore={fastMoneyScore}
        locationCity={isLocationEnabled ? locationCity : undefined}
      />

      {/* In-App User Content Reporting Modal (Google Play Policy Compliant) */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contentType={reportTarget?.type || 'GENERAL'}
        contentSnippet={reportTarget?.snippet}
        currentCity={locationCity}
        onHideContent={handleHideReportedContent}
      />

      {/* Studio Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        onSettingsChanged={(updated) => setSoundEnabled(updated.master)}
      />

      {/* Live Studio Soundboard Modal & Minimized Pill */}
      <Soundboard
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        onOpenSettings={() => setIsSoundSettingsOpen(true)}
      />

      {/* Invite a Frenemy Viral Challenge Modal */}
      <InviteFrenemyModal
        isOpen={isInviteFrenemyOpen}
        onClose={() => {
          setIsInviteFrenemyOpen(false);
          setUserViralPoints(getUserTotalViralPoints());
        }}
        defaultChallengerName={teams[0].name !== 'Contender' && teams[0].name !== 'You (Challenger)' ? teams[0].name : 'Player 1'}
        defaultAvatar={teams[0].avatar}
      />

      {/* Received Digital Voucher Modal (Opponent Device View) */}
      <ReceivedVoucherViewModal
        voucher={receivedVoucher}
        isOpen={Boolean(receivedVoucher)}
        onClose={() => setReceivedVoucher(null)}
      />

      {/* Floating Soundboard Quick-Access Launcher Button during Gameplay & Lobby */}
      {!isSoundboardOpen && (
        <button
          type="button"
          onClick={() => {
            sounds.playTick();
            setIsSoundboardOpen(true);
          }}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-amber-500/70 hover:border-amber-400 text-amber-300 shadow-2xl shadow-black/80 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md group"
          title="Open Live Soundboard (Applause, Oops, Rimshot, Airhorn, Cheers)"
          aria-label="Open Live Soundboard"
        >
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
            <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
          <span className="flex items-center gap-1.5 font-sans">
            <Music className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Soundboard</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </button>
      )}
    </div>
  );
}

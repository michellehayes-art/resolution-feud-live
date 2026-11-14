import React, { useState, useEffect, useMemo } from 'react';
import { GameSessionRecord } from '../types/history';
import { getGameHistory, clearGameHistory, saveGameSession } from '../utils/historyStorage';
import { HistoryD3Chart } from './HistoryD3Chart';
import { RosePetalDrop } from './RosePetalDrop';
import {
  Trophy,
  TrendingUp,
  Award,
  Trash2,
  PlusCircle,
  ArrowLeft,
  Play,
  Calendar,
  Filter,
  RotateCcw,
  Clock,
  Heart,
  Swords,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { getUserTotalViralPoints } from '../utils/frenemyStorage';

interface HistoryViewProps {
  onBackToSetup: () => void;
  onStartMatch: () => void;
  onOpenInviteFrenemy?: () => void;
}

type DateRangePreset =
  | 'ALL'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'CUSTOM';

interface CoupleHarmonyRecord {
  coupleName: string;
  partner1: string;
  partner2: string;
  totalHarmonyPoints: number;
  matchCount: number;
  highestMatchScore: number;
  rosesEarned: number;
  harmonyTitle: string;
  modesPlayed: string[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onBackToSetup,
  onStartMatch,
  onOpenInviteFrenemy,
}) => {
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const viralPoints = useMemo(() => getUserTotalViralPoints(), []);

  // Date Range and Filter State
  const [datePreset, setDatePreset] = useState<DateRangePreset>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('ALL');

  // Interactive Rose Drop State
  const [isRoseDropActive, setIsRoseDropActive] = useState(false);
  const [roseDropRecipient, setRoseDropRecipient] = useState('Our Studio Couples');
  const [roseDropMessage, setRoseDropMessage] = useState('');

  useEffect(() => {
    setSessions(getGameHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your session history?')) {
      sounds.playStrike();
      clearGameHistory();
      setSessions([]);
    }
  };

  const handleAddSampleSession = () => {
    sounds.playDing(2);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;
    const t1 = Math.floor(Math.random() * 120) + 120;
    const t2 = Math.floor(Math.random() * 120) + 110;
    const bonus = Math.floor(Math.random() * 60) + 30;
    const total = t1 + t2 + bonus;

    const sampleCouples = [
      { p1: 'Sam', p2: 'Taylor' },
      { p1: 'Alex', p2: 'Jordan' },
      { p1: 'Maya', p2: 'Leo' },
      { p1: 'Riley', p2: 'Morgan' },
      { p1: 'Chris', p2: 'Pat' },
    ];
    const pickedCouple = sampleCouples[Math.floor(Math.random() * sampleCouples.length)];

    const modes: ('COUPLES' | 'ROMANCE' | 'SOLO_BOT' | 'PARTY')[] = [
      'COUPLES',
      'ROMANCE',
      'SOLO_BOT',
      'PARTY',
    ];
    const pickedMode = modes[Math.floor(Math.random() * modes.length)];

    const newRecord: GameSessionRecord = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      dateStr,
      mode: pickedMode,
      team1Name: pickedCouple.p1,
      team2Name: pickedCouple.p2,
      team1Score: t1,
      team2Score: t2,
      fastMoneyScore: bonus,
      totalPoints: total,
      winnerName: t1 >= t2 ? pickedCouple.p1 : pickedCouple.p2,
      winnerId: t1 > t2 ? 1 : t2 > t1 ? 2 : 'TIE',
    };

    const updated = saveGameSession(newRecord);
    setSessions(updated);
  };

  const handleResetFilters = () => {
    sounds.playTick();
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setModeFilter('ALL');
  };

  // Trigger full-screen rose drop effect for a specific couple
  const handleGiftRosesToCouple = (couple: CoupleHarmonyRecord) => {
    sounds.playRoseShower();
    setRoseDropRecipient(couple.coupleName);
    setRoseDropMessage(
      `🌹 Celebrating ${couple.coupleName}! You earned ${couple.rosesEarned} roses with ${couple.totalHarmonyPoints} harmony points across ${couple.matchCount} matches!`
    );
    setIsRoseDropActive(true);
  };

  // Filter sessions by date range and game mode
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const ONE_DAY_MS = 86400000;

    return sessions.filter((s) => {
      // 1. Mode filter
      if (modeFilter !== 'ALL' && s.mode.toUpperCase() !== modeFilter.toUpperCase()) {
        return false;
      }

      // 2. Date preset filter
      const sessionTime = s.timestamp || now;

      switch (datePreset) {
        case 'THIS_WEEK':
          return sessionTime >= now - 7 * ONE_DAY_MS;

        case 'LAST_WEEK':
          return sessionTime >= now - 14 * ONE_DAY_MS && sessionTime < now - 7 * ONE_DAY_MS;

        case 'THIS_MONTH':
          return sessionTime >= now - 30 * ONE_DAY_MS;

        case 'LAST_MONTH':
          return sessionTime >= now - 60 * ONE_DAY_MS && sessionTime < now - 30 * ONE_DAY_MS;

        case 'CUSTOM': {
          let matchesStart = true;
          let matchesEnd = true;

          if (customStartDate) {
            const startMs = new Date(customStartDate + 'T00:00:00').getTime();
            if (!isNaN(startMs)) matchesStart = sessionTime >= startMs;
          }

          if (customEndDate) {
            const endMs = new Date(customEndDate + 'T23:59:59.999').getTime();
            if (!isNaN(endMs)) matchesEnd = sessionTime <= endMs;
          }

          return matchesStart && matchesEnd;
        }

        case 'ALL':
        default:
          return true;
      }
    });
  }, [sessions, datePreset, customStartDate, customEndDate, modeFilter]);

  // Aggregate points across all sessions to rank the most harmonious couples
  const harmonyLeaderboard = useMemo<CoupleHarmonyRecord[]>(() => {
    const map = new Map<
      string,
      {
        p1: string;
        p2: string;
        totalPoints: number;
        matches: number;
        highest: number;
        modes: Set<string>;
      }
    >();

    // Use all sessions for cumulative relationship leaderboard
    sessions.forEach((s) => {
      const names = [s.team1Name || 'Partner 1', s.team2Name || 'Partner 2'].sort();
      const key = `${names[0]} & ${names[1]}`;

      if (!map.has(key)) {
        map.set(key, {
          p1: names[0],
          p2: names[1],
          totalPoints: 0,
          matches: 0,
          highest: 0,
          modes: new Set<string>(),
        });
      }

      const item = map.get(key)!;
      item.totalPoints += s.totalPoints || 0;
      item.matches += 1;
      item.highest = Math.max(item.highest, s.totalPoints || 0);
      if (s.mode) item.modes.add(s.mode);
    });

    const list: CoupleHarmonyRecord[] = Array.from(map.entries()).map(([coupleName, data]) => {
      // 1 digital rose earned for every 35 harmony points (min 3 roses)
      const rosesEarned = Math.max(3, Math.floor(data.totalPoints / 35));

      let harmonyTitle = '🌱 Rising Peacemakers';
      if (data.totalPoints >= 1000) {
        harmonyTitle = '🌌 Cosmic Soulmates';
      } else if (data.totalPoints >= 700) {
        harmonyTitle = '🕊️ Master Peacemakers';
      } else if (data.totalPoints >= 450) {
        harmonyTitle = '✨ Certified Harmony Royals';
      } else if (data.totalPoints >= 250) {
        harmonyTitle = '💖 Dedicated Diplomats';
      }

      return {
        coupleName,
        partner1: data.p1,
        partner2: data.p2,
        totalHarmonyPoints: data.totalPoints,
        matchCount: data.matches,
        highestMatchScore: data.highest,
        rosesEarned,
        harmonyTitle,
        modesPlayed: Array.from(data.modes),
      };
    });

    // Sort descending by cumulative harmony points
    list.sort((a, b) => b.totalHarmonyPoints - a.totalHarmonyPoints);
    return list;
  }, [sessions]);

  // Compute summary stats dynamically for filtered sessions
  const totalMatches = filteredSessions.length;
  const team1Wins = filteredSessions.filter((s) => s.winnerId === 1).length;
  const team2Wins = filteredSessions.filter((s) => s.winnerId === 2).length;
  const ties = filteredSessions.filter((s) => s.winnerId === 'TIE').length;
  const team1WinRate = totalMatches > 0 ? Math.round((team1Wins / totalMatches) * 100) : 0;
  const maxScore = totalMatches > 0 ? Math.max(...filteredSessions.map((s) => s.totalPoints)) : 0;
  const totalAllPoints = filteredSessions.reduce((sum, s) => sum + s.totalPoints, 0);

  const isFilterActive =
    datePreset !== 'ALL' ||
    Boolean(customStartDate) ||
    Boolean(customEndDate) ||
    modeFilter !== 'ALL';

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* View Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Performance Analytics · Local Storage
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Conflict Resolution History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking cumulative harmony points, digital roses, and communication breakthroughs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenInviteFrenemy && (
            <button
              type="button"
              onClick={onOpenInviteFrenemy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 text-violet-200 text-xs font-bold border border-violet-500/50 transition-colors cursor-pointer"
              title="Invite a Frenemy and earn viral harmony points"
            >
              <Swords className="w-4 h-4 text-violet-400" />
              <span>Invite Frenemy</span>
              {viralPoints > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-violet-500 text-white text-[9px] font-black">
                  +{viralPoints}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onBackToSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Match Setup</span>
          </button>
          <button
            type="button"
            onClick={onStartMatch}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md hover:from-amber-300 hover:to-amber-400 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Play Now</span>
          </button>
        </div>
      </div>

      {/* DATE RANGE FILTER TOOLBAR */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/30 shadow-lg text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Date Range &amp; Mode Filters</span>
                {isFilterActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Filtered
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Viewing {filteredSessions.length} of {sessions.length} recorded match sessions
              </p>
            </div>
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to All Time</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
          {/* Preset Date Range Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeframe / Period</span>
            </label>
            <select
              value={datePreset}
              onChange={(e) => {
                sounds.playTick();
                setDatePreset(e.target.value as DateRangePreset);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">📅 All Time ({sessions.length} matches)</option>
              <option value="THIS_WEEK">⚡ This Week (Past 7 Days)</option>
              <option value="LAST_WEEK">⏪ Last Week (7–14 Days Ago)</option>
              <option value="THIS_MONTH">📆 This Month (Past 30 Days)</option>
              <option value="LAST_MONTH">🗓️ Last Month (30–60 Days Ago)</option>
              <option value="CUSTOM">🛠️ Custom Date Range...</option>
            </select>
          </div>

          {/* Game Mode Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Game Mode</span>
            </label>
            <select
              value={modeFilter}
              onChange={(e) => {
                sounds.playTick();
                setModeFilter(e.target.value);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="COUPLES">💖 Couples Mode</option>
              <option value="ROMANCE">🔥 Spicy Romance</option>
              <option value="SOLO_BOT">🤖 Solo vs AI Bot</option>
              <option value="PARTY">🎉 Party Mode</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          <div className={`${datePreset === 'CUSTOM' ? 'block' : 'hidden lg:block opacity-60'}`}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Custom Dates (Start to End)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setCustomStartDate(e.target.value);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                placeholder="YYYY-MM-DD"
                title="Start Date"
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setCustomEndDate(e.target.value);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                placeholder="YYYY-MM-DD"
                title="End Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards (Computed from Filtered Sessions) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Filtered Matches</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-black text-2xl text-white">{totalMatches}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {isFilterActive ? `of ${sessions.length} all-time` : 'Saved in browser storage'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Win Record</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-2xl text-amber-400">
            {team1Wins} <span className="text-slate-500 text-sm font-normal">W -</span> {team2Wins}{' '}
            <span className="text-slate-500 text-sm font-normal">L</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {team1WinRate}% Team 1 Win Rate {ties > 0 ? `(${ties} ties)` : ''}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Match</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-black text-2xl text-white font-mono">{maxScore}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Best combined round</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Points</span>
            <span className="text-xs text-rose-400 font-bold">🌹 ROSES</span>
          </div>
          <div className="font-mono font-black text-2xl text-rose-400 font-mono">
            {totalAllPoints}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ~{Math.max(1, Math.floor(totalAllPoints / 35))} studio roses earned
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NEW: RELATIONSHIP HARMONY LEADERBOARD SECTION WITH ROSES */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 border-2 border-rose-500/40 shadow-2xl text-left relative overflow-hidden">
        {/* Decorative subtle rose glow in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-400/50 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20">
              🌹
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Relationship Harmony Leaderboard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Top Couples
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aggregating cumulative points, digital roses, and peaceful compromises across all sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playRoseShower();
                setRoseDropRecipient('All Studio Couples');
                setRoseDropMessage('🌹 Showering the studio with roses celebrating mutual love, laughter, and peaceful compromises!');
                setIsRoseDropActive(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 transition-transform active:scale-95 cursor-pointer"
              title="Shower the screen with falling roses & petals"
            >
              <span>🌹 Shower Roses</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="mt-4 space-y-2.5">
          {harmonyLeaderboard.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No couples recorded yet. Play a match to establish your spot on the Harmony Leaderboard!
            </div>
          ) : (
            harmonyLeaderboard.map((couple, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              // Rank Badge Styling
              let rankBadge = (
                <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>
              );
              if (isFirst) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 shadow-md shadow-amber-400/50">
                    🥇
                  </span>
                );
              } else if (isSecond) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                    🥈
                  </span>
                );
              } else if (isThird) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center shrink-0">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={couple.coupleName}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-slate-950 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                      : isSecond
                      ? 'bg-slate-900/90 border-slate-700/80'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/30'
                  }`}
                >
                  {/* Left: Rank, Couple Name & Badges */}
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-sm sm:text-base truncate">
                          {couple.coupleName}
                        </span>

                        {isFirst && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40">
                            👑 Most Harmonious
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full">
                          {couple.harmonyTitle}
                        </span>
                      </div>

                      {/* Couple Stats details */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span>{couple.matchCount} {couple.matchCount === 1 ? 'match' : 'matches'} played</span>
                        <span>•</span>
                        <span>Peak: <strong className="text-slate-200">{couple.highestMatchScore} pts</strong></span>
                        <span>•</span>
                        <span className="text-rose-300 font-semibold flex items-center gap-1">
                          <span>🌹 {couple.rosesEarned} Roses Awarded</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Harmony Points & Gift Roses Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="font-mono font-black text-lg sm:text-xl text-rose-300 tabular-nums block">
                        {couple.totalHarmonyPoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Harmony Pts
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGiftRosesToCouple(couple)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-xs transition-colors cursor-pointer"
                      title={`Gift a bouquet of roses to ${couple.coupleName}`}
                    >
                      <span>🌹 Gift Roses</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rose Harmony Formula Milestone Footer */}
        <div className="mt-4 pt-3 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
            <span>
              <strong>Rose Award Rule:</strong> Couples earn <strong>1 digital rose</strong> for every 35 cumulative harmony points banked through peaceful compromises.
            </span>
          </div>

          <div className="text-rose-300/80 font-mono text-[10px]">
            🌹 Truces &gt; Disputes
          </div>
        </div>
      </div>

      {/* D3 Bar Chart Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/30 shadow-xl text-left">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span>D3 Session Trends &amp; Points</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredSessions.length > 0 ? 'Hover bars for breakdown' : ''}
          </span>
        </div>

        {filteredSessions.length > 0 ? (
          <HistoryD3Chart sessions={filteredSessions} />
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm space-y-2">
            <p>No match sessions found for the selected date range.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All-Time Matches</span>
            </button>
          </div>
        )}
      </div>

      {/* Filtered Sessions Table & History Management */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Match Log
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">
              ({filteredSessions.length} displayed)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddSampleSession}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate Record</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No match sessions recorded in this time window.
            </div>
          ) : (
            filteredSessions
              .slice()
              .reverse()
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-slate-400 text-[11px] w-14 shrink-0">
                      {s.dateStr}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">
                        {s.team1Name} vs {s.team2Name}
                      </span>
                      <div className="text-[10px] text-slate-400 truncate">
                        Mode: <strong className="text-slate-300 font-semibold">{s.mode}</strong> · Winner:{' '}
                        <strong className="text-amber-300 font-semibold">{s.winnerName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className="font-mono font-bold text-amber-300">
                      {s.team1Score} - {s.team2Score}
                    </div>
                    <div className="text-[10px] text-rose-400 font-mono">
                      {s.totalPoints} total pts
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Interactive Full-Screen Rose Drop for Leaderboard */}
      <RosePetalDrop
        isActive={isRoseDropActive}
        onDismiss={() => setIsRoseDropActive(false)}
        senderName="Resolution Feud Studio"
        recipientName={roseDropRecipient}
        customMessage={roseDropMessage}
      />
    </div>
  );
};

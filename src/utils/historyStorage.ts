import { GameSessionRecord } from '../types/history';

const STORAGE_KEY = 'resolution_feud_sessions_v1';

const INITIAL_SESSIONS: GameSessionRecord[] = [
  // This Week (Past 7 days)
  {
    id: 'session-demo-today',
    timestamp: Date.now() - 3600000 * 4, // 4 hours ago
    dateStr: 'Today',
    mode: 'COUPLES',
    team1Name: 'Sam',
    team2Name: 'Taylor',
    team1Score: 210,
    team2Score: 185,
    fastMoneyScore: 80,
    totalPoints: 475,
    winnerName: 'Sam',
    winnerId: 1,
  },
  {
    id: 'session-demo-2d',
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    dateStr: 'Nov 07',
    mode: 'PARTY',
    team1Name: 'Team Red',
    team2Name: 'Team Blue',
    team1Score: 145,
    team2Score: 195,
    fastMoneyScore: 50,
    totalPoints: 390,
    winnerName: 'Team Blue',
    winnerId: 2,
  },
  {
    id: 'session-demo-4d',
    timestamp: Date.now() - 86400000 * 4, // 4 days ago
    dateStr: 'Nov 05',
    mode: 'SOLO_BOT',
    team1Name: 'Contestant',
    team2Name: 'Coach Harmony',
    team1Score: 180,
    team2Score: 140,
    fastMoneyScore: 60,
    totalPoints: 380,
    winnerName: 'Contestant',
    winnerId: 1,
  },
  // Last Week (7 - 14 days ago)
  {
    id: 'session-demo-lastweek-1',
    timestamp: Date.now() - 86400000 * 9, // 9 days ago
    dateStr: 'Oct 31',
    mode: 'COUPLES',
    team1Name: 'Alex',
    team2Name: 'Jordan',
    team1Score: 165,
    team2Score: 110,
    fastMoneyScore: 45,
    totalPoints: 320,
    winnerName: 'Alex',
    winnerId: 1,
  },
  {
    id: 'session-demo-lastweek-2',
    timestamp: Date.now() - 86400000 * 12, // 12 days ago
    dateStr: 'Oct 28',
    mode: 'ROMANCE',
    team1Name: 'Sweethearts',
    team2Name: 'Cupid Squad',
    team1Score: 190,
    team2Score: 175,
    fastMoneyScore: 70,
    totalPoints: 435,
    winnerName: 'Sweethearts',
    winnerId: 1,
  },
  // Earlier This Month / 2-3 Weeks Ago (15 - 28 days ago)
  {
    id: 'session-demo-month-1',
    timestamp: Date.now() - 86400000 * 18, // 18 days ago
    dateStr: 'Oct 22',
    mode: 'PARTY',
    team1Name: 'Living Room All-Stars',
    team2Name: 'Game Night Kings',
    team1Score: 175,
    team2Score: 180,
    fastMoneyScore: 55,
    totalPoints: 410,
    winnerName: 'Game Night Kings',
    winnerId: 2,
  },
  {
    id: 'session-demo-month-2',
    timestamp: Date.now() - 86400000 * 24, // 24 days ago
    dateStr: 'Oct 16',
    mode: 'COUPLES',
    team1Name: 'Riley',
    team2Name: 'Morgan',
    team1Score: 155,
    team2Score: 155,
    fastMoneyScore: 40,
    totalPoints: 350,
    winnerName: 'Peaceful Tie',
    winnerId: 'TIE',
  },
  // Last Month (35 - 50 days ago)
  {
    id: 'session-demo-lastmonth-1',
    timestamp: Date.now() - 86400000 * 38, // 38 days ago
    dateStr: 'Oct 02',
    mode: 'SOLO_BOT',
    team1Name: 'Solo Peacemaker',
    team2Name: 'Coach Harmony',
    team1Score: 200,
    team2Score: 160,
    fastMoneyScore: 65,
    totalPoints: 425,
    winnerName: 'Solo Peacemaker',
    winnerId: 1,
  },
  {
    id: 'session-demo-lastmonth-2',
    timestamp: Date.now() - 86400000 * 46, // 46 days ago
    dateStr: 'Sep 24',
    mode: 'COUPLES',
    team1Name: 'Maya',
    team2Name: 'Leo',
    team1Score: 185,
    team2Score: 170,
    fastMoneyScore: 50,
    totalPoints: 405,
    winnerName: 'Maya',
    winnerId: 1,
  },
];

export function getGameHistory(): GameSessionRecord[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SESSIONS;
  } catch (err) {
    console.error('Failed to read game history from localStorage:', err);
    return INITIAL_SESSIONS;
  }
}

export function saveGameSession(session: GameSessionRecord): GameSessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getGameHistory();
    const updated = [...current, session];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save game session to localStorage:', err);
    return [];
  }
}

export function clearGameHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear game history:', err);
  }
}

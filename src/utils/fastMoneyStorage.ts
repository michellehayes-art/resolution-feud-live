export interface FastMoneyLeaderboardEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  mode: string; // 'COUPLES' | 'ROMANCE' | 'SOLO_BOT' | 'PARTY'
  playerName: string;
  avatar?: string;
  fastMoneyScore: number;
  totalMatchScore: number;
  passedThreshold: boolean; // >= 150 pts
  isRecent?: boolean;
}

const STORAGE_KEY = 'rf_fast_money_leaderboard_v2';

const SEED_LEADERBOARDS: FastMoneyLeaderboardEntry[] = [
  // COUPLES MODE TOP 5
  {
    id: 'seed-c-1',
    timestamp: Date.now() - 86400000 * 5,
    dateStr: 'Nov 04',
    mode: 'COUPLES',
    playerName: 'Maya & Leo',
    avatar: 'crown',
    fastMoneyScore: 175,
    totalMatchScore: 485,
    passedThreshold: true,
  },
  {
    id: 'seed-c-2',
    timestamp: Date.now() - 86400000 * 4,
    dateStr: 'Nov 05',
    mode: 'COUPLES',
    playerName: 'Alex & Jordan',
    avatar: 'heart',
    fastMoneyScore: 160,
    totalMatchScore: 430,
    passedThreshold: true,
  },
  {
    id: 'seed-c-3',
    timestamp: Date.now() - 86400000 * 3,
    dateStr: 'Nov 06',
    mode: 'COUPLES',
    playerName: 'Sam & Taylor',
    avatar: 'star',
    fastMoneyScore: 145,
    totalMatchScore: 395,
    passedThreshold: false,
  },
  {
    id: 'seed-c-4',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: 'Nov 07',
    mode: 'COUPLES',
    playerName: 'Chris & Pat',
    avatar: 'flame',
    fastMoneyScore: 130,
    totalMatchScore: 360,
    passedThreshold: false,
  },
  {
    id: 'seed-c-5',
    timestamp: Date.now() - 86400000 * 1,
    dateStr: 'Nov 08',
    mode: 'COUPLES',
    playerName: 'Riley & Morgan',
    avatar: 'peace',
    fastMoneyScore: 115,
    totalMatchScore: 335,
    passedThreshold: false,
  },

  // ROMANCE MODE TOP 5
  {
    id: 'seed-r-1',
    timestamp: Date.now() - 86400000 * 4,
    dateStr: 'Nov 05',
    mode: 'ROMANCE',
    playerName: 'Sweethearts Eternal',
    avatar: 'heart',
    fastMoneyScore: 185,
    totalMatchScore: 510,
    passedThreshold: true,
  },
  {
    id: 'seed-r-2',
    timestamp: Date.now() - 86400000 * 3,
    dateStr: 'Nov 06',
    mode: 'ROMANCE',
    playerName: 'Romeo & Juliet',
    avatar: 'crown',
    fastMoneyScore: 165,
    totalMatchScore: 460,
    passedThreshold: true,
  },
  {
    id: 'seed-r-3',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: 'Nov 07',
    mode: 'ROMANCE',
    playerName: 'Passionate Duo',
    avatar: 'flame',
    fastMoneyScore: 150,
    totalMatchScore: 415,
    passedThreshold: true,
  },
  {
    id: 'seed-r-4',
    timestamp: Date.now() - 86400000 * 1,
    dateStr: 'Nov 08',
    mode: 'ROMANCE',
    playerName: "Cupid's Favorites",
    avatar: 'sparkles',
    fastMoneyScore: 135,
    totalMatchScore: 370,
    passedThreshold: false,
  },
  {
    id: 'seed-r-5',
    timestamp: Date.now() - 3600000 * 12,
    dateStr: 'Nov 09',
    mode: 'ROMANCE',
    playerName: 'Date Night Royals',
    avatar: 'star',
    fastMoneyScore: 120,
    totalMatchScore: 340,
    passedThreshold: false,
  },

  // SOLO_BOT MODE TOP 5
  {
    id: 'seed-b-1',
    timestamp: Date.now() - 86400000 * 6,
    dateStr: 'Nov 03',
    mode: 'SOLO_BOT',
    playerName: 'Empathy Master',
    avatar: 'brain',
    fastMoneyScore: 170,
    totalMatchScore: 470,
    passedThreshold: true,
  },
  {
    id: 'seed-b-2',
    timestamp: Date.now() - 86400000 * 4,
    dateStr: 'Nov 05',
    mode: 'SOLO_BOT',
    playerName: 'Conflict Ninja',
    avatar: 'flame',
    fastMoneyScore: 155,
    totalMatchScore: 435,
    passedThreshold: true,
  },
  {
    id: 'seed-b-3',
    timestamp: Date.now() - 86400000 * 3,
    dateStr: 'Nov 06',
    mode: 'SOLO_BOT',
    playerName: 'Zen Peacemaker',
    avatar: 'peace',
    fastMoneyScore: 140,
    totalMatchScore: 390,
    passedThreshold: false,
  },
  {
    id: 'seed-b-4',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: 'Nov 07',
    mode: 'SOLO_BOT',
    playerName: 'Solo Diplomat',
    avatar: 'crown',
    fastMoneyScore: 125,
    totalMatchScore: 350,
    passedThreshold: false,
  },
  {
    id: 'seed-b-5',
    timestamp: Date.now() - 86400000 * 1,
    dateStr: 'Nov 08',
    mode: 'SOLO_BOT',
    playerName: 'Active Listener',
    avatar: 'heart',
    fastMoneyScore: 110,
    totalMatchScore: 320,
    passedThreshold: false,
  },

  // PARTY MODE TOP 5
  {
    id: 'seed-p-1',
    timestamp: Date.now() - 86400000 * 5,
    dateStr: 'Nov 04',
    mode: 'PARTY',
    playerName: 'Team Thunder',
    avatar: 'lightning',
    fastMoneyScore: 180,
    totalMatchScore: 505,
    passedThreshold: true,
  },
  {
    id: 'seed-p-2',
    timestamp: Date.now() - 86400000 * 3,
    dateStr: 'Nov 06',
    mode: 'PARTY',
    playerName: 'Team Spark',
    avatar: 'star',
    fastMoneyScore: 165,
    totalMatchScore: 450,
    passedThreshold: true,
  },
  {
    id: 'seed-p-3',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: 'Nov 07',
    mode: 'PARTY',
    playerName: 'The Party Squad',
    avatar: 'crown',
    fastMoneyScore: 150,
    totalMatchScore: 410,
    passedThreshold: true,
  },
  {
    id: 'seed-p-4',
    timestamp: Date.now() - 86400000 * 1,
    dateStr: 'Nov 08',
    mode: 'PARTY',
    playerName: 'Living Room All-Stars',
    avatar: 'flame',
    fastMoneyScore: 135,
    totalMatchScore: 375,
    passedThreshold: false,
  },
  {
    id: 'seed-p-5',
    timestamp: Date.now() - 3600000 * 8,
    dateStr: 'Nov 09',
    mode: 'PARTY',
    playerName: 'Game Night Kings',
    avatar: 'peace',
    fastMoneyScore: 120,
    totalMatchScore: 345,
    passedThreshold: false,
  },
];

/**
 * Loads all Fast Money leaderboard entries from localStorage.
 */
export function getAllFastMoneyEntries(): FastMoneyLeaderboardEntry[] {
  if (typeof window === 'undefined') return SEED_LEADERBOARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LEADERBOARDS));
      return SEED_LEADERBOARDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_LEADERBOARDS;
  } catch (err) {
    console.error('Failed to read Fast Money leaderboard from localStorage:', err);
    return SEED_LEADERBOARDS;
  }
}

/**
 * Returns the top 5 highest-scoring Fast Money final rounds for a given mode.
 */
export function getTopFastMoneyByMode(mode: string, limit: number = 5): FastMoneyLeaderboardEntry[] {
  const all = getAllFastMoneyEntries();
  const normalizedMode = mode.toUpperCase();

  const filtered = all.filter((entry) => entry.mode.toUpperCase() === normalizedMode);
  filtered.sort((a, b) => b.fastMoneyScore - a.fastMoneyScore);

  return filtered.slice(0, limit);
}

/**
 * Saves a new Fast Money final round score to the localStorage leaderboard.
 */
export function recordFastMoneyScore(
  entry: Omit<FastMoneyLeaderboardEntry, 'id' | 'timestamp' | 'dateStr' | 'passedThreshold'> & {
    id?: string;
    passedThreshold?: boolean;
  }
): FastMoneyLeaderboardEntry {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;

  const fullEntry: FastMoneyLeaderboardEntry = {
    id: entry.id || `fm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    dateStr,
    mode: entry.mode.toUpperCase(),
    playerName: entry.playerName,
    avatar: entry.avatar || 'crown',
    fastMoneyScore: entry.fastMoneyScore,
    totalMatchScore: entry.totalMatchScore,
    passedThreshold: entry.fastMoneyScore >= 150,
    isRecent: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const all = getAllFastMoneyEntries();
      // Avoid duplicate insertion for identical id
      const exists = all.some((e) => e.id === fullEntry.id);
      if (!exists) {
        all.unshift(fullEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
    } catch (err) {
      console.error('Failed to save Fast Money score to localStorage:', err);
    }
  }

  return fullEntry;
}

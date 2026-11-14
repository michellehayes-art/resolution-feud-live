/**
 * Viral Frenemy Challenge & Community Harmony Bounty System
 * Manages unique challenge links, referral tracking, kickback points,
 * and community-wide viral harmony leaderboards.
 */

export interface FrenemyChallenge {
  id: string;
  code: string;
  challengerName: string;
  challengerAvatar: string;
  targetScore: number;
  banterMessage: string;
  mode: string;
  createdAt: number;
  friendsPlayedCount: number;
  harmonyPointsEarned: number;
}

export interface CommunityFrenemyLeader {
  id: string;
  name: string;
  avatar: string;
  frenemiesInvited: number;
  frenemiesConverted: number;
  totalViralHarmonyPoints: number;
  rankTitle: string;
  isCurrentUser?: boolean;
}

export interface IncomingChallenge {
  id: string;
  code: string;
  challengerName: string;
  targetScore: number;
  banterMessage: string;
  mode: string;
}

const STORAGE_KEY_CHALLENGES = 'rf_frenemy_challenges';
const STORAGE_KEY_PROFILE = 'rf_frenemy_user_profile';
const STORAGE_KEY_INCOMING = 'rf_pending_incoming_challenge';
const STORAGE_KEY_COMMUNITY = 'rf_community_frenemy_scores';

// Default banter options
export const FRENEMY_BANTER_PRESETS = [
  'I bet you $10 you cannot out-compromise me on household chores! 🧹',
  'Think you are the master peacemaker? Prove it on Resolution Feud! 👑',
  'Roses are red, your arguments are blue, come see if you can beat my Harmony score! 🌹',
  'Calling out my favorite frenemy: let us settle our relationship beef once and for all! ⚔️',
  'Are you emotionally intelligent or just loud? Let us find out on stage! 🧠',
  'If you can beat my harmony score, next dinner is on me. If not, you do the dishes! 🍽️',
];

// Helper to generate a 6-character random referral code
export function generateChallengeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get user profile for challenger
export function getUserChallengerProfile(): { name: string; avatar: string } {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PROFILE) : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { name: 'Player 1', avatar: 'crown' };
}

export function saveUserChallengerProfile(profile: { name: string; avatar: string }): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    }
  } catch {
    // ignore
  }
}

// Get all created challenges
export function getFrenemyChallenges(): FrenemyChallenge[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CHALLENGES) : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

// Save all challenges
export function saveFrenemyChallenges(challenges: FrenemyChallenge[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
    }
  } catch {
    // ignore
  }
}

// Total viral harmony bounty points user earned from frenemies playing
export function getUserTotalViralPoints(): number {
  const challenges = getFrenemyChallenges();
  return challenges.reduce((sum, c) => sum + (c.harmonyPointsEarned || 0), 0);
}

// Create and register a new Frenemy challenge
export function createFrenemyChallenge(params: {
  challengerName: string;
  challengerAvatar?: string;
  targetScore: number;
  banterMessage: string;
  mode?: string;
}): FrenemyChallenge {
  const code = generateChallengeCode();
  const id = `fc-${Date.now()}-${code}`;
  const newChallenge: FrenemyChallenge = {
    id,
    code,
    challengerName: params.challengerName.trim() || 'Anonymous Challenger',
    challengerAvatar: params.challengerAvatar || 'crown',
    targetScore: params.targetScore || 250,
    banterMessage: params.banterMessage || FRENEMY_BANTER_PRESETS[0],
    mode: params.mode || 'COUPLES',
    createdAt: Date.now(),
    friendsPlayedCount: 0,
    harmonyPointsEarned: 0,
  };

  const existing = getFrenemyChallenges();
  const updated = [newChallenge, ...existing];
  saveFrenemyChallenges(updated);

  // Save profile name
  saveUserChallengerProfile({
    name: newChallenge.challengerName,
    avatar: newChallenge.challengerAvatar,
  });

  return newChallenge;
}

// Construct unique shareable challenge URL
export function buildChallengeUrl(challenge: FrenemyChallenge): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const params = new URLSearchParams({
    fc_ref: '1',
    cid: challenge.id,
    code: challenge.code,
    challenger: challenge.challengerName,
    target: String(challenge.targetScore),
    mode: challenge.mode,
    banter: challenge.banterMessage,
  });
  return `${origin}/?${params.toString()}`;
}

// Parse URL search parameters on app mount to check if opened via a Frenemy Challenge link
export function parseIncomingChallengeFromUrl(searchString: string): IncomingChallenge | null {
  if (!searchString) return null;
  try {
    const params = new URLSearchParams(searchString);
    if (params.get('fc_ref') === '1' || params.has('cid')) {
      const id = params.get('cid') || `fc-${params.get('code') || 'referral'}`;
      const code = params.get('code') || 'FEUD99';
      const challengerName = params.get('challenger') || 'Your Frenemy';
      const targetScore = parseInt(params.get('target') || '250', 10);
      const banterMessage = params.get('banter') || 'Think you can beat my Harmony score? Prove it!';
      const mode = params.get('mode') || 'COUPLES';

      const incoming: IncomingChallenge = {
        id,
        code,
        challengerName,
        targetScore,
        banterMessage,
        mode,
      };

      // Store in session storage so it persists during current gameplay
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_INCOMING, JSON.stringify(incoming));
      }

      return incoming;
    }
  } catch {
    // ignore
  }
  return null;
}

// Get active pending incoming challenge if player accepted one
export function getPendingIncomingChallenge(): IncomingChallenge | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(STORAGE_KEY_INCOMING);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearPendingIncomingChallenge(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_INCOMING);
    }
  } catch {
    // ignore
  }
}

// Record match completion: friend finished game, award kickback points to the challenge creator
export function recordFriendPlayedChallenge(
  challengeId: string,
  friendName: string,
  matchScore: number
): { pointsAwarded: number; challengeFound: boolean } {
  // Bonus: Challenger gets 50% kickback of friend's match score + 50 viral bonus points!
  const kickbackPoints = Math.max(50, Math.floor(matchScore * 0.5) + 50);

  const challenges = getFrenemyChallenges();
  let challengeFound = false;

  const updated = challenges.map((c) => {
    if (c.id === challengeId || c.code === challengeId) {
      challengeFound = true;
      return {
        ...c,
        friendsPlayedCount: (c.friendsPlayedCount || 0) + 1,
        harmonyPointsEarned: (c.harmonyPointsEarned || 0) + kickbackPoints,
      };
    }
    return c;
  });

  if (challengeFound) {
    saveFrenemyChallenges(updated);
  }

  return { pointsAwarded: kickbackPoints, challengeFound };
}

// Simulate a frenemy accepting and playing a challenge (for interactive testing & instant gratification)
export function simulateFrenemyMatchCompletion(challengeId: string): {
  friendName: string;
  friendScore: number;
  pointsEarnedForUser: number;
} {
  const friends = [
    'Taylor Swift-Negotiator',
    'Jordan & Casey',
    'Alex the Compromiser',
    'Rival Dave',
    'Morgan the Diplomat',
    'Coach Riley',
  ];
  const pickedFriend = friends[Math.floor(Math.random() * friends.length)];
  const friendScore = Math.floor(Math.random() * 140) + 180;
  const kickback = Math.max(50, Math.floor(friendScore * 0.5) + 50);

  const challenges = getFrenemyChallenges();
  const updated = challenges.map((c) => {
    if (c.id === challengeId) {
      return {
        ...c,
        friendsPlayedCount: (c.friendsPlayedCount || 0) + 1,
        harmonyPointsEarned: (c.harmonyPointsEarned || 0) + kickback,
      };
    }
    return c;
  });
  saveFrenemyChallenges(updated);

  return {
    friendName: pickedFriend,
    friendScore,
    pointsEarnedForUser: kickback,
  };
}

// Community Frenemy Viral Leaderboard
export function getCommunityFrenemyLeaderboard(): CommunityFrenemyLeader[] {
  const userProfile = getUserChallengerProfile();
  const userChallenges = getFrenemyChallenges();
  const userTotalPoints = userChallenges.reduce((sum, c) => sum + (c.harmonyPointsEarned || 0), 0);
  const userFriendsCount = userChallenges.reduce((sum, c) => sum + (c.friendsPlayedCount || 0), 0);

  let userTitle = '🌱 Fresh Instigator';
  if (userTotalPoints >= 1200) userTitle = '🌌 Supreme Diplomatic Influencer';
  else if (userTotalPoints >= 750) userTitle = '🔥 Viral Peacemaker Legend';
  else if (userTotalPoints >= 400) userTitle = '👑 Master Frenemy Slayer';
  else if (userTotalPoints >= 150) userTitle = '⚔️ Diplomatic Provocateur';

  const userLeader: CommunityFrenemyLeader = {
    id: 'user-current',
    name: `${userProfile.name} (You)`,
    avatar: userProfile.avatar || 'crown',
    frenemiesInvited: userChallenges.length,
    frenemiesConverted: userFriendsCount,
    totalViralHarmonyPoints: userTotalPoints,
    rankTitle: userTitle,
    isCurrentUser: true,
  };

  // Seeded top competitors from the community to foster playful competition
  const seedLeaders: CommunityFrenemyLeader[] = [
    {
      id: 'comm-1',
      name: 'Michelle H. & Jordan',
      avatar: 'sparkles',
      frenemiesInvited: 12,
      frenemiesConverted: 9,
      totalViralHarmonyPoints: 1480,
      rankTitle: '🌌 Supreme Diplomatic Influencer',
    },
    {
      id: 'comm-2',
      name: 'Marcus the Peacemaker',
      avatar: 'crown',
      frenemiesInvited: 8,
      frenemiesConverted: 6,
      totalViralHarmonyPoints: 920,
      rankTitle: '🔥 Viral Peacemaker Legend',
    },
    {
      id: 'comm-3',
      name: 'Sarah & Dave (The Debaters)',
      avatar: 'fire',
      frenemiesInvited: 7,
      frenemiesConverted: 5,
      totalViralHarmonyPoints: 680,
      rankTitle: '👑 Master Frenemy Slayer',
    },
    {
      id: 'comm-4',
      name: 'Taylor & Sam',
      avatar: 'heart',
      frenemiesInvited: 5,
      frenemiesConverted: 4,
      totalViralHarmonyPoints: 490,
      rankTitle: '👑 Master Frenemy Slayer',
    },
    {
      id: 'comm-5',
      name: 'Alex & Jordan',
      avatar: 'robot',
      frenemiesInvited: 3,
      frenemiesConverted: 2,
      totalViralHarmonyPoints: 260,
      rankTitle: '⚔️ Diplomatic Provocateur',
    },
  ];

  const all = [userLeader, ...seedLeaders];
  all.sort((a, b) => b.totalViralHarmonyPoints - a.totalViralHarmonyPoints);
  return all;
}

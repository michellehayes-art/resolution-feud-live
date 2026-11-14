export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  badgeColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'crown',
    name: 'Royalty',
    emoji: '👑',
    bgGradient: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-400',
    badgeColor: 'bg-amber-400 text-slate-950',
  },
  {
    id: 'heart',
    name: 'Sweetheart',
    emoji: '💖',
    bgGradient: 'from-rose-500 to-pink-600',
    borderColor: 'border-pink-400',
    badgeColor: 'bg-pink-400 text-slate-950',
  },
  {
    id: 'owl',
    name: 'Wise Owl',
    emoji: '🦉',
    bgGradient: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-400',
    badgeColor: 'bg-blue-400 text-slate-950',
  },
  {
    id: 'fox',
    name: 'Clever Fox',
    emoji: '🦊',
    bgGradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-400',
    badgeColor: 'bg-orange-400 text-slate-950',
  },
  {
    id: 'dove',
    name: 'Peacemaker',
    emoji: '🕊️',
    bgGradient: 'from-teal-500 to-emerald-600',
    borderColor: 'border-emerald-400',
    badgeColor: 'bg-emerald-400 text-slate-950',
  },
  {
    id: 'flame',
    name: 'Spicy Fire',
    emoji: '🔥',
    bgGradient: 'from-red-500 to-orange-500',
    borderColor: 'border-red-400',
    badgeColor: 'bg-red-400 text-slate-950',
  },
  {
    id: 'star',
    name: 'Superstar',
    emoji: '⭐',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-300 text-slate-950',
  },
  {
    id: 'lightning',
    name: 'Quick Spark',
    emoji: '⚡',
    bgGradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-300',
    badgeColor: 'bg-amber-300 text-slate-950',
  },
  {
    id: 'coffee',
    name: 'Calm Coffee',
    emoji: '☕',
    bgGradient: 'from-stone-600 to-amber-900',
    borderColor: 'border-stone-400',
    badgeColor: 'bg-stone-300 text-slate-950',
  },
  {
    id: 'robot',
    name: 'Coach Bot',
    emoji: '🤖',
    bgGradient: 'from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-400',
    badgeColor: 'bg-cyan-400 text-slate-950',
  },
  {
    id: 'lion',
    name: 'Brave Lion',
    emoji: '🦁',
    bgGradient: 'from-amber-600 to-yellow-600',
    borderColor: 'border-yellow-400',
    badgeColor: 'bg-yellow-400 text-slate-950',
  },
  {
    id: 'rocket',
    name: 'Fast Rocket',
    emoji: '🚀',
    bgGradient: 'from-violet-600 to-purple-800',
    borderColor: 'border-purple-400',
    badgeColor: 'bg-purple-400 text-slate-950',
  },
  {
    id: 'sparkles',
    name: 'Magic Vibes',
    emoji: '✨',
    bgGradient: 'from-fuchsia-500 to-pink-600',
    borderColor: 'border-fuchsia-400',
    badgeColor: 'bg-fuchsia-400 text-slate-950',
  },
  {
    id: 'peace',
    name: 'Zen Harmony',
    emoji: '☮️',
    bgGradient: 'from-emerald-600 to-green-700',
    borderColor: 'border-green-400',
    badgeColor: 'bg-green-400 text-slate-950',
  },
  {
    id: 'sun',
    name: 'Sunshine',
    emoji: '☀️',
    bgGradient: 'from-amber-400 to-orange-400',
    borderColor: 'border-amber-300',
    badgeColor: 'bg-amber-300 text-slate-950',
  },
  {
    id: 'shield',
    name: 'Protector',
    emoji: '🛡️',
    bgGradient: 'from-blue-700 to-indigo-900',
    borderColor: 'border-indigo-400',
    badgeColor: 'bg-indigo-300 text-slate-950',
  },
];

export const DEFAULT_TEAM1_AVATAR = 'crown';
export const DEFAULT_TEAM2_AVATAR = 'heart';
export const DEFAULT_BOT_AVATAR = 'robot';

export function getAvatarById(id?: string): AvatarOption {
  if (!id) return AVATAR_OPTIONS[0];
  const found = AVATAR_OPTIONS.find((a) => a.id === id);
  return found || AVATAR_OPTIONS[0];
}

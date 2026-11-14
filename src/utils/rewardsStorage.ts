/**
 * Harmony Rewards & Digital Voucher Redemption System
 * Enables players to spend accrued Harmony Points on digital vouchers
 * (e.g. Dinner-on-Me, A Dozen Roses) and share them directly to an opponent's device.
 */

import { getGameHistory } from './historyStorage';

export interface RewardItem {
  id: string;
  voucherType: 'dozen-roses' | 'dinner-on-me' | 'back-massage' | 'lunch-date' | 'breakfast-in-bed' | 'ice-cream';
  title: string;
  subtitle: string;
  cost: number; // in Harmony Points
  emoji: string;
  category: 'Romantic' | 'Tasty' | 'Pampering' | 'Fun';
  badgeColor: string;
  borderColor: string;
  gradient: string;
  pledge: string;
  finePrint: string;
}

export type VoucherTemplateTheme =
  | 'ROYAL_GOLD'
  | 'ROMANTIC_ROSE'
  | 'RETRO_TICKET'
  | 'ZEN_SPA'
  | 'COSMIC_STARLIGHT';

export interface DateNightExperience {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  emoji: string;
  category: 'Pampering' | 'Romantic' | 'Culinary' | 'Fun';
  defaultTemplate: VoucherTemplateTheme;
  defaultPledge: string;
  defaultFinePrint: string;
}

export const DATE_NIGHT_EXPERIENCES: DateNightExperience[] = [
  {
    id: 'back-massage-coupon',
    title: 'Free Back Massage Coupon',
    subtitle: 'Candlelit Tension Release & Pampering',
    cost: 75,
    emoji: '💆',
    category: 'Pampering',
    defaultTemplate: 'ZEN_SPA',
    defaultPledge:
      'This coupon entitles the bearer to 15 full minutes of deluxe back, neck, and shoulder massage with soothing lavender essential oils, spa ambient music, and zero phone distractions.',
    defaultFinePrint: 'Strict minimum of 15 full minutes. Timer must be visible on the nightstand. Deep sighs encouraged.',
  },
  {
    id: 'home-cooked-dinner-pass',
    title: 'Home-Cooked Dinner Pass',
    subtitle: 'Full 3-Course Feast + Zero Dish Duty',
    cost: 100,
    emoji: '🍝',
    category: 'Culinary',
    defaultTemplate: 'ROYAL_GOLD',
    defaultPledge:
      'The bearer is granted one homemade 3-course dinner cooked completely from scratch! Issuer handles grocery prep, candlelit plating, wine or cocktail pairing, and 100% of kitchen cleanup and dish scrubbing.',
    defaultFinePrint: 'Bearer chooses the entree and dessert. Zero complaints regarding kitchen splatter permitted.',
  },
  {
    id: 'movie-night-czar',
    title: 'Movie Night Czar Ticket',
    subtitle: 'Absolute Remote & Film Selection Control',
    cost: 50,
    emoji: '🎬',
    category: 'Fun',
    defaultTemplate: 'RETRO_TICKET',
    defaultPledge:
      'Admits 1 privileged partner to total, uncontested remote control dominion. Bearer selects the film or binge series, seating arrangement, and snack menu with fresh buttered popcorn delivered on demand.',
    defaultFinePrint: 'No sighing, phone-scrolling, or questioning the film plot allowed from the non-bearer.',
  },
  {
    id: 'breakfast-in-bed-pass',
    title: 'Breakfast in Bed & Royal Coffee Pass',
    subtitle: 'Lazy Weekend Morning Indulgence',
    cost: 60,
    emoji: '☕',
    category: 'Culinary',
    defaultTemplate: 'ROYAL_GOLD',
    defaultPledge:
      'Warm golden croissants, fresh seasonal berries, and steaming custom espresso served directly to your bedside pillow. Bearer gets to sleep in as long as desired with zero morning chore reminders.',
    defaultFinePrint: 'Valid any Saturday or Sunday morning upon verbal summon from under the blankets.',
  },
  {
    id: 'midnight-ice-cream-run',
    title: 'Midnight Pajama Ice Cream Run',
    subtitle: 'Spontaneous Late-Night Sweet Truce',
    cost: 45,
    emoji: '🍨',
    category: 'Fun',
    defaultTemplate: 'COSMIC_STARLIGHT',
    defaultPledge:
      'A spontaneous late-night car excursion in oversized sweatpants to pick up waffle cones, sundaes, or pints. Bearer gets first choice of flavors and all extra hot fudge toppings fully covered.',
    defaultFinePrint: 'Singing aloud to car playlist highly encouraged. Zero calorie-counting or guilt allowed.',
  },
  {
    id: 'scenic-day-trip-pass',
    title: 'Scenic Day-Trip Getaway Pass',
    subtitle: 'Weekend Escape to Your Chosen Destination',
    cost: 120,
    emoji: '🚗',
    category: 'Romantic',
    defaultTemplate: 'ROMANTIC_ROSE',
    defaultPledge:
      'A full day of adventure, fresh scenery, and scenic strolls. The bearer selects the destination (coast, mountain, vineyard, or charming town), and issuer acts as chauffeur, tour guide, and snack provider.',
    defaultFinePrint: 'Issuer provides car snacks, coffee stops, and playlist control. No rush to return home.',
  },
  {
    id: 'chore-immunity-pass',
    title: '24-Hour Chore Immunity Pass',
    subtitle: 'Zero Dishes, Laundry, or Trash for a Full Day',
    cost: 85,
    emoji: '🚫',
    category: 'Pampering',
    defaultTemplate: 'ZEN_SPA',
    defaultPledge:
      'The bearer is granted complete 24-hour immunity from all household tasks: loading the dishwasher, taking out trash, laundry folding, or tidying up. Issuer assumes all duties with a cheerful smile.',
    defaultFinePrint: 'Cannot be overridden by chore charts. Issuer agrees to maintain pleasant countenance.',
  },
  {
    id: 'dozen-roses-sweet-treats',
    title: 'Dozen Roses & Sweet Treats Pass',
    subtitle: 'The Ultimate Affectionate Truce',
    cost: 95,
    emoji: '🌹',
    category: 'Romantic',
    defaultTemplate: 'ROMANTIC_ROSE',
    defaultPledge:
      'Bearer is officially presented with one dozen fresh long-stem roses, artisan chocolates or pastries, and a heartfelt handwritten note highlighting 3 things the issuer deeply loves about them.',
    defaultFinePrint: 'Delivered with a courtly bow and genuine warmth. Preserves peace for 30 consecutive days.',
  },
];

export interface PurchasedVoucher {
  id: string;
  voucherType: string;
  title: string;
  code: string;
  sender: string;
  recipient: string;
  cost: number;
  issuedAt: number;
  pledge: string;
  finePrint: string;
  emoji: string;
}

export const REDEEMABLE_REWARDS: RewardItem[] = [
  {
    id: 'dinner-on-me',
    voucherType: 'dinner-on-me',
    title: 'Dinner On Me (Winner’s Choice!)',
    subtitle: 'Gourmet Dispute Settlement',
    cost: 150,
    emoji: '🍝',
    category: 'Tasty',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    gradient: 'from-amber-950/90 via-yellow-950/70 to-slate-950',
    pledge:
      'One all-inclusive magnificent dinner date at the restaurant of your choice! Appetizers, entrees, cocktails, and decadent desserts fully covered by the issuer.',
    finePrint: 'Winner selects the cuisine, radio playlist on the drive, and reserves full dessert rights.',
  },
  {
    id: 'dozen-roses',
    voucherType: 'dozen-roses',
    title: 'A Dozen Roses & Fragrant Perfume',
    subtitle: 'The Classic Romantic Truce',
    cost: 100,
    emoji: '🌹',
    category: 'Romantic',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    gradient: 'from-rose-950/90 via-pink-950/70 to-slate-950',
    pledge:
      'The bearer is officially awarded one dozen fresh long-stem roses and a delightful bottle of their favorite fragrance, presented with a dramatic royal bow!',
    finePrint: 'Redeemable anytime. Complaints, grumbling, or eye rolls strictly forbidden by game rules.',
  },
  {
    id: 'back-massage',
    voucherType: 'back-massage',
    title: '15-Minute Deluxe Back Massage',
    subtitle: 'Candlelit Tension Release',
    cost: 80,
    emoji: '💆',
    category: 'Pampering',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
    gradient: 'from-emerald-950/90 via-teal-950/70 to-slate-950',
    pledge:
      '15 minutes of uninterrupted shoulder, neck, and back pampering with soothing essential oils, relaxing spa lo-fi music, and zero phone distractions.',
    finePrint: 'Strict minimum of 15 full minutes. Timer must be visible. Deep sighs of relief encouraged.',
  },
  {
    id: 'lunch-date',
    voucherType: 'lunch-date',
    title: 'Official Lunch Date Invitation',
    subtitle: 'Midday Sweet Truce',
    cost: 75,
    emoji: '🍱',
    category: 'Tasty',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/50 hover:border-blue-400',
    gradient: 'from-blue-950/90 via-indigo-950/70 to-slate-950',
    pledge:
      'A formal peace pact: You are cordially invited out for sushi, artisan burgers, or tacos this week to celebrate laughing off our differences!',
    finePrint: 'Valid during any standard lunch hour. Both parties agree to talk exclusively about fun dreams.',
  },
  {
    id: 'breakfast-in-bed',
    voucherType: 'breakfast-in-bed',
    title: 'Breakfast in Bed & Royal Coffee Pass',
    subtitle: 'Weekend Morning Indulgence',
    cost: 60,
    emoji: '☕',
    category: 'Pampering',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    borderColor: 'border-orange-500/50 hover:border-orange-400',
    gradient: 'from-orange-950/90 via-amber-950/70 to-slate-950',
    pledge:
      'Golden pancakes or avocado toast, fresh berries, and steaming custom coffee served directly to your bedside pillow on a lazy weekend morning.',
    finePrint: 'Recipient gets to sleep in as long as desired without disruption or chore requests.',
  },
  {
    id: 'ice-cream',
    voucherType: 'ice-cream',
    title: 'Midnight Pajama Ice Cream Run',
    subtitle: 'Comfort Food Truce',
    cost: 50,
    emoji: '🍨',
    category: 'Fun',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    gradient: 'from-purple-950/90 via-fuchsia-950/70 to-slate-950',
    pledge:
      'A spontaneous late-night drive in oversized sweatpants to pick up waffle cones or pints. Winner gets first choice of flavors and extra fudge toppings!',
    finePrint: 'Car singing permitted and highly encouraged. Zero counting of calories allowed.',
  },
];

const STORAGE_KEY_SPENT = 'rf_harmony_points_spent';
const STORAGE_KEY_VOUCHERS = 'rf_purchased_vouchers';

// Get total spent points
export function getSpentHarmonyPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPENT);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

// Compute total available Harmony Points balance for current session & history
export function getAccruedHarmonyPointsBalance(currentMatchPoints: number = 0): number {
  try {
    const history = getGameHistory();
    const historicalTotal = history.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const spent = getSpentHarmonyPoints();
    // Guarantee player has sufficient demo points if new user
    const gross = Math.max(350, historicalTotal + currentMatchPoints);
    return Math.max(0, gross - spent);
  } catch {
    return Math.max(200, currentMatchPoints);
  }
}

// Deduct points when purchasing a voucher
export function spendHarmonyPoints(points: number): number {
  if (typeof window === 'undefined') return 0;
  try {
    const currentSpent = getSpentHarmonyPoints();
    const updatedSpent = currentSpent + points;
    localStorage.setItem(STORAGE_KEY_SPENT, String(updatedSpent));
    return updatedSpent;
  } catch {
    return 0;
  }
}

// Get all previously purchased vouchers
export function getPurchasedVouchers(): PurchasedVoucher[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOUCHERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save newly purchased voucher
export function savePurchasedVoucher(voucher: PurchasedVoucher): PurchasedVoucher[] {
  if (typeof window === 'undefined') return [voucher];
  try {
    const current = getPurchasedVouchers();
    const updated = [voucher, ...current];
    localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(updated));
    return updated;
  } catch {
    return [voucher];
  }
}

// Generate serial verification code for voucher
export function generateVoucherCode(prefix: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${rand}`;
}

// Build shareable voucher URL for opponent's device
export function buildVoucherShareUrl(voucher: PurchasedVoucher): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const params = new URLSearchParams({
    rf_voucher: '1',
    vtype: voucher.voucherType,
    vtitle: voucher.title,
    vcode: voucher.code,
    from: voucher.sender,
    to: voucher.recipient,
    pts: String(voucher.cost),
    date: String(voucher.issuedAt),
  });
  return `${origin}/?${params.toString()}`;
}

// Parse voucher data if opened on opponent's device
export function parseVoucherFromUrl(searchString: string): PurchasedVoucher | null {
  if (!searchString) return null;
  try {
    const params = new URLSearchParams(searchString);
    if (params.get('rf_voucher') === '1') {
      const vtype = params.get('vtype') || 'dinner-on-me';
      const baseReward = REDEEMABLE_REWARDS.find((r) => r.voucherType === vtype) || REDEEMABLE_REWARDS[0];

      return {
        id: `vouch-${params.get('vcode') || Date.now()}`,
        voucherType: vtype,
        title: params.get('vtitle') || baseReward.title,
        code: params.get('vcode') || 'FEUD-LOVE',
        sender: params.get('from') || 'Your Rival / Partner',
        recipient: params.get('to') || 'You',
        cost: parseInt(params.get('pts') || '100', 10),
        issuedAt: parseInt(params.get('date') || String(Date.now()), 10),
        pledge: baseReward.pledge,
        finePrint: baseReward.finePrint,
        emoji: baseReward.emoji,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

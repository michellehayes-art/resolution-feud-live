import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  Check,
  Zap,
  Heart,
  Shield,
  DollarSign,
  Crown,
  Ticket,
  Printer,
} from 'lucide-react';
import { ExperienceGallery } from './ExperienceGallery';
import { sounds } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PackItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  price: string;
  questionsCount: number;
  highlight?: boolean;
}

const EXPANSION_PACKS: PackItem[] = [
  {
    id: 'spicy_romance',
    title: 'Spicy & Romance Edition (Playable Now!)',
    category: 'Intimacy & Dating',
    tagline: 'Love languages, date night sparks, intimacy communication & unspoken romantic desires. Playable directly from the Lobby!',
    price: '$2.99',
    questionsCount: 20,
    highlight: true,
  },
  {
    id: 'newlyweds_marriage',
    title: 'Newlyweds & Marriage Pack',
    category: 'Long-term Partnership',
    tagline: 'Joint bank accounts, splitting the holidays between families, and post-wedding realities.',
    price: '$2.99',
    questionsCount: 25,
  },
  {
    id: 'roommate_wars',
    title: 'Roommates & Friends Edition',
    category: 'Co-Living & Friendships',
    tagline: 'Labeling milk in the fridge, late-night noise, chores charts and lending money to friends.',
    price: '$1.99',
    questionsCount: 20,
  },
  {
    id: 'in_laws_extended',
    title: 'In-Laws & Extended Family',
    category: 'Family Dynamics',
    tagline: 'Unsolicited parenting tips, drop-in visits, holiday dinner politics & seating charts.',
    price: '$1.99',
    questionsCount: 18,
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'experiences' | 'decks'>('experiences');
  const [unlockedPacks, setUnlockedPacks] = useState<string[]>([]);
  const [simulatedSuccess, setSimulatedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePurchase = (packTitle: string, packId: string) => {
    sounds.playWinFanfare();
    setUnlockedPacks((prev) => [...prev, packId]);
    setSimulatedSuccess(`Success! In a published Google Play release, Google Play In-App Billing processes "${packTitle}"!`);
    setTimeout(() => setSimulatedSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/40 shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-left custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                Resolution Feud Marketplace
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Store &amp; Experience Gallery
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Redeem earned Harmony Points for printable date night vouchers or unlock premium Google Play decks
              </p>
            </div>
          </div>
        </div>

        {/* Top Tab Bar: Experience Gallery vs Decks */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveTab('experiences');
            }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'experiences'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Experience Gallery (Date Night Vouchers)</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[9px] font-mono">
              Points
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setActiveTab('decks');
            }}
            className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'decks'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Premium Decks &amp; VIP Pass</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 text-[9px]">
              Store
            </span>
          </button>
        </div>

        {simulatedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold mb-4 animate-fadeIn flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{simulatedSuccess}</span>
          </div>
        )}

        {/* TAB 1: EXPERIENCE GALLERY (PRINTABLE DATE NIGHT VOUCHERS) */}
        {activeTab === 'experiences' && (
          <ExperienceGallery />
        )}

        {/* TAB 2: PREMIUM EXPANSION PACKS & VIP PASS */}
        {activeTab === 'decks' && (
          <div className="space-y-6 animate-fadeIn">
            {/* VIP Pass Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-400/60 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" /> VIP Peacemaker Pass
                  </div>
                  <h4 className="text-lg font-bold text-white">Unlock All Decks + Unlimited AI Debates</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Zero ads, all current &amp; future conflict packs, plus unlimited custom AI dispute rounds.
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto text-right">
                  <div className="text-2xl font-black text-amber-300">
                    $7.99 <span className="text-xs font-normal text-slate-400">once</span>
                  </div>
                  <button
                    onClick={() => handleSimulatePurchase('VIP Peacemaker Pass', 'vip_lifetime')}
                    className="mt-1 w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
                  >
                    {unlockedPacks.includes('vip_lifetime') ? 'Unlocked ✓' : 'Unlock All Decks'}
                  </button>
                </div>
              </div>
            </div>

            {/* Individual Expansion Packs */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Individual Themed Expansion Packs ($1.99 - $2.99 each):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPANSION_PACKS.map((pack) => {
                  const isUnlocked = unlockedPacks.includes(pack.id) || unlockedPacks.includes('vip_lifetime');
                  return (
                    <div
                      key={pack.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        pack.highlight
                          ? 'bg-slate-900 border-amber-500/50'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                            {pack.category}
                          </span>
                          <span className="font-mono font-bold text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {pack.questionsCount} rounds
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-sm">{pack.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.tagline}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-amber-300">{pack.price}</span>
                        <button
                          onClick={() => handleSimulatePurchase(pack.title, pack.id)}
                          disabled={isUnlocked}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            isUnlocked
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                          }`}
                        >
                          {isUnlocked ? 'Unlocked' : `Buy (${pack.price})`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Explanatory footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              {activeTab === 'experiences'
                ? 'Print coupons on standard paper or beam them digitally to your partner.'
                : 'Google Play In-App Billing (Google takes 15% under $1M/yr, you keep 85%).'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-bold transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

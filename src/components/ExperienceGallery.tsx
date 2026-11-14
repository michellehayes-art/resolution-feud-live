import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Palette,
  Send,
  MessageCircle,
  Scissors,
  Calendar,
  Gift,
  Award,
  Crown,
  Flame,
  Utensils,
  Coffee,
  Ticket,
} from 'lucide-react';
import {
  DATE_NIGHT_EXPERIENCES,
  DateNightExperience,
  VoucherTemplateTheme,
  getAccruedHarmonyPointsBalance,
  spendHarmonyPoints,
  savePurchasedVoucher,
  getPurchasedVouchers,
  generateVoucherCode,
  PurchasedVoucher,
} from '../utils/rewardsStorage';
import { sounds } from '../utils/audio';
import { HarmonyBurst } from './HarmonyBurst';
import { UnwrapVoucherModal, UnwrappedVoucherData } from './UnwrapVoucherModal';
import { DateNightAudioPlayer } from './DateNightAudioPlayer';
import { dateNightAudio } from '../utils/dateNightVibeAudio';
import { CouplePodiumBuzzer } from './CouplePodiumBuzzer';

interface ExperienceGalleryProps {
  onPointsUpdated?: (newBalance: number) => void;
}

export const ExperienceGallery: React.FC<ExperienceGalleryProps> = ({ onPointsUpdated }) => {
  const [balance, setBalance] = useState<number>(() => getAccruedHarmonyPointsBalance());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isHarmonyBurstActive, setIsHarmonyBurstActive] = useState(false);

  // Currently selected experience
  const [selectedExperience, setSelectedExperience] = useState<DateNightExperience>(
    DATE_NIGHT_EXPERIENCES[0]
  );

  // Template Theme
  const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplateTheme>(
    DATE_NIGHT_EXPERIENCES[0].defaultTemplate
  );

  // Customization Form Fields
  const [recipientName, setRecipientName] = useState('My Sweetheart');
  const [issuerName, setIssuerName] = useState('Your Loving Partner');
  const [customPledge, setCustomPledge] = useState(DATE_NIGHT_EXPERIENCES[0].defaultPledge);
  const [customFinePrint, setCustomFinePrint] = useState(DATE_NIGHT_EXPERIENCES[0].defaultFinePrint);
  const [serialCode, setSerialCode] = useState(() => generateVoucherCode('DATE'));

  // Feedback & QR Code State
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Redeemed Vouchers Storage State
  const [purchasedVouchers, setPurchasedVouchers] = useState<PurchasedVoucher[]>(() => {
    const saved = getPurchasedVouchers();
    if (saved.length > 0) return saved;
    // Default starter gift so user can immediately experience 3D unwrap without spending points
    return [
      {
        id: 'starter-vouch-roses',
        voucherType: 'dozen-roses-sweet-treats',
        title: 'Dozen Roses & Sweet Treats Pass',
        code: 'ROSE-GIFT',
        sender: 'Your Loving Partner',
        recipient: 'My Sweetheart',
        cost: 95,
        issuedAt: Date.now() - 3600000,
        pledge:
          'Bearer is officially presented with one dozen fresh long-stem roses, artisan chocolates, and a heartfelt note of affection. All arguments dissolved in sweet laughter!',
        finePrint: 'Delivered with a courtly bow and genuine warmth. Preserves peace for 30 consecutive days.',
        emoji: '🌹',
      },
    ];
  });

  // 3D Unwrap Voucher Modal State
  const [activeUnwrapVoucher, setActiveUnwrapVoucher] = useState<UnwrappedVoucherData | null>(null);
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false);

  // Open 3D Unwrap Modal for any voucher
  const handleOpenUnwrapForVoucher = (v: PurchasedVoucher | UnwrappedVoucherData) => {
    sounds.playTick();
    if (dateNightAudio.getState().autoPlayOnUnwrap && !dateNightAudio.getState().isPlaying) {
      dateNightAudio.play();
    }
    setActiveUnwrapVoucher({
      title: v.title,
      subtitle: (v as UnwrappedVoucherData).subtitle || 'Official Redeemable Relationship Experience',
      emoji: v.emoji || '🎁',
      code: v.code,
      sender: v.sender,
      recipient: v.recipient,
      cost: v.cost,
      pledge: v.pledge,
      finePrint: v.finePrint,
      voucherType: v.voucherType,
    });
    setIsUnwrapModalOpen(true);
  };

  // Open 3D Unwrap for currently customized live preview
  const handleUnwrapLivePreview = () => {
    handleOpenUnwrapForVoucher({
      title: selectedExperience.title,
      subtitle: selectedExperience.subtitle,
      emoji: selectedExperience.emoji,
      code: serialCode,
      sender: issuerName || 'Your Loving Partner',
      recipient: recipientName || 'My Sweetheart',
      cost: selectedExperience.cost,
      pledge: customPledge,
      finePrint: customFinePrint,
      voucherType: selectedExperience.id,
    });
  };

  // When selected experience changes, auto-load its defaults
  const handleSelectExperience = (exp: DateNightExperience) => {
    sounds.playTick();
    setSelectedExperience(exp);
    setSelectedTemplate(exp.defaultTemplate);
    setCustomPledge(exp.defaultPledge);
    setCustomFinePrint(exp.defaultFinePrint);
    setSerialCode(generateVoucherCode(exp.title.slice(0, 4).toUpperCase()));
  };

  // Generate dynamic QR code verification for current voucher
  const voucherUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams({
      rf_voucher: '1',
      vtype: selectedExperience.id,
      vtitle: selectedExperience.title,
      vcode: serialCode,
      from: issuerName,
      to: recipientName,
      pts: String(selectedExperience.cost),
      date: String(Date.now()),
    });
    return `${window.location.origin}/?${params.toString()}`;
  }, [selectedExperience, serialCode, issuerName, recipientName]);

  useEffect(() => {
    if (!voucherUrl) return;
    QRCode.toDataURL(voucherUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR generation error:', err));
  }, [voucherUrl]);

  // Categories
  const categories = ['ALL', 'Pampering', 'Culinary', 'Romantic', 'Fun'];
  const filteredExperiences = useMemo(() => {
    if (selectedCategory === 'ALL') return DATE_NIGHT_EXPERIENCES;
    return DATE_NIGHT_EXPERIENCES.filter((exp) => exp.category === selectedCategory);
  }, [selectedCategory]);

  const canAfford = balance >= selectedExperience.cost;

  // Redeem & Print action
  const handleRedeemAndPrint = () => {
    if (!canAfford) {
      sounds.playStrike();
      alert(`You need ${selectedExperience.cost - balance} more Harmony Points to redeem this voucher!`);
      return;
    }

    sounds.playBountyReward();
    spendHarmonyPoints(selectedExperience.cost);
    const newBal = getAccruedHarmonyPointsBalance();
    setBalance(newBal);
    if (onPointsUpdated) onPointsUpdated(newBal);

    // Save voucher in history
    const purchased: PurchasedVoucher = {
      id: `vouch-${Date.now()}-${serialCode}`,
      voucherType: selectedExperience.id,
      title: selectedExperience.title,
      code: serialCode,
      sender: issuerName,
      recipient: recipientName,
      cost: selectedExperience.cost,
      issuedAt: Date.now(),
      pledge: customPledge,
      finePrint: customFinePrint,
      emoji: selectedExperience.emoji,
    };
    savePurchasedVoucher(purchased);
    setPurchasedVouchers(getPurchasedVouchers());

    // Trigger celebratory Harmony Burst particle explosion
    setIsHarmonyBurstActive(true);

    setToastMessage(`🎉 Redeemed ${selectedExperience.title}! Tap "Unwrap Voucher" below or dismiss burst.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleCopyLink = async () => {
    sounds.playTick();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(voucherUrl);
        setIsCopied(true);
        setToastMessage('Voucher digital link copied! Send to partner 💌');
        setTimeout(() => {
          setIsCopied(false);
          setToastMessage(null);
        }, 3500);
      }
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    sounds.playTick();
    const shareData = {
      title: `🎁 ${selectedExperience.title} for you!`,
      text: `From: ${issuerName}\nTo: ${recipientName}\n"${customPledge}"\nCode: ${serialCode}`,
      url: voucherUrl,
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

  // Template Styles
  const getTemplateClasses = () => {
    switch (selectedTemplate) {
      case 'ROYAL_GOLD':
        return {
          wrapper: 'bg-gradient-to-b from-amber-950/90 via-slate-950 to-amber-950/80 border-2 border-amber-400 text-amber-50 shadow-amber-500/15',
          seal: 'bg-amber-400 text-slate-950 border-amber-300',
          titleColor: 'text-amber-300',
          accent: 'border-amber-400/40 text-amber-200',
          themeLabel: '👑 Royal Gold & Velvet',
        };
      case 'ROMANTIC_ROSE':
        return {
          wrapper: 'bg-gradient-to-b from-rose-950/90 via-slate-950 to-pink-950/80 border-2 border-rose-400 text-rose-50 shadow-rose-500/15',
          seal: 'bg-rose-500 text-white border-rose-300',
          titleColor: 'text-rose-300',
          accent: 'border-rose-400/40 text-rose-200',
          themeLabel: '🌹 Romantic Rose & Blush',
        };
      case 'RETRO_TICKET':
        return {
          wrapper: 'bg-gradient-to-r from-amber-900/80 via-slate-900 to-amber-900/80 border-2 border-dashed border-amber-400/90 text-amber-100',
          seal: 'bg-yellow-400 text-slate-950 border-yellow-300 font-mono font-black',
          titleColor: 'text-yellow-300 font-mono tracking-tight',
          accent: 'border-yellow-400/40 text-yellow-200',
          themeLabel: '🎫 Vintage Cinema Ticket',
        };
      case 'ZEN_SPA':
        return {
          wrapper: 'bg-gradient-to-b from-emerald-950/90 via-slate-950 to-teal-950/80 border-2 border-emerald-400 text-emerald-50 shadow-emerald-500/15',
          seal: 'bg-emerald-400 text-slate-950 border-emerald-300',
          titleColor: 'text-emerald-300',
          accent: 'border-emerald-400/40 text-emerald-200',
          themeLabel: '🌿 Zen Botanical Spa',
        };
      case 'COSMIC_STARLIGHT':
      default:
        return {
          wrapper: 'bg-gradient-to-b from-violet-950/90 via-slate-950 to-fuchsia-950/80 border-2 border-violet-400 text-violet-50 shadow-violet-500/15',
          seal: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-violet-300',
          titleColor: 'text-violet-300',
          accent: 'border-violet-400/40 text-violet-200',
          themeLabel: '🌌 Cosmic Starlight',
        };
    }
  };

  const tStyles = getTemplateClasses();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Gallery Header & Balance Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-md shadow-amber-500/20 shrink-0">
            🎟️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Date Night Experience Gallery</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Printable Vouchers
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Redeem banked Harmony Points for customized physical coupons to slip under pillows or frame!
            </p>
          </div>
        </div>

        {/* Live Balance Chip */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3.5 py-1.5 rounded-xl border border-amber-400/50 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Your Harmony Balance
            </span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-300">
              {balance.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* DATE NIGHT VIBE MOOD AUDIO PLAYER */}
      {/* ============================================================== */}
      <DateNightAudioPlayer variant="full" />

      {/* ============================================================== */}
      {/* COUPLE STANDING AT BUZZER PODIUM & PRIZE VOICE ANNOUNCER */}
      {/* ============================================================== */}
      <CouplePodiumBuzzer
        partner1Name={issuerName || 'Taylor'}
        partner2Name={recipientName || 'Michelle'}
        prizeTitle={selectedExperience.title}
        voucherType={selectedExperience.id}
        pledge={customPledge}
      />

      {/* ============================================================== */}
      {/* REDEEMED DATE NIGHT COUPONS (CLICK TO UNWRAP 🎁) */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-amber-950/30 border-2 border-rose-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Redeemed Date Night Coupons</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
                  Tap to Unwrap in 3D
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Click any redeemed coupon to trigger the 3D-like fold-out animation, silk ribbon untie audio, and digital rose shower!
            </p>
          </div>

          <button
            type="button"
            onClick={handleUnwrapLivePreview}
            className="self-start sm:self-auto py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Unwrap Current Preview</span>
          </button>
        </div>

        {/* Redeemed Vouchers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {purchasedVouchers.map((v) => (
            <div
              key={v.id}
              onClick={() => handleOpenUnwrapForVoucher(v)}
              className="group p-3.5 rounded-xl border border-rose-500/30 hover:border-rose-400 bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 hover:from-rose-950/70 transition-all duration-200 cursor-pointer shadow-md hover:shadow-rose-500/20 flex flex-col justify-between text-left relative overflow-hidden"
              title="Click to unwrap this date night voucher in 3D"
            >
              {/* Decorative gift ribbon corner fold */}
              <div className="absolute -top-7 -right-7 w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rotate-45 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl drop-shadow">{v.emoji || '🎁'}</span>
                  <span className="font-mono text-[10px] text-amber-200/90 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                    {v.code}
                  </span>
                </div>

                <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1 group-hover:text-rose-200 transition-colors">
                  {v.title}
                </h4>

                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 italic leading-relaxed">
                  &ldquo;{v.pledge}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 truncate max-w-[62%]">
                  To: <span className="text-white font-bold">{v.recipient}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUnwrapForVoucher(v);
                  }}
                  className="py-1 px-2.5 rounded-lg bg-rose-600 group-hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow transition-transform active:scale-95 cursor-pointer"
                >
                  <Gift className="w-3 h-3" />
                  <span>Unwrap</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: EXPERIENCE CATALOG SELECTOR */}
      {/* ============================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Choose a Date Night Experience:</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  sounds.playTick();
                  setSelectedCategory(cat);
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredExperiences.map((exp) => {
            const isSelected = selectedExperience.id === exp.id;
            const canBuy = balance >= exp.cost;

            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => handleSelectExperience(exp)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30 text-white shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{exp.emoji}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        canBuy
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {exp.cost} pts
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">
                    {exp.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {exp.subtitle}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{exp.category}</span>
                  {isSelected && (
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 2: TEMPLATE THEME SELECTOR & CUSTOMIZATION FORM */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customization Form */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Customize Voucher Details:</span>
            </span>
          </div>

          {/* Template Theme Buttons */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>Template Style Theme</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'ROYAL_GOLD', label: '👑 Royal Gold', icon: '👑' },
                  { id: 'ROMANTIC_ROSE', label: '🌹 Romantic Rose', icon: '🌹' },
                  { id: 'RETRO_TICKET', label: '🎫 Retro Ticket', icon: '🎫' },
                  { id: 'ZEN_SPA', label: '🌿 Zen Spa', icon: '🌿' },
                  { id: 'COSMIC_STARLIGHT', label: '🌌 Starlight', icon: '🌌' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setSelectedTemplate(t.id);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold text-left transition-all cursor-pointer ${
                    selectedTemplate === t.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Names Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Presented To (Recipient):
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., My Love, Taylor"
                className="w-full py-2 px-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pledged By (Issuer):
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="e.g., Sam, Your Partner"
                className="w-full py-2 px-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Pledge */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Custom Pledge &amp; Experience Terms:
            </label>
            <textarea
              rows={3}
              value={customPledge}
              onChange={(e) => setCustomPledge(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-200 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Custom Fine Print */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Playful Fine Print / Expiration:
            </label>
            <input
              type="text"
              value={customFinePrint}
              onChange={(e) => setCustomFinePrint(e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 3: LIVE PRINTABLE VOUCHER PREVIEW */}
        {/* ============================================================== */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Live Printable Certificate Preview:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {tStyles.themeLabel}
              </span>
              <button
                type="button"
                onClick={handleUnwrapLivePreview}
                className="py-1 px-2.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-400/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title="Trigger 3D fold-out unwrap animation and digital rose shower"
              >
                <Gift className="w-3.5 h-3.5 text-rose-300" />
                <span>🎁 Unwrap in 3D</span>
              </button>
            </div>
          </div>

          {/* The Printable Coupon Card with Cut Lines */}
          <div className="relative">
            {/* Cut line header */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1 select-none">
              <span>✂️ - - - - - - - - -</span>
              <span>CUT ALONG DOTTED LINE</span>
              <span>- - - - - - - - - ✂️</span>
            </div>

            {/* Actual Certificate Container - Clickable to Unwrap */}
            <div
              onClick={handleUnwrapLivePreview}
              title="Click to unwrap voucher with 3D fold-out animation & rose shower!"
              className={`p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-2xl transition-all printable-voucher-card cursor-pointer hover:ring-2 hover:ring-rose-400/50 group ${tStyles.wrapper}`}
            >
              {/* Corner Ribbon for Gift Interaction */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 opacity-90 group-hover:opacity-100 flex items-center gap-1">
                <span>🎁 Tap to Unwrap</span>
              </div>
              {/* Certificate Header Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/15 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${tStyles.seal}`}>
                    Official Certificate
                  </span>
                  <span className="font-mono text-[10px] opacity-80">
                    Resolution Feud
                  </span>
                </div>
                <span className="font-mono font-bold text-xs bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {serialCode}
                </span>
              </div>

              {/* Title & Emojis */}
              <div className="my-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedExperience.emoji}</span>
                  <h4 className={`text-base sm:text-lg font-black leading-tight ${tStyles.titleColor}`}>
                    {selectedExperience.title}
                  </h4>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  {selectedExperience.subtitle}
                </div>
              </div>

              {/* Recipient & Issuer */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-black/35 border border-white/10 text-xs mb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Presented To:
                  </span>
                  <strong className="text-white text-xs truncate block">
                    {recipientName || 'My Sweetheart'}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Pledged By:
                  </span>
                  <strong className="text-amber-300 text-xs truncate block">
                    {issuerName || 'Your Partner'}
                  </strong>
                </div>
              </div>

              {/* Pledge Text */}
              <p className="text-[11px] sm:text-xs leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/10 text-slate-100 mb-3">
                &ldquo;{customPledge}&rdquo;
              </p>

              {/* Footer with Terms & Verification QR Code */}
              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10px]">
                <div className="max-w-[75%]">
                  <div className="opacity-80">⚖️ {customFinePrint}</div>
                  <div className="font-mono opacity-60 text-[9px] mt-0.5">
                    Redeemed with {selectedExperience.cost} Harmony Points
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="p-1 rounded bg-white shrink-0 shadow">
                    <img src={qrCodeUrl} alt="Voucher QR" className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Cut line footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 select-none">
              <span>✂️ - - - - - - - - -</span>
              <span>GENUINE HARMONY PLEDGE</span>
              <span>- - - - - - - - - ✂️</span>
            </div>
          </div>

          {/* Action Buttons: Print & Digital Beam */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleRedeemAndPrint}
              disabled={!canAfford}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>
                {canAfford
                  ? `Redeem (${selectedExperience.cost} pts) & Print Voucher 🖨️`
                  : `Need ${selectedExperience.cost - balance} More Harmony Pts`}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Beam Digital Copy</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/50'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied Link!' : 'Copy Direct Link'}</span>
              </button>
            </div>

            {/* Dedicated Unwrap Voucher Button */}
            <button
              type="button"
              onClick={handleUnwrapLivePreview}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
            >
              <Gift className="w-4 h-4" />
              <span>🎁 Unwrap Voucher (3D Fold-Out &amp; Rose Shower)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Celebratory Harmony Burst Particle Explosion */}
      <HarmonyBurst
        isActive={isHarmonyBurstActive}
        voucherType={selectedExperience.id}
        voucherTitle={selectedExperience.title}
        recipientName={recipientName}
        onDismiss={() => {
          setIsHarmonyBurstActive(false);
          if (typeof window !== 'undefined') {
            window.print();
          }
        }}
      />

      {/* 3D-Like Fold-Out Unwrap Voucher Modal */}
      <UnwrapVoucherModal
        isOpen={isUnwrapModalOpen}
        voucher={activeUnwrapVoucher}
        onClose={() => setIsUnwrapModalOpen(false)}
        onPrint={() => {
          if (typeof window !== 'undefined') {
            window.print();
          }
        }}
      />
    </div>
  );
};

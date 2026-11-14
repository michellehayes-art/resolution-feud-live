import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Share2,
  Trophy,
  Sparkles,
  MessageCircle,
  Smartphone,
  Send,
  QrCode,
  Download,
  Eye,
  RefreshCw,
  Printer,
  Link2,
  MapPin,
} from 'lucide-react';
import { TeamAvatarBadge } from './TeamAvatarBadge';
import { sounds } from '../utils/audio';

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: [{ id: number; name: string; score: number; avatar?: string }, { id: number; name: string; score: number; avatar?: string }];
  roundNumber?: number;
  totalRounds?: number;
  mode?: string;
  fastMoneyScore?: number;
  locationCity?: string | null;
}

export const ShareResultsModal: React.FC<ShareResultsModalProps> = ({
  isOpen,
  onClose,
  teams,
  roundNumber,
  totalRounds,
  mode = 'COUPLES',
  fastMoneyScore = 0,
  locationCity,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'card' | 'qr'>('card');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const winner = teams[0].score >= teams[1].score ? teams[0] : teams[1];
  const loser = teams[0].id === winner.id ? teams[1] : teams[0];
  const isTie = teams[0].score === teams[1].score;
  const totalScore = teams[0].score + teams[1].score + fastMoneyScore;

  let relationshipTitle = 'Empathetic Peacemakers';
  if (totalScore > 350) relationshipTitle = 'Master De-escalation Diplomats';
  else if (totalScore > 200) relationshipTitle = 'Certified Communication Champions';

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Generate dynamic share URL with encoded query parameters
  const shareResultUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams({
      rf_match: '1',
      winner: isTie ? 'Tie Game' : winner.name,
      wscore: String(winner.score),
      loser: loser.name,
      lscore: String(loser.score),
      title: relationshipTitle,
      mode: mode,
    });
    if (locationCity) {
      params.set('origin', locationCity);
    }
    return `${appUrl}/?${params.toString()}`;
  }, [appUrl, isTie, winner.name, winner.score, loser.name, loser.score, relationshipTitle, mode, locationCity]);

  // Generate dynamic QR Code Data URL whenever modal opens or share URL changes
  useEffect(() => {
    if (!isOpen || !shareResultUrl) return;

    QRCode.toDataURL(shareResultUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#020617', // dark slate
        light: '#ffffff', // crisp white
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.warn('Failed to generate QR code:', err);
      });
  }, [isOpen, shareResultUrl]);

  if (!isOpen) return null;

  const locationSnippet = locationCity ? ` 📍 Live from ${locationCity}` : '';
  const shareSummary = isTie
    ? `🤝 Match Tied! ${teams[0].name} (${teams[0].score} pts) tied with ${teams[1].name} (${teams[1].score} pts) in Resolution Feud!${locationSnippet}`
    : `🏆 ${winner.name} won Resolution Feud with ${winner.score} pts against ${loser.name} (${loser.score} pts)! Title: ${relationshipTitle}.${locationSnippet}`;

  const fullShareText = `${shareSummary}\n\nView match details and play: ${shareResultUrl}`;

  const handleCopy = async () => {
    sounds.playTick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullShareText);
        setIsCopied(true);
        setCopyToast('Match summary copied! Paste it anywhere.');
        setTimeout(() => {
          setIsCopied(false);
          setCopyToast(null);
        }, 3000);
      } catch (err) {
        console.warn('Copy failed', err);
      }
    }
  };

  const handleCopyLink = async () => {
    sounds.playTick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareResultUrl);
        setIsLinkCopied(true);
        setCopyToast('Direct match link copied to clipboard! 🔗');
        setTimeout(() => {
          setIsLinkCopied(false);
          setCopyToast(null);
        }, 3000);
      } catch (err) {
        console.warn('Copy link failed', err);
      }
    }
  };

  const handlePrintResult = () => {
    sounds.playTick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleNativeShare = async () => {
    sounds.playTick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Resolution Feud — Match Results',
          text: fullShareText,
          url: shareResultUrl,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  // Deep-link handlers
  const openWhatsApp = () => {
    sounds.playTick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openSMS = () => {
    sounds.playTick();
    const url = `sms:?&body=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_self');
  };

  const handleInstagramShare = async () => {
    sounds.playTick();
    await handleCopy();
    setCopyToast('Caption copied! Opening Instagram to share on your Story/DM...');
    setTimeout(() => {
      window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none print-container-wrapper">
      {/* On-Screen Modal Card (hidden during print) */}
      <div className="no-print relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Share Match Results
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Show Off Your Feud Score
        </h3>

        {/* Tab Switcher: Card Preview vs QR Code */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 my-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('card');
              sounds.playTick();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'card'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Social Card</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('qr');
              sounds.playTick();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Scan QR Code 📲</span>
          </button>
        </div>

        {/* TAB 1: PREVIEW CARD (TV Game Show Social Graphic) */}
        {activeTab === 'card' && (
          <div className="my-3 p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/70 shadow-xl shadow-amber-500/10 text-left relative overflow-hidden animate-fadeIn">
            {/* Subtle Stage Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar of the Card */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Resolution Feud
                </span>
                {locationCity && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    <MapPin className="w-2.5 h-2.5 text-amber-400" />
                    <span className="truncate max-w-[140px]">{locationCity}</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {mode === 'ROMANCE' ? '💖 Spicy Romance' : 'Couples Face-Off'}
              </span>
            </div>

            {/* Winner Showcase with Mini QR Code Teaser */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TeamAvatarBadge avatarId={winner.avatar || 'crown'} size="md" />
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-400 text-slate-950">
                    <Trophy className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    {isTie ? 'Tie Game' : 'Match Winner'}
                  </span>
                  <h4 className="text-lg font-black text-white leading-tight">
                    {isTie ? 'Both Partners Tied!' : winner.name}
                  </h4>
                  <span className="text-xs font-semibold text-slate-400">
                    Title: <span className="text-slate-200">{relationshipTitle}</span>
                  </span>
                </div>
              </div>

              {/* Mini QR Code on Card that clicks to expand */}
              {qrCodeUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    sounds.playTick();
                  }}
                  className="p-1 rounded-xl bg-white border-2 border-amber-400/80 shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
                  title="Click to expand full QR code"
                >
                  <img src={qrCodeUrl} alt="Match QR Code" className="w-12 h-12 rounded" />
                </button>
              )}
            </div>

            {/* Scores Breakdown Bar */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                  {teams[0].name}
                </span>
                <span className="font-mono font-black text-lg text-amber-300">
                  {teams[0].score} <span className="text-[10px] font-normal text-slate-400">pts</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                  {teams[1].name}
                </span>
                <span className="font-mono font-black text-lg text-amber-300">
                  {teams[1].score} <span className="text-[10px] font-normal text-slate-400">pts</span>
                </span>
              </div>
            </div>

            {/* Card Footer URL Watermark */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('qr');
                  sounds.playTick();
                }}
                className="text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3 h-3" />
                <span>Tap for Scan QR</span>
              </button>
              <span className="font-mono text-slate-400 truncate max-w-[200px]">
                {appUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMICALLY GENERATED FULL QR CODE */}
        {activeTab === 'qr' && (
          <div className="my-3 p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/70 shadow-xl shadow-amber-500/10 flex flex-col items-center justify-center animate-fadeIn">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Smartphone className="w-4 h-4" /> Instant Cross-Device Scan
            </span>
            <p className="text-xs text-slate-300 mb-3 max-w-xs text-center">
              Point any smartphone camera at this code to view this match's results and start a rematch!
            </p>

            {/* The Crisp QR Code */}
            <div className="p-3 bg-white rounded-2xl border-4 border-amber-400 shadow-xl shadow-amber-500/20 mb-3">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Dynamic Match Results QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg block"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              )}
            </div>

            {/* QR Download & Action Link */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {qrCodeUrl && (
                <a
                  href={qrCodeUrl}
                  download={`resolution-feud-qr-${Date.now()}.png`}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR Image</span>
                </a>
              )}
              <button
                type="button"
                onClick={handlePrintResult}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 hover:border-amber-400/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print official match certificate"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('card');
                  sounds.playTick();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Card
              </button>
            </div>
          </div>
        )}

        {/* Copy Feedback Toast */}
        {copyToast && (
          <div className="mb-3 p-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-fadeIn flex items-center justify-center gap-1.5 shadow-md">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Primary Action: One-Tap Copy Full Summary to Clipboard */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer mb-2"
        >
          {isCopied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
          <span>{isCopied ? 'Summary & Link Copied! ✓' : 'Copy Results & Link to Clipboard'}</span>
        </button>

        {/* Action Row: Copy Direct Link & Print Result */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Copy direct web link to this match"
          >
            {isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isLinkCopied ? 'Link Copied! ✓' : 'Copy Match Link 🔗'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintResult}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm group"
            title="Print or Save Official Match Results Certificate"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Print Result 🖨️</span>
          </button>
        </div>

        {/* Instant Social Media Deep-Links */}
        <div className="pt-2.5 border-t border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Instant Social Deep-Links:
          </span>

          <div className="grid grid-cols-4 gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={openWhatsApp}
              className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95"
              title="Share directly via WhatsApp"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>

            {/* Instagram Stories */}
            <button
              type="button"
              onClick={handleInstagramShare}
              className="p-2 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 text-pink-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95"
              title="Copy caption & open Instagram Stories"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">Instagram</span>
            </button>

            {/* SMS / iMessage */}
            <button
              type="button"
              onClick={openSMS}
              className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-blue-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95"
              title="Send via Text Message / iMessage"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">Messages</span>
            </button>

            {/* More / System Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95"
              title="Open full system share sheet"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE MATCH RESULTS CERTIFICATE (Visible only in window.print()) */}
      <div className="printable-match-results hidden print:block">
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
          <span className="text-[11px] uppercase tracking-widest font-black text-slate-600 block">
            Survey of 100 Couples &amp; Relationship Therapists
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 mt-1 uppercase">
            Resolution Feud
          </h1>
          <p className="text-xs font-bold text-slate-700 tracking-wider uppercase mt-0.5">
            Official Conflict Resolution &amp; Match Certificate
          </p>
        </div>

        <div className="text-center my-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Match Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} &bull; {mode === 'ROMANCE' ? 'Romance Edition' : 'Couples Face-Off'}
            {locationCity ? ` • 📍 Session Origin: ${locationCity}` : ''}
          </span>
          <div className="my-3 p-4 bg-slate-50 border border-slate-300 rounded-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
              {isTie ? 'Match Outcome' : 'Certified Winner'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">
              {isTie ? 'Both Partners Tied in Harmony!' : winner.name}
            </h2>
            <p className="text-sm font-bold print-highlight mt-1">
              Awarded Honor Title: &ldquo;{relationshipTitle}&rdquo;
            </p>
          </div>
        </div>

        {/* Scores Breakdown */}
        <div className="grid grid-cols-2 gap-4 my-3 p-3 border border-slate-300 rounded-lg bg-white">
          <div className="text-center border-r border-slate-300 pr-2">
            <span className="text-xs font-bold text-slate-600 uppercase block">{teams[0].name}</span>
            <span className="text-2xl font-black text-slate-900">{teams[0].score} pts</span>
          </div>
          <div className="text-center pl-2">
            <span className="text-xs font-bold text-slate-600 uppercase block">{teams[1].name}</span>
            <span className="text-2xl font-black text-slate-900">{teams[1].score} pts</span>
          </div>
        </div>

        {/* Dynamic QR Code on Certificate */}
        {qrCodeUrl && (
          <div className="my-4 text-center flex flex-col items-center justify-center">
            <img src={qrCodeUrl} alt="Match QR Code" className="w-28 h-28 border border-slate-300 rounded p-1 mb-1.5" />
            <span className="text-[11px] font-bold text-slate-800">
              Scan with any smartphone camera to view match details &amp; play rematch
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 break-all max-w-sm">
              {shareResultUrl}
            </span>
          </div>
        )}

        {/* Conflict Resolution Pledge */}
        <div className="my-3 p-3 bg-slate-50 border border-slate-300 rounded text-left">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
            Couples De-escalation &amp; Conflict Resolution Pledge:
          </h4>
          <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
            <li><strong>Soft Startup:</strong> We agree to express grievances using &ldquo;I feel...&rdquo; without sarcasm or contempt.</li>
            <li><strong>Active Repair:</strong> When tension rises, we agree to take a short breather and reconnect with care.</li>
            <li><strong>Turn Towards:</strong> We agree to prioritize our bond and mutual respect over winning the argument.</li>
          </ul>
        </div>

        {/* Signature Lines */}
        <div className="grid grid-cols-2 gap-8 mt-5 pt-3 border-t border-slate-300">
          <div className="text-center">
            <div className="border-b border-slate-400 h-8 mb-1" />
            <span className="text-xs font-bold text-slate-800 block">{teams[0].name} Signature</span>
            <span className="text-[10px] text-slate-500">Date</span>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 h-8 mb-1" />
            <span className="text-xs font-bold text-slate-800 block">{teams[1].name} Signature</span>
            <span className="text-[10px] text-slate-500">Date</span>
          </div>
        </div>

        <div className="mt-5 pt-2 text-center text-[10px] text-slate-500 border-t border-slate-200">
          Resolution Feud &copy; {new Date().getFullYear()} &bull; Empowering couples to resolve everyday arguments with laughter &amp; empathy.
        </div>
      </div>
    </div>
  );
};

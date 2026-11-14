import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  Send,
  MessageCircle,
  Download,
  Heart,
  Utensils,
  Smartphone,
  ShieldCheck,
  Printer,
  Volume2,
} from 'lucide-react';
import { PurchasedVoucher, buildVoucherShareUrl } from '../utils/rewardsStorage';
import { sounds } from '../utils/audio';

interface VoucherShareModalProps {
  voucher: PurchasedVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerRoseDrop?: () => void;
}

export const VoucherShareModal: React.FC<VoucherShareModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onTriggerRoseDrop,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shareUrl = voucher ? buildVoucherShareUrl(voucher) : '';

  useEffect(() => {
    if (!isOpen || !shareUrl) return;

    QRCode.toDataURL(shareUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR code gen failed:', err));
  }, [isOpen, shareUrl]);

  if (!isOpen || !voucher) return null;

  const isRoses = voucher.voucherType === 'dozen-roses';
  const isDinner = voucher.voucherType === 'dinner-on-me';

  const handleCopyLink = async () => {
    sounds.playTick();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setToastMessage('Voucher link copied! Send it via text or chat 💌');
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
      title: `🎁 ${voucher.title} from ${voucher.sender}!`,
      text: `"${voucher.pledge}"\n\nOfficial Harmony Voucher Code: ${voucher.code}\nRedeemable anytime!`,
      url: shareUrl,
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

  const handleShareWhatsApp = () => {
    sounds.playTick();
    const text = encodeURIComponent(
      `🎁 *${voucher.title}* 🎁\n\nFrom: *${voucher.sender}*\nTo: *${voucher.recipient}*\n\n"${voucher.pledge}"\n\n📜 Code: *${voucher.code}*\n\nView official certificate on your phone:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareSms = () => {
    sounds.playTick();
    const text = encodeURIComponent(
      `🎁 Digital Voucher from ${voucher.sender}: "${voucher.title}" (Code: ${voucher.code}). Redeem here: ${shareUrl}`
    );
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handlePrint = () => {
    sounds.playTick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl p-5 sm:p-7 text-center z-10 max-h-[94vh] overflow-y-auto custom-scrollbar">
        {/* Decorative background glow */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isRoses ? 'bg-rose-500' : isDinner ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer z-10"
          title="Close voucher"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Harmony Voucher Issued</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center justify-center gap-2">
            <span>{voucher.emoji}</span>
            <span>{voucher.title}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Beam this voucher directly to your opponent’s device via QR code or instant message!
          </p>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* OFFICIAL DIGITAL CERTIFICATE COUPON CARD */}
        {/* ============================================================== */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border-2 text-left relative overflow-hidden shadow-xl mb-5 ${
            isRoses
              ? 'bg-gradient-to-b from-rose-950/90 via-pink-950/70 to-slate-950 border-rose-500/60'
              : isDinner
              ? 'bg-gradient-to-b from-amber-950/90 via-yellow-950/70 to-slate-950 border-amber-500/60'
              : 'bg-gradient-to-b from-emerald-950/90 via-teal-950/70 to-slate-950 border-emerald-500/60'
          }`}
        >
          {/* Top Notch Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold uppercase tracking-wider text-amber-300 text-[10px]">
                Resolution Feud Verified
              </span>
            </div>
            <span className="font-mono font-black text-white text-[11px] bg-slate-900/80 px-2.5 py-0.5 rounded border border-white/20">
              {voucher.code}
            </span>
          </div>

          {/* Certificate Content */}
          <div className="my-4">
            <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
              <span>Presented By: <strong className="text-white">{voucher.sender}</strong></span>
              <span>Recipient: <strong className="text-amber-300">{voucher.recipient}</strong></span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mt-2 leading-tight">
              {voucher.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/10">
              &ldquo;{voucher.pledge}&rdquo;
            </p>

            <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
              <span>⚖️ {voucher.finePrint}</span>
              <span className="text-amber-300/80 font-mono">Paid: {voucher.cost} Harmony Pts</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BEAM TO OPPONENT: QR CODE & SHARING */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 mb-4 text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* High-Res QR Code */}
            {qrCodeUrl && (
              <div className="p-2.5 rounded-xl bg-white flex flex-col items-center justify-center shrink-0 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="Voucher QR Code"
                  className="w-36 h-36 rounded"
                />
                <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider mt-1">
                  Scan to Receive 📱
                </span>
              </div>
            )}

            {/* Direct Instructions & Quick Actions */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Send to Opponent&apos;s Phone</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Have your opponent point their camera at this QR code, or tap below to send it via WhatsApp, SMS, or AirDrop!
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareSms}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>SMS Text</span>
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
                  <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Announce Prize Voice Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.speakPrizeVerdict({
                    sender: voucher.sender,
                    recipient: voucher.recipient,
                    prizeTitle: voucher.title,
                    voucherType: voucher.voucherType,
                    pledge: voucher.pledge,
                  });
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer mt-1 shadow-md shadow-amber-500/20"
              >
                <Volume2 className="w-3.5 h-3.5 fill-current" />
                <span>📢 Announce Prize Verdict Aloud (TV Host Voice)</span>
              </button>

              {/* Extra Rose Drop Celebration if Dozen Roses */}
              {isRoses && onTriggerRoseDrop && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playRoseShower();
                    onTriggerRoseDrop();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer mt-1"
                >
                  <span>🌹 Shower Roses Across Both Screens</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Coupon</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

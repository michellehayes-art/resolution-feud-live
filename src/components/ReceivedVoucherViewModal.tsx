import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Heart,
  Sparkles,
  ShieldCheck,
  Share2,
  Utensils,
  Award,
  Gift,
} from 'lucide-react';
import { PurchasedVoucher } from '../utils/rewardsStorage';
import { sounds } from '../utils/audio';
import { UnwrapVoucherModal } from './UnwrapVoucherModal';

interface ReceivedVoucherViewModalProps {
  voucher: PurchasedVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerRoses?: () => void;
}

export const ReceivedVoucherViewModal: React.FC<ReceivedVoucherViewModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onTriggerRoses,
}) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isUnwrapOpen, setIsUnwrapOpen] = useState(false);

  if (!isOpen || !voucher) return null;

  const isRoses = voucher.voucherType === 'dozen-roses';
  const isDinner = voucher.voucherType === 'dinner-on-me';

  const handleAccept = () => {
    sounds.playWinFanfare();
    setIsAccepted(true);
    if (isRoses && onTriggerRoses) {
      onTriggerRoses();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl p-6 sm:p-8 text-center z-10 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration header */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-amber-500/20 animate-bounce">
          {voucher.emoji}
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block">
          Official Digital Voucher Received!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
          {voucher.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Gifted to you by <strong className="text-amber-300">{voucher.sender}</strong> after a spirited round of Resolution Feud!
        </p>

        {/* Certificate Card */}
        <div
          className={`my-5 p-5 sm:p-6 rounded-2xl border-2 text-left relative overflow-hidden shadow-xl ${
            isRoses
              ? 'bg-gradient-to-b from-rose-950/90 via-pink-950/70 to-slate-950 border-rose-500/60'
              : isDinner
              ? 'bg-gradient-to-b from-amber-950/90 via-yellow-950/70 to-slate-950 border-amber-500/60'
              : 'bg-gradient-to-b from-emerald-950/90 via-teal-950/70 to-slate-950 border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold uppercase tracking-wider text-amber-300 text-[10px]">
                Valid Digital Voucher
              </span>
            </div>
            <span className="font-mono font-black text-white text-[11px] bg-slate-900/80 px-2.5 py-0.5 rounded border border-white/20">
              {voucher.code}
            </span>
          </div>

          <div className="my-3">
            <p className="text-xs sm:text-sm text-slate-100 italic bg-black/40 p-3 rounded-xl border border-white/10 leading-relaxed">
              &ldquo;{voucher.pledge}&rdquo;
            </p>
            <div className="text-[10px] text-slate-400 mt-2">
              ⚖️ {voucher.finePrint}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {!isAccepted ? (
            <button
              type="button"
              onClick={handleAccept}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Gift &amp; Seal Peace Pact 🤝</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pact Sealed! Save this certificate to redeem with {voucher.sender}.</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playTick();
              setIsUnwrapOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>🎁 Unwrap Voucher in 3D &amp; Shower Roses</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* 3D-Like Fold-Out Unwrap Voucher Modal */}
      <UnwrapVoucherModal
        isOpen={isUnwrapOpen}
        voucher={voucher}
        onClose={() => setIsUnwrapOpen(false)}
        onPrint={() => {
          if (typeof window !== 'undefined') {
            window.print();
          }
        }}
      />
    </div>
  );
};

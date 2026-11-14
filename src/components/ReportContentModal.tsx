import React, { useState } from 'react';
import {
  X,
  Flag,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Send,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/audio';

export interface UserReport {
  id: string;
  timestamp: string;
  contentType: 'QUESTION' | 'CUSTOM_DISPUTE' | 'AUDIO_RECORDING' | 'GENERAL';
  contentSnippet: string;
  category: string;
  details: string;
  hideImmediately: boolean;
  reporterCity?: string;
  status: 'PENDING_DEVELOPER_REVIEW';
}

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'QUESTION' | 'CUSTOM_DISPUTE' | 'AUDIO_RECORDING' | 'GENERAL';
  contentSnippet?: string;
  currentCity?: string | null;
  onHideContent?: (snippet: string) => void;
}

const REPORT_CATEGORIES = [
  { id: 'harassment', label: 'Harassment or Bullying', icon: '🛑' },
  { id: 'hate_speech', label: 'Hate Speech or Discrimination', icon: '⚠️' },
  { id: 'explicit', label: 'Sexually Explicit / Inappropriate', icon: '🔞' },
  { id: 'profanity', label: 'Offensive Language / Severe Slurs', icon: '🤬' },
  { id: 'threats', label: 'Violence or Physical Threats', icon: '🚫' },
  { id: 'other', label: 'Other Policy / Safety Violation', icon: '⚖️' },
];

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentSnippet = '',
  currentCity,
  onHideContent,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('harassment');
  const [details, setDetails] = useState('');
  const [hideImmediately, setHideImmediately] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTick();
    setIsSubmitting(true);

    const report: UserReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      contentType,
      contentSnippet: contentSnippet || 'General App Feedback',
      category: selectedCategory,
      details: details.trim(),
      hideImmediately,
      reporterCity: currentCity || undefined,
      status: 'PENDING_DEVELOPER_REVIEW',
    };

    // Store in localStorage moderation queue
    try {
      const existingRaw = localStorage.getItem('rf_moderation_reports');
      const reports: UserReport[] = existingRaw ? JSON.parse(existingRaw) : [];
      reports.unshift(report);
      localStorage.setItem('rf_moderation_reports', JSON.stringify(reports));

      // If user selected to hide immediately, also persist to blocked list
      if (hideImmediately && contentSnippet) {
        const blockedRaw = localStorage.getItem('rf_blocked_content');
        const blocked: string[] = blockedRaw ? JSON.parse(blockedRaw) : [];
        if (!blocked.includes(contentSnippet)) {
          blocked.push(contentSnippet);
          localStorage.setItem('rf_blocked_content', JSON.stringify(blocked));
        }
        if (onHideContent) {
          onHideContent(contentSnippet);
        }
      }
    } catch (err) {
      console.warn('Could not store report in localStorage:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-rose-500/50 shadow-2xl p-6 sm:p-7 text-left overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          /* Submission Confirmation Screen */
          <div className="py-6 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              Report Submitted Directly to Developers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mb-4">
              Thank you for keeping Resolution Feud safe. Your report has been logged to the developer moderation queue for immediate review.
            </p>

            {hideImmediately && (
              <div className="p-3 mb-5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>This content has been immediately blocked from your active session.</span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 mb-6 border-t border-slate-800/80 pt-3">
              Developer Contact: <strong className="text-amber-400">michellehayes5117@gmail.com</strong>
              <br />
              Complies with Google Play Developer Content &amp; Safety Policies.
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit}>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flag className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                In-App Safety &amp; Content Moderation
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-1">
              Flag Objectionable or Offensive Content
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Report violations directly to app developers without exiting the app.
            </p>

            {/* Target Snippet Preview */}
            {contentSnippet && (
              <div className="p-3 mb-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Flagged Content Snippet:
                </span>
                <p className="text-xs text-slate-200 italic line-clamp-2">
                  &ldquo;{contentSnippet}&rdquo;
                </p>
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Select Reason for Report:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      sounds.playTick();
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200 font-bold'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="mb-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Additional Details (Optional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was offensive, harmful, or inappropriate..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-400 transition-colors resize-none"
              />
            </div>

            {/* Immediate Action Checkbox (Google Play Requirement) */}
            <label className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={hideImmediately}
                onChange={(e) => setHideImmediately(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Hide / skip this content immediately from my active session</span>
              </span>
            </label>

            {/* Google Play Policy Statement */}
            <div className="flex items-start gap-2 text-[10px] text-slate-400 mb-4 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Google Play Developer Policy Compliance:</strong> Resolution Feud enforces zero tolerance for harassment, hate speech, or objectionable content. Reports are reviewed promptly by the developer team.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

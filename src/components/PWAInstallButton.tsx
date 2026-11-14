import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle, MoreVertical, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode (already installed as PWA or native app)
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-lg">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Installed</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowAndroidGuide(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {/* Android / Chrome One-Tap Install Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn text-left">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Install on Android</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              To add <strong>Resolution Feud</strong> to your phone's home screen &amp; app list:
            </p>

            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-bold shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Step 1:</strong> Tap the <strong>3 vertical dots</strong> (menu) in the top-right corner of Chrome.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-bold shrink-0">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Step 2:</strong> Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-emerald-950 text-emerald-400 font-mono text-[11px] font-bold shrink-0">
                  ✓
                </div>
                <span>
                  <strong>Step 3:</strong> Tap <strong>Install</strong> when prompted. The game will appear directly on your home screen!
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowAndroidGuide(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
                >
                  Prompt Install
                </button>
              )}
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn text-left">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 p-6 shadow-2xl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" /> Install on iPhone / iPad
            </h3>
            <div className="text-xs text-slate-300 space-y-3 my-4">
              <div className="flex items-start gap-2.5">
                <Share2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <PlusSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>3. Launch <strong>Resolution Feud</strong> directly from your home screen!</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { X, Smartphone, Globe, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

interface GooglePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const GooglePlayModal: React.FC<GooglePlayModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Publishing to Google Play Store
            </h3>
            <p className="text-xs text-slate-400">
              How to package and launch Resolution Feud on Android devices and the Play Store
            </p>
          </div>
        </div>

        {/* Section 1: Immediate Instant Install (PWA) */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 mb-5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant Android Install (Already Live!)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            We just configured <strong>Resolution Feud</strong> with an official Web App Manifest and high-resolution icons. You and your friends can test it right now on Android:
          </p>
          <div className="mt-2 text-xs text-slate-300 space-y-1">
            <div>1. Open this app on Android Chrome: <code className="text-amber-300 font-mono select-all text-[11px] bg-slate-900 px-1 py-0.5 rounded">{appUrl}</code></div>
            <div>2. Tap <strong>Install App</strong> or Chrome's three dots menu &gt; <strong>"Add to Home Screen / Install"</strong>.</div>
            <div>3. The app opens full-screen in standalone mode without any browser address bar!</div>
          </div>
        </div>

        {/* Section 2: Step-by-Step Google Play Store Submission */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">
            Step-by-Step: Getting it on the Google Play Store
          </h4>

          {/* Option A: PWABuilder (Easiest) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Method 1: PWABuilder (Recommended &amp; Fastest)
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                No Coding Needed
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Google supports <strong>Trusted Web Activities (TWA)</strong>, which wraps your live web app into an official Android App Bundle (<code className="text-amber-300 font-mono">.aab</code>) for Google Play.
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
              <li>
                Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-3 h-3" /></a>
              </li>
              <li>Enter your app URL: <span className="text-amber-300 font-mono">{appUrl}</span></li>
              <li>Click <strong>Package for Store</strong> &gt; select <strong>Android</strong></li>
              <li>Download the generated signed Android package (<code className="text-amber-300 font-mono">.aab</code> file)</li>
            </ol>
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-emerald-400 block">
                ✓ Uploading the .aab file with your new Gmail:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Yes, exactly!</strong> Log in to <strong className="text-white">play.google.com/console</strong> with your new Gmail &gt; click <strong className="text-white">Create app</strong> &gt; go to <strong className="text-white">Release &gt; Production</strong> &gt; click <strong className="text-white">Create new release</strong> &gt; upload your downloaded <code className="text-amber-300 font-mono">.aab</code> file. Complete the store listing and content rating forms, then click <strong className="text-white">Start rollout to Production</strong>!
              </p>
            </div>
          </div>

          {/* Option B: Google Official Bubblewrap CLI */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Method 2: Google Bubblewrap CLI
              </span>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                Official Google Tool
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Google provides the official <code className="text-amber-300 font-mono">@bubblewrap/cli</code> tool to generate Play Store packages directly from the command line:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-amber-300 select-all">
              npx @bubblewrap/cli init --manifest={appUrl}/manifest.webmanifest<br/>
              npx @bubblewrap/cli build
            </div>
          </div>

          {/* Paid App Only Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <span>💰 Making It a Paid App Only</span>
              </span>
              <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded">
                Keep 85%
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              <strong>Yes!</strong> You can set Resolution Feud as a paid download (e.g. <strong>$1.99 or $2.99</strong>) so users must buy it on Google Play before downloading:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
              <li>When creating the app in Play Console, select <strong className="text-white">"Paid"</strong> (⚠️ <em>Google does not allow changing a Free app into Paid later</em>).</li>
              <li>Set your price (e.g. <strong className="text-amber-300">$2.99</strong>) under <strong className="text-white">Monetize &gt; App pricing</strong>.</li>
              <li><strong>Romance Edition is included!</strong> You do not need to add an extra price; paying the app download price unlocks all 4 modes (Couples, Romance, Solo Bot, and Party).</li>
              <li>Link your bank account in <strong className="text-white">Settings &gt; Payments profile</strong> for direct monthly deposits.</li>
              <li>100% ad-free experience with zero extra coding required!</li>
            </ul>
          </div>

          {/* Play Console Checklist */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>What you need for Google Play Console:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
              <li>A <strong className="text-slate-200">Google Play Developer Account</strong> ($25 one-time fee at <span className="text-amber-400">play.google.com/console</span>) — sign in with your <strong className="text-amber-300">new personal Gmail</strong> and select <em>"Yourself / Personal"</em></li>
              <li>You don't need to move the code; Google Play links to your app through the <code className="text-amber-300 font-mono">.aab</code> package!</li>
              <li>Store listing details: App Title ("Resolution Feud"), Short description, Category (Games / Trivia / Casual)</li>
              <li>High-res icon: (already created at <code className="text-amber-300 font-mono">public/pwa-512x512.png</code>)</li>
              <li>2-4 screenshots of your game board and Face-Off podiums</li>
            </ul>
          </div>

          {/* Google Play Safety & Developer Policy Compliance Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Google Play Developer Policy &amp; Safety Compliance</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                100% Policy Ready
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Resolution Feud is engineered to strictly satisfy Google Play Developer Policies and local consumer safety laws:
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>In-App User Content Reporting:</strong> Players can flag or report any question, custom user dispute, or offensive content to developers without leaving the app.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Instant Content Filtering:</strong> Reporting instantly blocks objectionable scenarios from the player's active session.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Geolocation Privacy Compliance:</strong> Location permission is 100% opt-in. Coordinates are processed strictly client-side to display session city origin and are never sold or shared.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Zero-Tolerance UGC Policy:</strong> Prohibits hate speech, harassment, explicit sexual content, and abusive conduct in compliance with Play Store standards.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Developer Safety Contact:</strong> Moderation queue logs reports directly for review. Contact: <span className="text-amber-400 font-mono">michellehayes5117@gmail.com</span></span>
              </div>
            </div>
          </div>

          {/* Section 4: Adding Apps to Another Gmail / Console Account */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>Adding Apps to a Different Gmail / Console Account</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                Multi-Account Guide
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              If your Google Play Console or Google Cloud project is registered under one Gmail and you need to access it from another Gmail, you have two simple official options:
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 text-xs block">
                  Method A: Invite your other Gmail as an Admin (Easiest - No Fee)
                </span>
                <p className="text-slate-400 text-[11px]">
                  Allows you to manage, update, and release apps using either Gmail account without paying another $25 fee:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
                  <li>Log in to <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">play.google.com/console</a> with the account that owns the app.</li>
                  <li>In the left sidebar, click <strong>Users and permissions</strong> (under Settings).</li>
                  <li>Click <strong>Invite new users</strong>.</li>
                  <li>Enter your other Gmail address and assign <strong>Admin</strong> or <strong>Release Manager</strong> permissions.</li>
                  <li>Click <strong>Send invitation</strong> and accept the invitation email from your other Gmail.</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="font-bold text-blue-300 text-xs block">
                  Method B: Permanently Transfer the App to Another Developer Account
                </span>
                <p className="text-slate-400 text-[11px]">
                  Transfers 100% legal ownership, reviews, and package ID to a second registered Google Play Developer account:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-300 pl-1">
                  <li>Ensure your second Gmail has completed developer registration ($25 one-time at Play Console).</li>
                  <li>Open the official <a href="https://support.google.com/googleplay/android-developer/answer/6230247" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">App Transfer Request Form <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                  <li>Enter both accounts' <strong>Developer Account IDs</strong> and the registration <strong>Transaction IDs</strong> from your Google Payments receipt.</li>
                  <li>Google processes the transfer in 24–48 hours with zero app downtime.</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 text-xs block">
                  Google Cloud Console (GCP / APIs / OAuth) Access
                </span>
                <p className="text-slate-400 text-[11px]">
                  Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">console.cloud.google.com</a> &gt; <strong>IAM &amp; Admin</strong> &gt; <strong>IAM</strong> &gt; Click <strong>Grant Access</strong> &gt; Enter your other Gmail and assign the role <strong>Project &gt; Owner</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Copy Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              const guideText = `Resolution Feud - Google Play Publishing Steps:
1. Live App URL: ${appUrl}
2. Free Instant Install: Open the link above in Android Chrome, tap "Install App" or menu > "Add to Home Screen"
3. When ready for Google Play:
   - Go to PWABuilder.com, paste: ${appUrl}
   - Click "Package for Store" > "Android" > download .aab file
   - Pay $25 at play.google.com/console
   - Upload the .aab file and roll out to production!
Guide permanently saved in your project file: GOOGLE_PLAY_PUBLISHING_GUIDE.md`;
              navigator.clipboard?.writeText(guideText);
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <span>Copy Guide &amp; URL</span>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Smartphone,
  Crown,
  Menu,
  X,
  BarChart3,
  Camera,
  MapPin,
  Flag,
  Sliders,
  Music,
  Swords,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenRules: () => void;
  onOpenCustomModal: () => void;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSoundSettings?: () => void;
  onOpenSoundboard?: () => void;
  onOpenGooglePlayGuide: () => void;
  onOpenShop: () => void;
  onOpenHistory?: () => void;
  isStudioCamOpen?: boolean;
  onToggleStudioCam?: () => void;
  isLocationEnabled?: boolean;
  locationCity?: string | null;
  onToggleLocation?: () => void;
  onOpenReport?: () => void;
  onOpenInviteFrenemy?: () => void;
  viralPoints?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRules,
  onOpenCustomModal,
  onResetGame,
  soundEnabled,
  onToggleSound,
  onOpenSoundSettings,
  onOpenSoundboard,
  onOpenGooglePlayGuide,
  onOpenShop,
  onOpenHistory,
  isStudioCamOpen = false,
  onToggleStudioCam,
  isLocationEnabled = false,
  locationCity,
  onToggleLocation,
  onOpenReport,
  onOpenInviteFrenemy,
  viralPoints = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-amber-500/20 backdrop-blur shadow-md">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-xl tracking-tighter">
            RF
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase font-sans">
              Resolution <span className="text-amber-400">Feud</span>
            </span>
            <span className="hidden lg:inline-block ml-3 text-xs text-slate-400 border-l border-slate-700 pl-3">
              The Argument Solver Game Show
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-slate-300 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>How to Play</span>
          </button>
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-slate-300 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Our Real Argument AI</span>
          </button>
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-slate-300 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Decks &amp; Store</span>
          </button>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-slate-300 cursor-pointer"
              title="View Win/Loss History and D3 Charts"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>History</span>
            </button>
          )}
          <button
            onClick={onOpenGooglePlayGuide}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-slate-300 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Google Play</span>
          </button>
          {onOpenInviteFrenemy && (
            <button
              onClick={onOpenInviteFrenemy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 border border-violet-400/50 text-violet-200 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer transition-all shadow-sm"
              title="Generate viral challenge link and earn kickback harmony points!"
            >
              <Swords className="w-3.5 h-3.5 text-violet-400" />
              <span>Invite a Frenemy</span>
              {viralPoints > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-violet-500 text-white text-[9px] font-black">
                  +{viralPoints}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenInviteFrenemy && (
            <button
              onClick={onOpenInviteFrenemy}
              className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-600/30 border border-violet-400/40 text-violet-200 text-xs font-bold cursor-pointer"
              title="Invite a Frenemy Challenge"
            >
              <span>⚔️</span>
            </button>
          )}
          <PWAInstallButton />

          {/* Visual Sound Status Indicator & Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-400/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/70 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-red-500/40 text-slate-400 hover:text-slate-200 hover:border-red-500/70'
            }`}
            title={soundEnabled ? 'Audio is ON (Click to Mute)' : 'Audio is MUTED (Click to Enable)'}
            aria-label={soundEnabled ? 'Audio is ON (Click to Mute)' : 'Audio is MUTED (Click to Enable)'}
          >
            <div className="relative flex items-center justify-center">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400 transition-transform hover:scale-110" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                  soundEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="hidden sm:inline font-mono tracking-tight font-bold">
              {soundEnabled ? 'AUDIO ON' : 'MUTED'}
            </span>
          </button>

          {/* Sound Settings Panel Button */}
          {onOpenSoundSettings && (
            <button
              onClick={onOpenSoundSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer"
              title="Open Sound Settings (Toggle voice effects, chimes, and crowd reactions)"
              aria-label="Studio Sound Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Sound FX</span>
            </button>
          )}

          {/* Live Studio Soundboard Trigger Button */}
          {onOpenSoundboard && (
            <button
              onClick={onOpenSoundboard}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 text-amber-300 text-xs font-bold transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
              title="Open Live Soundboard (Applause, Oops, Rimshot, Airhorn, Voice Cheering)"
              aria-label="Live Studio Soundboard"
            >
              <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Soundboard</span>
            </button>
          )}

          {/* Studio Video / Camera PIP Toggle */}
          {onToggleStudioCam && (
            <button
              onClick={onToggleStudioCam}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                isStudioCamOpen
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm shadow-rose-500/20 ring-1 ring-rose-400/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              title={isStudioCamOpen ? 'Studio Cam is ACTIVE (Click to Close)' : 'Open Studio Video Cam (PIP)'}
              aria-label="Studio Video Camera"
            >
              <div className="relative flex items-center justify-center">
                <Camera className={`w-4 h-4 ${isStudioCamOpen ? 'text-rose-400' : 'text-slate-400'}`} />
                {isStudioCamOpen && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline font-mono tracking-tight font-bold">
                {isStudioCamOpen ? 'CAM LIVE' : 'CAM'}
              </span>
            </button>
          )}

          {/* Geolocation Session Origin Toggle */}
          {onToggleLocation && (
            <button
              onClick={onToggleLocation}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                isLocationEnabled
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm shadow-amber-500/20 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              title={
                isLocationEnabled
                  ? `Location Origin: ${locationCity || 'Detected'} (Click to disable)`
                  : 'Click to detect your city and tag match origin'
              }
              aria-label="Toggle Session Location Origin"
            >
              <MapPin className={`w-3.5 h-3.5 ${isLocationEnabled ? 'text-slate-950' : 'text-amber-400'}`} />
              <span className="hidden sm:inline font-sans truncate max-w-[110px]">
                {isLocationEnabled ? (locationCity ? locationCity.split(',')[0] : 'LOC ON') : 'Location'}
              </span>
            </button>
          )}

          {/* Quick Flag / Report Button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 text-xs font-medium transition-colors cursor-pointer"
              title="Report offensive content or contact safety developers"
            >
              <Flag className="w-3.5 h-3.5 text-rose-400/80" />
              <span>Report</span>
            </button>
          )}

          {/* New Game Button (Desktop) */}
          <button
            onClick={onResetGame}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>New Game</span>
          </button>

          {/* Mobile Menu Hamburger Toggle (Visible on screens < md) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2 animate-fadeIn">
          {onToggleStudioCam && (
            <button
              onClick={() => handleMobileNavClick(onToggleStudioCam)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                isStudioCamOpen
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Camera className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>Studio Video Cam (PIP)</span>
                  {isStudioCamOpen && (
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-900/60 px-1.5 py-0.2 rounded border border-rose-500/40">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {isStudioCamOpen ? 'Tap to close camera' : 'See contestants live on screen'}
                </div>
              </div>
            </button>
          )}

          {onOpenSoundSettings && (
            <button
              onClick={() => handleMobileNavClick(onOpenSoundSettings)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-sm text-left transition-colors cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span>Studio Sound Settings</span>
                  <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded uppercase">
                    FX
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Toggle chimes, crowd applause, and voice effects
                </div>
              </div>
            </button>
          )}

          {onOpenSoundboard && (
            <button
              onClick={() => handleMobileNavClick(onOpenSoundboard)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-yellow-950/50 hover:bg-slate-800 border border-amber-500/50 text-amber-300 font-bold text-sm text-left transition-colors cursor-pointer"
            >
              <Music className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span>Live Studio Soundboard</span>
                  <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded uppercase">
                    PADS
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Play applause, funny oops, air horn, and rimshots
                </div>
              </div>
            </button>
          )}

          {onToggleLocation && (
            <button
              onClick={() => handleMobileNavClick(onToggleLocation)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                isLocationEnabled
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>Session Location Origin</span>
                  {isLocationEnabled && (
                    <span className="text-[10px] uppercase font-bold text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded">
                      {locationCity ? locationCity.split(',')[0] : 'ON'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {isLocationEnabled ? `Tagged: ${locationCity || 'Active'}` : 'Tag your city to match results'}
                </div>
              </div>
            </button>
          )}

          {onOpenReport && (
            <button
              onClick={() => handleMobileNavClick(onOpenReport)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-rose-300 font-bold text-sm text-left transition-colors cursor-pointer"
            >
              <Flag className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div>Safety &amp; Report Content</div>
                <div className="text-[11px] text-slate-400 font-normal">Flag inappropriate content to developers</div>
              </div>
            </button>
          )}

          <button
            onClick={() => handleMobileNavClick(onOpenGooglePlayGuide)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-sm text-left transition-colors cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div>Google Play &amp; Publishing Guide</div>
              <div className="text-[11px] text-slate-400 font-normal">Copy your guide and URL</div>
            </div>
          </button>

          {onOpenHistory && (
            <button
              onClick={() => handleMobileNavClick(onOpenHistory)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-sm text-left transition-colors cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div>Match History &amp; D3 Analytics</div>
                <div className="text-[11px] text-slate-400 font-normal">Win/loss performance &amp; total points</div>
              </div>
            </button>
          )}

          {onOpenInviteFrenemy && (
            <button
              onClick={() => handleMobileNavClick(onOpenInviteFrenemy)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-950/80 to-fuchsia-950/80 border border-violet-500/50 text-violet-200 font-bold text-sm text-left transition-colors cursor-pointer"
            >
              <Swords className="w-5 h-5 text-violet-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span>Invite a Frenemy Challenge</span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-violet-500 text-white">
                    Viral Bounty
                  </span>
                </div>
                <div className="text-[11px] text-violet-300/80 font-normal">
                  Challenge rivals &amp; bank 50% kickback harmony points
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => handleMobileNavClick(onOpenShop)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-sm text-left transition-colors cursor-pointer"
          >
            <Crown className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div>Decks &amp; Store</div>
              <div className="text-[11px] text-slate-400 font-normal">Expansion packs &amp; VIP pass</div>
            </div>
          </button>

          <button
            onClick={() => handleMobileNavClick(onOpenCustomModal)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm text-left transition-colors cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div>Our Real Argument AI</div>
              <div className="text-[11px] text-slate-400 font-normal">Turn your dispute into a round</div>
            </div>
          </button>

          <button
            onClick={() => handleMobileNavClick(onOpenRules)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm text-left transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div>How to Play</div>
              <div className="text-[11px] text-slate-400 font-normal">Game show rules &amp; buzzers</div>
            </div>
          </button>

          <button
            onClick={() => handleMobileNavClick(onResetGame)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-semibold text-left transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Reset &amp; Start New Match</span>
          </button>
        </div>
      )}
    </header>
  );
};

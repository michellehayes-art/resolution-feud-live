import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Camera,
  X,
  Minimize2,
  Maximize2,
  Share2,
  RefreshCw,
  Monitor,
  Download,
  Sparkles,
  Move,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface StudioCamPIPProps {
  isOpen: boolean;
  onClose: () => void;
  team1Name?: string;
  team2Name?: string;
  mode?: string;
}

type DockPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export const StudioCamPIP: React.FC<StudioCamPIPProps> = ({
  isOpen,
  onClose,
  team1Name = 'Partner 1',
  team2Name = 'Partner 2',
  mode = 'COUPLES',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [dockPosition, setDockPosition] = useState<DockPosition>('bottom-right');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [supportsNativePIP, setSupportsNativePIP] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check native browser Picture-in-Picture capability
  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setSupportsNativePIP(true);
    }
  }, []);

  // Initialize or re-initialize camera stream when isOpen changes or device switches
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    startCamera();

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopStream();
    setError(null);
    setIsScreenSharing(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false, // Avoid feedback loop when playing side-by-side
      });

      setStream(mediaStream);
      sounds.playCameraOn();

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      const message =
        err instanceof Error
          ? err.message.includes('Permission')
            ? 'Camera permission denied. Please allow camera access in browser permissions.'
            : err.message
          : 'Unable to access camera.';
      setError(message);
    }
  };

  const startScreenShare = async () => {
    stopStream();
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported on this device/browser.');
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setStream(screenStream);
      setIsScreenSharing(true);
      setIsMirrored(false);
      sounds.playCameraOn();

      // Listen for screen share termination by user
      screenStream.getVideoTracks()[0].onended = () => {
        startCamera();
      };

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
    } catch (err: unknown) {
      console.warn('Screen share error:', err);
      setError('Screen sharing cancelled or unavailable.');
      // Revert to camera
      startCamera();
    }
  };

  // Flip front/back camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Request native OS Picture-in-Picture
  const handleRequestNativePIP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (e) {
        console.warn('Native PIP request failed:', e);
      }
    }
  };

  // Snap photo of contestants
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply mirroring if active
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Game Show Watermark Stamp
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.fillRect(0, canvas.height - 48, canvas.width, 48);

    ctx.fillStyle = '#fbbf24'; // Amber
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('RESOLUTION FEUD', 18, canvas.height - 18);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px sans-serif';
    const tag = `${team1Name} vs ${team2Name}`;
    ctx.fillText(tag, canvas.width - ctx.measureText(tag).width - 18, canvas.height - 18);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhoto(dataUrl);
    sounds.playCameraSnap();
  };

  // Cycle dock corner position
  const handleCycleDock = () => {
    const positions: DockPosition[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const nextIndex = (positions.indexOf(dockPosition) + 1) % positions.length;
    setDockPosition(positions[nextIndex]);
    sounds.playTick();
  };

  if (!isOpen) return null;

  // Dock positioning classes
  const getDockClasses = () => {
    switch (dockPosition) {
      case 'bottom-left':
        return 'bottom-5 left-5';
      case 'top-left':
        return 'top-20 left-5';
      case 'top-right':
        return 'top-20 right-5';
      case 'bottom-right':
      default:
        return 'bottom-5 right-5';
    }
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 pointer-events-auto select-none ${getDockClasses()}`}
    >
      {/* Hidden canvas for capturing full resolution photos */}
      <canvas ref={canvasRef} className="hidden" />

      {/* MINIMIZED FLOATING PILL */}
      {isMinimized ? (
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/95 border-2 border-amber-400/80 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-amber-400/50 flex items-center justify-center shrink-0">
            {stream ? (
              <video
                ref={(el) => {
                  if (el && stream) el.srcObject = stream;
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <Video className="w-5 h-5 text-amber-400" />
            )}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-left pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Studio Cam
            </span>
            <div className="text-xs font-bold text-white truncate max-w-[110px]">
              {mode === 'ROMANCE' ? '💖 Couple Cam' : 'Live Feud Cam'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 transition-colors cursor-pointer"
            title="Expand Studio Cam"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Turn Off Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* EXPANDED PICTURE-IN-PICTURE TV MONITOR */
        <div className="w-[300px] sm:w-[340px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-md animate-fadeIn text-left">
          {/* Header Bar */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-amber-400">
                {isScreenSharing ? 'SCREEN SHARE' : mode === 'ROMANCE' ? '💖 ROMANCE CAM' : 'LIVE STUDIO PIP'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCycleDock}
                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Move PIP to another corner"
              >
                <Move className="w-3.5 h-3.5" />
              </button>
              {supportsNativePIP && (
                <button
                  type="button"
                  onClick={handleRequestNativePIP}
                  className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Pop out to floating OS Picture-in-Picture"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize Camera"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Camera"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video / Snapshot Display Area */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {capturedPhoto ? (
              /* Photo Preview Overlay */
              <div className="relative w-full h-full">
                <img
                  src={capturedPhoto}
                  alt="Resolution Feud Snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-4 text-center animate-fadeIn">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Victory Snapshot Captured!
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={capturedPhoto}
                      download={`resolution-feud-moment-${Date.now()}.png`}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Photo</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : error ? (
              /* Error / Permission Blocked Message */
              <div className="p-4 text-center space-y-2">
                <VideoOff className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-xs text-red-300 font-semibold leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Camera</span>
                </button>
              </div>
            ) : (
              /* Live Video Feed */
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />
                {/* Contestant TV Watermark */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/75 border border-amber-400/40 text-[10px] font-bold text-amber-300 tracking-wider uppercase pointer-events-none">
                  {team1Name} vs {team2Name}
                </div>
              </>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                  isMirrored
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Mirror Camera Image"
              >
                Mirror
              </button>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                title="Flip Front/Rear Camera"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Flip</span>
              </button>
              <button
                type="button"
                onClick={isScreenSharing ? startCamera : startScreenShare}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                  isScreenSharing
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Screen Sharing"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">{isScreenSharing ? 'Cam' : 'Screen'}</span>
              </button>
            </div>

            {/* Snapshot Shutter Button */}
            {!capturedPhoto && !error && (
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Snap a photo of contestants"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap 📸</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

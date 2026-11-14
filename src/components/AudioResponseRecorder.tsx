import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, AlertCircle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

// Cross-browser TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface AudioResponseRecorderProps {
  onTranscript: (transcript: string) => void;
  onAutoSubmit?: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AudioResponseRecorder: React.FC<AudioResponseRecorderProps> = ({
  onTranscript,
  onAutoSubmit,
  disabled = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check Web Speech API availability on mount
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = () => {
    if (disabled || isRecording) return;
    setErrorMessage(null);
    setInterimText('');

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        sounds.playTick();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          setInterimText(currentText);
          onTranscript(currentText);
        }

        if (finalTranscript && finalTranscript.trim()) {
          const cleanText = finalTranscript.trim();
          onTranscript(cleanText);
          if (onAutoSubmit) {
            // Slight delay so the user sees their speech populate before submission
            setTimeout(() => {
              onAutoSubmit(cleanText);
            }, 400);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setErrorMessage('No voice detected. Please try again closer to the microphone.');
        } else if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setErrorMessage('Could not activate microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      sounds.playTick();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Web Speech API not supported on this browser (supported on Chrome, Edge, and Safari)"
        className={`px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-60 ${className}`}
      >
        <MicOff className="w-4 h-4" />
        <span className="hidden sm:inline">Voice Input Unavailable</span>
      </button>
    );
  }

  return (
    <div className="relative inline-flex flex-col">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        title={isRecording ? 'Click to stop recording' : 'Record voice answer hands-free with Web Speech API'}
        className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border select-none disabled:opacity-50 ${
          isRecording
            ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-lg shadow-red-500/30 animate-pulse'
            : 'bg-slate-950 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400'
        } ${className}`}
      >
        {isRecording ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Record Audio Response</span>
            <span className="sm:hidden">Voice</span>
          </>
        )}
      </button>

      {/* Floating Listening Feedback Bubble */}
      {isRecording && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-3 py-1 rounded-full bg-red-950/95 border border-red-500 text-red-200 text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-1.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>Speak your resolution solution now...</span>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="absolute left-0 right-0 -bottom-8 z-50 text-[11px] text-red-300 flex items-center gap-1 bg-red-950/90 border border-red-500/40 px-2 py-0.5 rounded shadow">
          <AlertCircle className="w-3 h-3 shrink-0 text-red-400" />
          <span className="truncate">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-xs text-red-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

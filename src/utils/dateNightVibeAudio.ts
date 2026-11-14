/**
 * Pure Browser Web Audio API Date Night Vibe Synthesizer
 * Provides 100% offline, zero-dependency musical moods:
 * - Romantic Jazz (Lush 9th chords, warm Rhodes piano & walking bass)
 * - Chill Acoustic (Warm fingerpicked guitar arpeggios)
 * - Candlelit Lo-Fi (Mellow electric keys & vinyl crackle)
 * - Bossa Nova Sunset (Syncopated nylon chords & beachside rhythm)
 * - Starlight Ambient (Dreamy celestial pads & glass chimes)
 */

export interface DateNightVibe {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  bpm: number;
  paletteColor: string;
  accentBg: string;
  borderColor: string;
  description: string;
}

export const DATE_NIGHT_VIBES: DateNightVibe[] = [
  {
    id: 'romantic-jazz',
    name: 'Romantic Jazz',
    icon: '🎷',
    subtitle: 'Lush Rhodes Piano & Warm Walking Bass',
    bpm: 70,
    paletteColor: 'text-amber-300',
    accentBg: 'bg-amber-500/20 text-amber-300',
    borderColor: 'border-amber-400/50',
    description: 'Smooth late-night lounge chords (Dm9 → G13 → Cmaj9 → Am9) with gentle brushed swing.',
  },
  {
    id: 'chill-acoustic',
    name: 'Chill Acoustic',
    icon: '🎸',
    subtitle: 'Fingerpicked Folk Guitars & Cozy Intimacy',
    bpm: 82,
    paletteColor: 'text-emerald-300',
    accentBg: 'bg-emerald-500/20 text-emerald-300',
    borderColor: 'border-emerald-400/50',
    description: 'Warm plucked nylon guitar arpeggios in D major (D → F#m7 → Gmaj7 → Aadd9).',
  },
  {
    id: 'candlelit-lofi',
    name: 'Candlelit Lo-Fi',
    icon: '☕',
    subtitle: 'Mellow Electric Keys & Vinyl Warmth',
    bpm: 74,
    paletteColor: 'text-purple-300',
    accentBg: 'bg-purple-500/20 text-purple-300',
    borderColor: 'border-purple-400/50',
    description: 'Nostalgic detuned tape keys with gentle vinyl crackle and a relaxed chillhop pulse.',
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova Sunset',
    icon: '🍷',
    subtitle: 'Breezy Classical Chords & Seaside Clave',
    bpm: 108,
    paletteColor: 'text-rose-300',
    accentBg: 'bg-rose-500/20 text-rose-300',
    borderColor: 'border-rose-400/50',
    description: 'Syncopated Brazilian acoustic guitar rhythm with soft shaker and warm acoustic bass.',
  },
  {
    id: 'starlight-ambient',
    name: 'Starlight Ambient',
    icon: '🌌',
    subtitle: 'Celestial Pad Drones & Twinkling Chimes',
    bpm: 58,
    paletteColor: 'text-cyan-300',
    accentBg: 'bg-cyan-500/20 text-cyan-300',
    borderColor: 'border-cyan-400/50',
    description: 'Dreamy lowpass-filtered synth pads and crystalline fifths for deep stargazing romance.',
  },
];

export interface VibePlayerState {
  isPlaying: boolean;
  activeVibeId: string;
  volume: number;
  autoPlayOnUnwrap: boolean;
  secondsElapsed: number;
}

type StateListener = (state: VibePlayerState) => void;

class DateNightVibeSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentVibeId: string = 'romantic-jazz';
  private volume: number = 0.75;
  private autoPlayOnUnwrap: boolean = true;
  private loopInterval: number | null = null;
  private timerInterval: number | null = null;
  private secondsElapsed: number = 0;
  private listeners: Set<StateListener> = new Set();
  private measureIndex: number = 0;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const savedVibe = localStorage.getItem('rf_date_night_vibe');
      if (savedVibe && DATE_NIGHT_VIBES.some((v) => v.id === savedVibe)) {
        this.currentVibeId = savedVibe;
      }
      const savedAuto = localStorage.getItem('rf_vibe_autoplay');
      if (savedAuto !== null) {
        this.autoPlayOnUnwrap = savedAuto === 'true';
      }
      const savedVol = localStorage.getItem('rf_vibe_vol');
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol) || 0.75));
      }
    } catch {
      // ignore
    }
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public subscribe(fn: StateListener): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  public getState(): VibePlayerState {
    return {
      isPlaying: this.isPlaying,
      activeVibeId: this.currentVibeId,
      volume: this.volume,
      autoPlayOnUnwrap: this.autoPlayOnUnwrap,
      secondsElapsed: this.secondsElapsed,
    };
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_vibe_vol', String(this.volume));
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public setAutoPlayOnUnwrap(val: boolean) {
    this.autoPlayOnUnwrap = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_vibe_autoplay', String(val));
    }
    this.notify();
  }

  public selectVibe(vibeId: string) {
    if (!DATE_NIGHT_VIBES.some((v) => v.id === vibeId)) return;
    this.currentVibeId = vibeId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_date_night_vibe', vibeId);
    }
    this.measureIndex = 0;
    if (this.isPlaying) {
      // Re-trigger with new vibe
      this.stop();
      this.play(vibeId);
    } else {
      this.notify();
    }
  }

  public togglePlay(vibeId?: string) {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(vibeId);
    }
  }

  public play(vibeId?: string) {
    if (vibeId && DATE_NIGHT_VIBES.some((v) => v.id === vibeId)) {
      this.currentVibeId = vibeId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('rf_date_night_vibe', vibeId);
      }
    }

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.measureIndex = 0;
    this.notify();

    // Start timer for progress
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      this.secondsElapsed += 1;
      this.notify();
    }, 1000);

    // Schedule initial measure
    this.scheduleMeasure();

    // Setup recurring loop based on BPM
    const vibe = DATE_NIGHT_VIBES.find((v) => v.id === this.currentVibeId) || DATE_NIGHT_VIBES[0];
    const measureDurationSec = (60 / vibe.bpm) * 4;

    if (this.loopInterval) clearInterval(this.loopInterval);
    this.loopInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.scheduleMeasure();
      }
    }, measureDurationSec * 1000);
  }

  public pause() {
    this.isPlaying = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.notify();
  }

  public stop() {
    this.pause();
    this.secondsElapsed = 0;
    this.measureIndex = 0;
    this.notify();
  }

  /**
   * Schedule 1 measure of music for the current vibe
   */
  private scheduleMeasure() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const vibe = DATE_NIGHT_VIBES.find((v) => v.id === this.currentVibeId) || DATE_NIGHT_VIBES[0];
    const now = this.ctx.currentTime + 0.05;
    const beat = 60 / vibe.bpm;

    switch (this.currentVibeId) {
      case 'romantic-jazz':
        this.playJazzMeasure(now, beat, this.measureIndex);
        break;
      case 'chill-acoustic':
        this.playAcousticMeasure(now, beat, this.measureIndex);
        break;
      case 'candlelit-lofi':
        this.playLoFiMeasure(now, beat, this.measureIndex);
        break;
      case 'bossa-nova':
        this.playBossaMeasure(now, beat, this.measureIndex);
        break;
      case 'starlight-ambient':
      default:
        this.playAmbientMeasure(now, beat, this.measureIndex);
        break;
    }

    this.measureIndex = (this.measureIndex + 1) % 4;
  }

  // ========================================================================
  // 1. ROMANTIC JAZZ SYNTHESIS
  // Progresses: Dm9 -> G13 -> Cmaj9 -> A7alt
  // ========================================================================
  private playJazzMeasure(now: number, beat: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      // Dm9: D3, F3, A3, C4, E4
      { bass: 146.83, chord: [174.61, 220.0, 261.63, 329.63] },
      // G13: G2, F3, B3, E4
      { bass: 98.0, chord: [174.61, 246.94, 329.63, 392.0] },
      // Cmaj9: C3, E3, G3, B3, D4
      { bass: 130.81, chord: [164.81, 196.0, 246.94, 293.66] },
      // A7alt: A2, G3, C#4, F4
      { bass: 110.0, chord: [196.0, 277.18, 349.23, 440.0] },
    ];

    const current = chords[step % chords.length];

    // Warm Rhodes Piano chord (sine with slight overdrive and tremolo)
    current.chord.forEach((freq, idx) => {
      this.synthesizeRhodesTone(freq, now + idx * 0.03, beat * 3.4, 0.14);
    });

    // Walking acoustic upright bass on beats 1 and 3
    this.synthesizeUprightBass(current.bass, now, beat * 1.8, 0.28);
    this.synthesizeUprightBass(current.bass * 1.25, now + beat * 2, beat * 1.8, 0.24);

    // Mellow brushed ride cymbal tap on beats 2 and 4
    this.synthesizeBrushedTap(now + beat, 0.06);
    this.synthesizeBrushedTap(now + beat * 3, 0.08);
  }

  // ========================================================================
  // 2. CHILL ACOUSTIC GUITAR SYNTHESIS
  // Progresses in D: D -> F#m7 -> Gmaj7 -> Aadd9
  // ========================================================================
  private playAcousticMeasure(now: number, beat: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    const patterns = [
      // D major: D3, A3, D4, F#4
      [146.83, 220.0, 293.66, 369.99, 293.66, 220.0, 369.99, 293.66],
      // F#m7: F#3, A3, C#4, E4
      [185.0, 220.0, 277.18, 329.63, 277.18, 220.0, 329.63, 277.18],
      // Gmaj7: G3, B3, D4, F#4
      [196.0, 246.94, 293.66, 369.99, 293.66, 246.94, 369.99, 293.66],
      // Aadd9: A3, C#4, E4, B4
      [220.0, 277.18, 329.63, 493.88, 329.63, 277.18, 493.88, 329.63],
    ];

    const currentNotes = patterns[step % patterns.length];
    const subBeat = (beat * 4) / 8;

    currentNotes.forEach((freq, idx) => {
      this.synthesizePluckedGuitar(freq, now + idx * subBeat, subBeat * 2.2, 0.16);
    });

    // Deep warm guitar body resonance on beat 1
    this.synthesizeGuitarBody(currentNotes[0] * 0.5, now, beat * 3.5, 0.18);
  }

  // ========================================================================
  // 3. CANDLELIT LO-FI SYNTHESIS
  // Progresses: Ebmaj7 -> Cm7 -> Fm7 -> Bb7
  // ========================================================================
  private playLoFiMeasure(now: number, beat: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      // Ebmaj7: Eb3, G3, Bb3, D4
      { bass: 155.56, notes: [196.0, 233.08, 293.66] },
      // Cm7: C3, Eb3, G3, Bb3
      { bass: 130.81, notes: [155.56, 196.0, 233.08] },
      // Fm7: F3, Ab3, C4, Eb4
      { bass: 174.61, notes: [207.65, 261.63, 311.13] },
      // Bb7: Bb2, D3, F3, Ab3
      { bass: 116.54, notes: [146.83, 174.61, 207.65] },
    ];

    const c = chords[step % chords.length];

    // Detuned warm tape Rhodes chords
    c.notes.forEach((freq) => {
      this.synthesizeLoFiKey(freq, now, beat * 3.6, 0.13);
    });

    // Sub-bass thump
    this.synthesizeSubBass(c.bass, now, beat * 2.2, 0.24);

    // Warm Lo-Fi kick and rim
    this.synthesizeLoFiKick(now, 0.22);
    this.synthesizeLoFiRim(now + beat * 2, 0.12);

    // Continuous warm vinyl crackle
    this.synthesizeVinylCrackle(now, beat * 4, 0.035);
  }

  // ========================================================================
  // 4. BOSSA NOVA SUNSET SYNTHESIS
  // Syncopated nylon guitar chords & beachside clave
  // ========================================================================
  private playBossaMeasure(now: number, beat: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      // Am7: A2 bass, C4, E4, G4, B4
      { bass: 110.0, chord: [261.63, 329.63, 392.0, 493.88] },
      // D9: D3 bass, F#3, C4, E4
      { bass: 146.83, chord: [185.0, 261.63, 329.63] },
      // Gmaj7: G2 bass, B3, D4, F#4
      { bass: 98.0, chord: [246.94, 293.66, 369.99] },
      // Cmaj7: C3 bass, E3, B3, D4
      { bass: 130.81, chord: [164.81, 246.94, 293.66] },
    ];

    const c = chords[step % chords.length];

    // Bossa nova bass on beat 1 and 3
    this.synthesizeUprightBass(c.bass, now, beat * 1.5, 0.25);
    this.synthesizeUprightBass(c.bass * 1.5, now + beat * 2, beat * 1.5, 0.22);

    // Classic syncopated Bossa comping rhythm: 1, 1.75, 2.5, 3.5
    const compingTimes = [now + 0.05, now + beat * 1.5, now + beat * 2.5, now + beat * 3.25];
    compingTimes.forEach((t) => {
      c.chord.forEach((freq, idx) => {
        this.synthesizePluckedGuitar(freq, t + idx * 0.015, beat * 0.9, 0.12);
      });
    });

    // Shaker / cabasa pattern on every 8th note
    for (let i = 0; i < 8; i++) {
      this.synthesizeShaker(now + (beat * 4 * i) / 8, i % 2 === 0 ? 0.05 : 0.08);
    }
  }

  // ========================================================================
  // 5. STARLIGHT AMBIENT SYNTHESIS
  // Celestial Drone Pad & Twinkling Chimes
  // ========================================================================
  private playAmbientMeasure(now: number, beat: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    const padChords = [
      [220.0, 277.18, 329.63, 440.0], // A major
      [196.0, 246.94, 293.66, 392.0], // G major
      [164.81, 220.0, 261.63, 329.63], // F#m / Dmaj7
      [220.0, 277.18, 369.99, 440.0], // F#m9 / A
    ];

    const chord = padChords[step % padChords.length];

    // Warm celestial evolving pad with slow attack and release
    chord.forEach((freq) => {
      this.synthesizeAmbientPad(freq, now, beat * 4.2, 0.1);
    });

    // Twinkling glass chimes
    const chimePitches = [659.25, 880.0, 1108.7, 1318.5, 1760.0];
    const chimeTimes = [now + beat * 0.8, now + beat * 2.2, now + beat * 3.4];

    chimeTimes.forEach((t) => {
      const p = chimePitches[Math.floor(Math.random() * chimePitches.length)];
      this.synthesizeGlassChime(p, t, beat * 1.5, 0.08);
    });
  }

  // ========================================================================
  // SOUND SYNTHESIS PRIMITIVES (High-Fidelity Audio Nodes)
  // ========================================================================

  private synthesizeRhodesTone(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    // Fundamental Sine
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle 2nd harmonic for tines
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.005, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    gain2.gain.setValueAtTime(0.001, startTime);
    gain2.gain.linearRampToValueAtTime(vol * 0.25, startTime + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(filter);
    gain2.connect(filter);
    filter.connect(this.masterGain);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  private synthesizePluckedGuitar(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, startTime);
    filter.frequency.exponentialRampToValueAtTime(500, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeGuitarBody(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeUprightBass(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle pitch drop simulating string pluck
    osc.frequency.exponentialRampToValueAtTime(freq * 0.985, startTime + 0.1);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeLoFiKey(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    // Tape flutter detune
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.002, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeSubBass(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeAmbientPad(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.004, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, startTime);
    filter.frequency.linearRampToValueAtTime(750, startTime + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(400, startTime + duration);

    // Slow atmospheric attack and release
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  private synthesizeGlassChime(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeBrushedTap(startTime: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(startTime);
      noise.stop(startTime + 0.08);
    } catch {
      // ignore
    }
  }

  private synthesizeShaker(startTime: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4200, startTime);
      filter.Q.setValueAtTime(4, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(startTime);
      noise.stop(startTime + 0.05);
    } catch {
      // ignore
    }
  }

  private synthesizeLoFiKick(startTime: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(120, startTime);
    osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.12);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.14);
  }

  private synthesizeLoFiRim(startTime: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.04);
  }

  private synthesizeVinylCrackle(startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Sparse clicks and soft pink noise
        data[i] = Math.random() < 0.015 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.08;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, startTime);
      filter.Q.setValueAtTime(2, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(startTime);
      noise.stop(startTime + duration);
    } catch {
      // ignore
    }
  }
}

export const dateNightAudio = new DateNightVibeSynthesizer();

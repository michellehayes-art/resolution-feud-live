/**
 * Web Audio API Synthesizer for Resolution Feud
 * Pure browser-synthesized audio: zero external mp3 dependencies, 100% reliable offline.
 * Includes custom harmonic chimes for answer rankings and authentic crowd applause/cheering.
 */

export interface SoundCategorySettings {
  master: boolean;
  gameChimes: boolean;       // Correct answer dings, card flip, timer ticks, bell rings
  crowdReactions: boolean;   // Live studio crowd cheering, applause, and roars
  voiceEffects: boolean;     // Theatrical magical wizard announcer voice
  buzzers: boolean;          // Strike buzzers, team face-off buzzers
  fanfares: boolean;         // Win fanfares & celebratory sequence
}

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public categories: SoundCategorySettings = {
    master: true,
    gameChimes: true,
    crowdReactions: true,
    voiceEffects: true,
    buzzers: true,
    fanfares: true,
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('rf_sound_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          this.categories = { ...this.categories, ...parsed };
          this.enabled = this.categories.master;
        }
      } catch (e) {
        console.warn('Could not load sound settings:', e);
      }
    }
  }

  public saveSettings() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rf_sound_settings', JSON.stringify(this.categories));
      } catch (e) {
        console.warn('Could not save sound settings:', e);
      }
    }
  }

  public setCategory(key: keyof SoundCategorySettings, value: boolean) {
    this.categories[key] = value;
    if (key === 'master') {
      this.enabled = value;
    }
    this.saveSettings();
  }

  public toggleCategory(key: keyof SoundCategorySettings): boolean {
    const next = !this.categories[key];
    this.setCategory(key, next);
    return next;
  }

  public getSettings(): SoundCategorySettings {
    return { ...this.categories };
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    this.categories.master = this.enabled;
    this.saveSettings();
    return this.enabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Helper: Create a resonant metallic bell / chime tone with natural overtones
   */
  private createChimeTone(
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.25,
    sparkle: boolean = false
  ) {
    if (!this.ctx) return;
    const now = startTime;

    // Fundamental partial
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + duration);

    // Harmonic bell partial (2.76x frequency simulates silver/bronze tubular chime)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = sparkle ? 'triangle' : 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    gain2.gain.setValueAtTime(volume * 0.4, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + duration * 0.7);

    // High crystalline shimmer partial (5.4x frequency)
    if (sparkle) {
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 5.4, now);

      gain3.gain.setValueAtTime(volume * 0.2, now);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.4);

      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);
      osc3.start(now);
      osc3.stop(now + duration * 0.4);
    }
  }

  /**
   * Unique Chimes for Correct Answers
   * Plays dynamic harmonic chimes based on rank (e.g. #1 Top Answer gets a celebratory gold shimmer!)
   */
  public playCorrectAnswerChime(rank: number = 1) {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (rank === 1) {
      // #1 TOP ANSWER: Majestic 4-Tone Golden Chime Shimmer (F5 -> A5 -> C6 -> F6)
      const topChimes = [
        { f: 698.46, t: 0, d: 0.9 },     // F5
        { f: 880.0, t: 0.09, d: 1.0 },   // A5
        { f: 1046.5, t: 0.18, d: 1.2 },  // C6
        { f: 1396.91, t: 0.27, d: 1.5 }, // F6 (Golden peak)
      ];

      topChimes.forEach((c) => {
        this.createChimeTone(c.f, now + c.t, c.d, 0.28, true);
      });
    } else if (rank <= 3) {
      // HIGH RANK (2-3): Bright Ascending Celestial Triad (E5 -> G#5 -> B5 -> E6)
      const highChimes = [
        { f: 659.25, t: 0, d: 0.8 },
        { f: 830.61, t: 0.08, d: 0.9 },
        { f: 987.77, t: 0.16, d: 1.1 },
        { f: 1318.51, t: 0.24, d: 1.3 },
      ];

      highChimes.forEach((c) => {
        this.createChimeTone(c.f, now + c.t, c.d, 0.24, true);
      });
    } else {
      // GENERAL CORRECT: Crisp 3-Tone Sweet Bell Chime (C5 -> E5 -> G5)
      const sweetChimes = [
        { f: 523.25, t: 0, d: 0.65 },
        { f: 659.25, t: 0.09, d: 0.75 },
        { f: 783.99, t: 0.18, d: 1.0 },
      ];

      sweetChimes.forEach((c) => {
        this.createChimeTone(c.f, now + c.t, c.d, 0.22, false);
      });
    }
  }

  // Classic Family Feud Correct Ding (wrapper for backward compatibility)
  public playDing(rank: number = 2) {
    this.playCorrectAnswerChime(rank);
  }

  /**
   * Authentic Studio Audience Crowd Cheering & Applause Sound Effect
   * Synthesizes thousands of clapping transients and ecstatic crowd cheers using Web Audio.
   */
  public playCrowdCheer(durationSeconds: number = 2.8) {
    if (!this.enabled || !this.categories.crowdReactions) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = Math.max(1.5, durationSeconds);

    // 1. Synthesize Applause (Clapping Noise Bed)
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const leftChannel = noiseBuffer.getChannelData(0);
    const rightChannel = noiseBuffer.getChannelData(1);

    // Fill buffer with dense, bursty clapping transients
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Irregular amplitude burst function simulating collective handclaps
      const clapPulsing =
        Math.sin(2 * Math.PI * 14 * t) * 0.3 +
        Math.sin(2 * Math.PI * 23 * t + 0.5) * 0.25 +
        Math.sin(2 * Math.PI * 37 * t + 1.2) * 0.2 +
        0.7;

      const whiteNoiseL = (Math.random() * 2 - 1) * Math.max(0.1, clapPulsing);
      const whiteNoiseR = (Math.random() * 2 - 1) * Math.max(0.1, clapPulsing);

      leftChannel[i] = whiteNoiseL;
      rightChannel[i] = whiteNoiseR;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Filter clapping noise to realistic hand acoustic frequency range (800Hz - 2200Hz)
    const bandpassFilter = ctx.createBiquadFilter();
    bandpassFilter.type = 'bandpass';
    bandpassFilter.frequency.setValueAtTime(1400, now);
    bandpassFilter.Q.setValueAtTime(0.8, now);

    const highpassFilter = ctx.createBiquadFilter();
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.setValueAtTime(500, now);

    // Master Applause Gain Envelope: Swell up, roar, and fade down
    const applauseGain = ctx.createGain();
    applauseGain.gain.setValueAtTime(0.001, now);
    applauseGain.gain.exponentialRampToValueAtTime(0.38, now + 0.35); // Rapid crowd roar entry
    applauseGain.gain.setValueAtTime(0.38, now + dur * 0.55);
    applauseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noiseSource.connect(bandpassFilter);
    bandpassFilter.connect(highpassFilter);
    highpassFilter.connect(applauseGain);
    applauseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + dur);

    // 2. Synthesize Vocal Crowd Cheer / Whoop Swell ("Wooo! Yeah!")
    const vocalPitches = [
      { startFreq: 330, endFreq: 520, delay: 0.05, dur: 1.4, vol: 0.12 },
      { startFreq: 392, endFreq: 587, delay: 0.15, dur: 1.6, vol: 0.14 },
      { startFreq: 440, endFreq: 659, delay: 0.25, dur: 1.5, vol: 0.11 },
    ];

    vocalPitches.forEach((v) => {
      const osc = ctx.createOscillator();
      const vocalFilter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(v.startFreq, now + v.delay);
      osc.frequency.exponentialRampToValueAtTime(v.endFreq, now + v.delay + v.dur * 0.4);
      osc.frequency.linearRampToValueAtTime(v.startFreq * 1.1, now + v.delay + v.dur);

      // Vocal formant filter (mimics crowd cheering vowel "Ooo" -> "Ahhh")
      vocalFilter.type = 'bandpass';
      vocalFilter.frequency.setValueAtTime(750, now + v.delay);
      vocalFilter.frequency.exponentialRampToValueAtTime(1100, now + v.delay + v.dur * 0.5);
      vocalFilter.Q.setValueAtTime(2.5, now + v.delay);

      gain.gain.setValueAtTime(0.0001, now + v.delay);
      gain.gain.exponentialRampToValueAtTime(v.vol, now + v.delay + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + v.delay + v.dur);

      osc.connect(vocalFilter);
      vocalFilter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + v.delay);
      osc.stop(now + v.delay + v.dur);
    });
  }

  /**
   * Complete Celebratory Victory Sequence
   * Triggers the game show brass fanfare, sparkling triumph chimes, and roar of crowd cheering!
   */
  public playCelebrationSequence() {
    if (!this.enabled) return;
    this.playWinFanfare();
    this.playCrowdCheer(3.0);
    setTimeout(() => {
      this.playCorrectAnswerChime(1);
    }, 450);
  }

  // Strike Buzzer (Classic harsh dual-sawtooth buzz)
  public playStrike() {
    if (!this.enabled || !this.categories.buzzers) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130.81, now); // C3
    osc1.frequency.linearRampToValueAtTime(123.47, now + 0.4); // B2

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(138.59, now); // C#3 (dissonance)
    osc2.frequency.linearRampToValueAtTime(130.81, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // Triple Strike (Three rapid buzzes for 3 strikes or round loss)
  public playTripleStrike() {
    if (!this.enabled || !this.categories.buzzers) return;
    this.playStrike();
    setTimeout(() => this.playStrike(), 220);
    setTimeout(() => this.playStrike(), 440);
  }

  /**
   * Unique Team Face-Off Buzzers
   * Each team has its own distinctive, punchy synthesizer buzzer signature
   * so players and audience instantly recognize who claimed the turn by ear!
   */
  public playTeamBuzzer(teamId: 1 | 2 = 1) {
    if (!this.enabled || !this.categories.buzzers) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (teamId === 1) {
      // TEAM 1 BUZZER: Bright Electric Arcade Game-Show Bell / Klaxon
      // Ascending dual square/saw punch: 587.33Hz (D5) -> 880Hz (A5) with crystalline harmonic overtone
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(880, now + 0.07);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1174.66, now); // Octave overtone
      osc2.frequency.setValueAtTime(1760, now + 0.07);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.32);
      osc2.stop(now + 0.32);
    } else {
      // TEAM 2 BUZZER: Deep Resonant Electronic Horn / Cyber Klaxon
      // Booming authoritative drop: 311.13Hz (Eb4) -> 220Hz (A3) with sub-bass punch (110Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(311.13, now);
      osc1.frequency.linearRampToValueAtTime(220, now + 0.1);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(155.56, now); // Sub-octave grit
      osc2.frequency.linearRampToValueAtTime(110, now + 0.1);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(1.5, now);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    }
  }

  // Podium Face-Off Buzzer (Delegates to unique team buzzer)
  public playBuzzer(teamId: 1 | 2 = 1) {
    this.playTeamBuzzer(teamId);
  }

  // Card Flip Mechanical Sound
  public playFlip() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Win Fanfare
  public playWinFanfare() {
    if (!this.enabled || !this.categories.fanfares) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12, t: 0 },    // C5
      { f: 659.25, d: 0.12, t: 0.14 }, // E5
      { f: 783.99, d: 0.14, t: 0.28 }, // G5
      { f: 1046.5, d: 0.45, t: 0.44 }, // C6
    ];

    const now = this.ctx.currentTime;
    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.3, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  // Timer Tick
  public playTick() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Loud Magical Entrance Soundscape
   * Deep resonant cosmic gong + high-sparkle ascending crystalline arpeggios
   */
  public playMagicalEntrance() {
    if (!this.enabled || !this.categories.voiceEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Deep cinematic low brass / mystical gong sweep (140Hz -> 55Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 1.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 1.8);

    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    subOsc.connect(filter);
    filter.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 2.2);

    // 2. Ascending crystalline magic sparkle notes (Pentatonic Celestial Arpeggio)
    const sparkleNotes = [
      { f: 523.25, t: 0.05, d: 0.8 },  // C5
      { f: 659.25, t: 0.16, d: 0.8 },  // E5
      { f: 783.99, t: 0.28, d: 0.9 },  // G5
      { f: 1046.50, t: 0.40, d: 1.1 }, // C6
      { f: 1318.51, t: 0.52, d: 1.2 }, // E6
      { f: 1567.98, t: 0.65, d: 1.4 }, // G6
      { f: 2093.00, t: 0.80, d: 1.8 }, // C7 (Grand Starburst)
    ];

    sparkleNotes.forEach((n) => {
      this.createChimeTone(n.f, now + n.t, n.d, 0.28, true);
    });
  }

  /**
   * Speak with a loud, magical, serious-yet-hilarious booming game show voice
   */
  public speakMagicalAnnouncement(
    text: string = 'You have entered Resolution Feud! Prepare thy compromises, and enjoy, everyone!'
  ) {
    if (!this.enabled || !this.categories.voiceEffects) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Trigger magical audio accompaniment
    this.playMagicalEntrance();

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0; // Max loud
      utterance.rate = 0.88;  // Theatrical, deliberate, grand
      utterance.pitch = 0.72; // Deep, magical, serious-yet-funny wizard cadence

      // Pick the best available dramatic voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Daniel') ||
                v.name.includes('Alex') ||
                v.name.includes('Male') ||
                v.name.includes('David') ||
                v.name.includes('George') ||
                v.name.includes('Google US English'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferred) {
          utterance.voice = preferred;
        }
      }

      // Small delay so magical chime sounds first before speech begins
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 150);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Energetic TV Game Show Host voice announcing who owes what prize
   */
  public speakPrizeVerdict(params: {
    sender: string;
    recipient: string;
    prizeTitle: string;
    voucherType?: string;
    pledge?: string;
  }) {
    if (!this.enabled || !this.categories.voiceEffects) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const { sender, recipient, prizeTitle, voucherType = '' } = params;
    const typeLower = (voucherType + ' ' + prizeTitle).toLowerCase();

    let text = `Ladies and gentlemen! The verdict is officially in! ${sender} owes ${recipient} a ${prizeTitle}! Disagreements settled in full!`;

    if (typeLower.includes('dinner') || typeLower.includes('cook')) {
      text = `Attention studio audience! The dispute has been settled, and the verdict is final! ${sender} officially owes ${recipient} a deluxe homemade three-course dinner! Complete with appetizers, fine wine, and one hundred percent kitchen cleanup! Dish duty is on you, ${sender}!`;
    } else if (typeLower.includes('massage')) {
      text = `Hold the buzzers and grab the essential oils! ${sender} has officially pledged a deluxe fifteen-minute candlelit back and shoulder massage for ${recipient}! Strict minimum of fifteen minutes, deep sighs of relief guaranteed!`;
    } else if (typeLower.includes('rose')) {
      text = `Hear ye, hear ye! A romantic truce has been declared in the studio! ${recipient} is officially awarded one full dozen fresh long-stem roses and sweet treats, courtesy of ${sender}! Arguments dissolved in sweet romance!`;
    } else if (typeLower.includes('movie')) {
      text = `Total remote control dominion has been surrendered! ${recipient} is officially crowned Movie Night Czar! ${sender} must deliver hot buttered popcorn on demand and no questioning the film plot!`;
    } else if (typeLower.includes('breakfast')) {
      text = `Order up for the royal suite! ${recipient} gets to sleep in this weekend while ${sender} serves warm golden croissants and fresh custom coffee directly in bed!`;
    } else if (typeLower.includes('ice cream') || typeLower.includes('cream')) {
      text = `Sound the late-night siren! ${sender} is taking ${recipient} on a midnight pajama ice cream run! First choice of waffle cones and all extra fudge toppings on ${sender}!`;
    } else if (typeLower.includes('chore')) {
      text = `Household emergency averted! ${recipient} has been granted twenty-four hours of complete chore immunity! ${sender} assumes all dish, laundry, and trash duties with a cheerful smile!`;
    } else if (typeLower.includes('trip') || typeLower.includes('getaway')) {
      text = `Pack your bags! ${sender} is taking ${recipient} on a scenic day trip getaway! ${sender} is the chauffeur, tour guide, and snack provider for the day!`;
    }

    try {
      window.speechSynthesis.cancel();

      // Play dramatic buzzer & fanfare before speech
      this.playTeamBuzzer(1);
      setTimeout(() => this.playCorrectAnswerChime(1), 160);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0;
      utterance.rate = 0.94; // Energetic, broadcast pacing
      utterance.pitch = 1.05; // Bright, engaging broadcast tone

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Daniel') ||
                v.name.includes('Alex') ||
                v.name.includes('Samantha') ||
                v.name.includes('David'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferred) utterance.voice = preferred;
      }

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 350);
    } catch (e) {
      console.warn('Speech synthesis prize error:', e);
    }
  }

  /**
   * Shutter snap sound for camera picture-in-picture snapshot
   */
  public playCameraSnap() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Shutter mechanical click (burst of high-passed noise + quick pop)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    // Second shutter blade click
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(650, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(250, now + 0.12);

    gain2.gain.setValueAtTime(0.3, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.14);
  }

  /**
   * Video cam activation chime
   */
  public playCameraOn() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.createChimeTone(587.33, now, 0.2, 0.2); // D5
    this.createChimeTone(880.0, now + 0.08, 0.35, 0.25); // A5
  }

  // ==========================================
  // SOUNDBOARD SOUNDS
  // ==========================================

  /**
   * Funny "Oops" / Sad Trombone ("Wah-wah-wah-waaaah")
   * 4 comedic descending notes with plunger mute vibrato
   */
  public playOops() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 293.66, t: 0.0, d: 0.26 }, // D4
      { f: 277.18, t: 0.28, d: 0.26 }, // C#4
      { f: 261.63, t: 0.56, d: 0.26 }, // C4
      { f: 246.94, t: 0.84, d: 0.75, slideTo: 205 }, // B3 -> slide down with vibrato
    ];

    const ctx = this.ctx;
    const startTime = ctx.currentTime;

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Plunger mute effect: lowpass with resonance
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, startTime + n.t);
      filter.Q.setValueAtTime(4.0, startTime + n.t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, startTime + n.t);

      if (n.slideTo) {
        osc.frequency.linearRampToValueAtTime(n.slideTo, startTime + n.t + n.d);
        // Add wa-wa vibrato LFO on the final note
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(7.5, startTime + n.t); // 7.5 Hz tremolo
        lfoGain.gain.setValueAtTime(14, startTime + n.t);

        lfo.connect(osc.frequency);
        lfo.start(startTime + n.t);
        lfo.stop(startTime + n.t + n.d);
      }

      gain.gain.setValueAtTime(0.001, startTime + n.t);
      gain.gain.linearRampToValueAtTime(0.28, startTime + n.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + n.t + n.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + n.t);
      osc.stop(startTime + n.t + n.d);
    });
  }

  /**
   * Comedic Rimshot ("Ba-dum-tsss!")
   * Kick thump, crisp snare rim hit, and sizzling open hi-hat / cymbal crash
   */
  public playRimshot() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. "Ba" (tom/snare pop 1)
    const tom1 = ctx.createOscillator();
    const tomGain1 = ctx.createGain();
    tom1.type = 'sine';
    tom1.frequency.setValueAtTime(220, now);
    tom1.frequency.exponentialRampToValueAtTime(90, now + 0.09);
    tomGain1.gain.setValueAtTime(0.3, now);
    tomGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    tom1.connect(tomGain1);
    tomGain1.connect(ctx.destination);
    tom1.start(now);
    tom1.stop(now + 0.09);

    // 2. "Dum" (snare pop 2, slightly higher punch)
    const tom2 = ctx.createOscillator();
    const tomGain2 = ctx.createGain();
    const t2 = now + 0.12;
    tom2.type = 'triangle';
    tom2.frequency.setValueAtTime(260, t2);
    tom2.frequency.exponentialRampToValueAtTime(120, t2 + 0.1);
    tomGain2.gain.setValueAtTime(0.35, t2);
    tomGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.1);
    tom2.connect(tomGain2);
    tomGain2.connect(ctx.destination);
    tom2.start(t2);
    tom2.stop(t2 + 0.1);

    // 3. "Tsss!" (Cymbal crash / sizzle at 0.28s)
    const t3 = now + 0.26;
    const cymbalDur = 0.55;
    const bufferSize = Math.floor(ctx.sampleRate * cymbalDur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(5500, t3);

    const cymbalGain = ctx.createGain();
    cymbalGain.gain.setValueAtTime(0.4, t3);
    cymbalGain.gain.exponentialRampToValueAtTime(0.0001, t3 + cymbalDur);

    whiteNoise.connect(highpass);
    highpass.connect(cymbalGain);
    cymbalGain.connect(ctx.destination);

    whiteNoise.start(t3);
    whiteNoise.stop(t3 + cymbalDur);
  }

  /**
   * Iconic DJ / Game Show Hype Air Horn (Triple Syncopated Blast)
   * Detuned dual square waves with brass formant punch
   */
  public playAirhorn() {
    if (!this.enabled || !this.categories.crowdReactions) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Pattern: short blast, short blast, sustained grand blast
    const blasts = [
      { t: 0.0, d: 0.12 },
      { t: 0.15, d: 0.12 },
      { t: 0.32, d: 0.42 },
    ];

    blasts.forEach((b) => {
      const start = now + b.t;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Air horn fundamental notes (Eb5 + Bb5 chord with gritty detuning)
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(622.25, start); // Eb5
      osc1.frequency.linearRampToValueAtTime(640, start + b.d);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(627.0, start); // detuned

      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(932.33, start); // Bb5 harmonic

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, start);
      filter.Q.setValueAtTime(2.2, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.32, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + b.d);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(start);
      osc2.start(start);
      osc3.start(start);
      osc1.stop(start + b.d);
      osc2.stop(start + b.d);
      osc3.stop(start + b.d);
    });
  }

  /**
   * Dramatic Studio Audience Collective Gasp ("OHHH!!")
   */
  public playGasp() {
    if (!this.enabled || !this.categories.crowdReactions) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = 0.8;

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Resonant bandpass filter sweeping upward (air intake)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1700, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(700, now + dur);
    filter.Q.setValueAtTime(3.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + dur);
  }

  /**
   * Suspenseful Heartbeat Thump ("Lub-Dub")
   */
  public playHeartbeat() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const thumps = [
      { t: 0.0, f: 72, d: 0.16, vol: 0.45 },
      { t: 0.14, f: 60, d: 0.22, vol: 0.38 },
    ];

    thumps.forEach((th) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + th.t;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(th.f, start);
      osc.frequency.exponentialRampToValueAtTime(36, start + th.d);

      gain.gain.setValueAtTime(th.vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + th.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + th.d);
    });
  }

  /**
   * Cartoon Slide Whistle (Up or Down)
   */
  public playSlideWhistle(direction: 'up' | 'down' = 'up') {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = 0.55;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = direction === 'up' ? 350 : 1400;
    const endFreq = direction === 'up' ? 1450 : 320;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * Drumroll of Anticipation with Cymbal Crash
   */
  public playDrumroll(duration: number = 2.0) {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = Math.max(1.0, duration);

    // Rapid snare hits that accelerate in speed and volume
    const totalHits = Math.floor(dur * 24);
    for (let i = 0; i < totalHits; i++) {
      const progress = i / totalHits;
      const hitTime = now + (i / 24);
      const hitOsc = ctx.createOscillator();
      const hitGain = ctx.createGain();

      hitOsc.type = 'triangle';
      hitOsc.frequency.setValueAtTime(180 + Math.random() * 40, hitTime);

      const hitVol = 0.05 + progress * 0.22;
      hitGain.gain.setValueAtTime(hitVol, hitTime);
      hitGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.035);

      hitOsc.connect(hitGain);
      hitGain.connect(ctx.destination);

      hitOsc.start(hitTime);
      hitOsc.stop(hitTime + 0.035);
    }

    // Grand crash at the end
    setTimeout(() => {
      this.playRimshot();
    }, (dur - 0.2) * 1000);
  }

  /**
   * Trigger encouraging / hilarious vocal quotes via speech synthesis
   */
  public speakPhrase(text: string, mood: 'hype' | 'encouraging' | 'funny' = 'hype') {
    if (!this.enabled || !this.categories.voiceEffects) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0;

      if (mood === 'hype') {
        utterance.rate = 1.15;
        utterance.pitch = 1.25;
      } else if (mood === 'encouraging') {
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
      } else {
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Alex') ||
                v.name.includes('Daniel'))
          ) || voices[0];
        if (preferred) utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Soundboard voice speech error:', e);
    }
  }

  /**
   * Crisp peg click for the spinning wager wheel
   */
  public playWheelClick() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Grand prize / wager reveal fanfare with sparkle
   */
  public playJackpotReveal() {
    if (!this.enabled) return;
    this.playCorrectAnswerChime(1);
    setTimeout(() => this.playCrowdCheer(2.0), 180);
    setTimeout(() => this.playWinFanfare(), 300);
  }

  /**
   * Romantic harp / celesta arpeggio for rose & petal screen drop
   */
  public playRoseShower() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.9 },   // C5
      { f: 659.25, t: 0.09, d: 0.9 },  // E5
      { f: 783.99, t: 0.18, d: 1.0 },  // G5
      { f: 987.77, t: 0.27, d: 1.1 },  // B5
      { f: 1046.5, t: 0.36, d: 1.3 },  // C6
      { f: 1318.5, t: 0.45, d: 1.5 },  // E6
      { f: 1567.9, t: 0.54, d: 1.8 },  // G6
    ];

    notes.forEach((n) => {
      this.createChimeTone(n.f, now + n.t, n.d, 0.22, true);
    });
  }

  /**
   * Energetic fanfare when generating or accepting a Frenemy challenge
   */
  public playFrenemyChallenge() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.playBuzzer(1);
    setTimeout(() => this.playCorrectAnswerChime(2), 120);
    setTimeout(() => this.playCorrectAnswerChime(1), 260);
  }

  /**
   * Cash register / victory chimes when claiming a viral harmony bounty
   */
  public playBountyReward() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 880, 1046.5, 1318.5].forEach((f, idx) => {
      this.createChimeTone(f, now + idx * 0.08, 0.6, 0.2, true);
    });
    setTimeout(() => this.playCrowdCheer(1.5), 150);
  }

  /**
   * Deluxe 3D gift unwrap sound effect: silk ribbon untie rustle + harp celesta glissando
   */
  public playGiftUnwrap() {
    if (!this.enabled || !this.categories.gameChimes) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Tactile ribbon untie rustle (bandpass filtered noise burst)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.22);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // fallback
    }

    // 2. Ascending celestial harp glissando when voucher folds out in 3D
    const harpNotes = [
      { f: 440.0, t: 0.12, d: 0.8 },   // A4
      { f: 554.37, t: 0.18, d: 0.8 },  // C#5
      { f: 659.25, t: 0.24, d: 0.9 },  // E5
      { f: 880.0, t: 0.30, d: 1.0 },   // A5
      { f: 1108.7, t: 0.36, d: 1.2 },  // C#6
      { f: 1318.5, t: 0.42, d: 1.4 },  // E6
      { f: 1760.0, t: 0.48, d: 1.6 },  // A6
    ];

    harpNotes.forEach((n) => {
      this.createChimeTone(n.f, now + n.t, n.d, 0.2, true);
    });
  }
}

export const sounds = new SoundEffectsManager();

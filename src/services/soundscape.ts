/**
 * Procedural Web Audio API Soundscape Engine
 * 100% Free, zero-latency, client-side synthesized ambient audio that dynamically
 * shifts based on the adventure's `sceneSummary` and world genre.
 */

export type SoundscapeMood =
  | 'dungeon_catacombs'
  | 'cyberpunk_rain'
  | 'cosmic_horror'
  | 'combat_tension'
  | 'sanctuary_peace'
  | 'wind_wilderness'
  | 'mystic_ruins';

export interface SoundscapeState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  currentMood: SoundscapeMood;
  moodDisplayName: string;
  autoShift: boolean;
  sfxEnabled: boolean;
}

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentMoodGain: GainNode | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private rainInterval: number | null = null;
  private dripInterval: number | null = null;
  private pulseInterval: number | null = null;

  private isPlaying = false;
  private isMuted = false;
  private volume = 0.45;
  private currentMood: SoundscapeMood = 'dungeon_catacombs';
  private autoShift = true;
  private sfxEnabled = true;

  private listeners: Array<(state: SoundscapeState) => void> = [];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public subscribe(cb: (state: SoundscapeState) => void): () => void {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  public getState(): SoundscapeState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentMood: this.currentMood,
      moodDisplayName: this.getMoodDisplayName(this.currentMood),
      autoShift: this.autoShift,
      sfxEnabled: this.sfxEnabled,
    };
  }

  public getMoodDisplayName(mood: SoundscapeMood): string {
    switch (mood) {
      case 'cyberpunk_rain':
        return '🌧 Neon Rain & Cybernetic Hum';
      case 'cosmic_horror':
        return '🌌 Astral Void & Eldritch Resonance';
      case 'combat_tension':
        return '⚔ Combat Standoff & Rising Pulse';
      case 'sanctuary_peace':
        return '🕯 Sacred Sanctum & Harmonic Chimes';
      case 'wind_wilderness':
        return '🌪 Desolate Winds & Campfire Embers';
      case 'mystic_ruins':
        return '🏛 Ancient Arcane Vaults';
      case 'dungeon_catacombs':
      default:
        return '🏰 Subterranean Catacombs & Dripping Caverns';
    }
  }

  /**
   * Intelligently derives the appropriate soundscape mood from a sceneSummary string.
   */
  public analyzeSceneSummary(summary: string, genre: string = ''): SoundscapeMood {
    const text = `${summary} ${genre}`.toLowerCase();

    // Combat & Tension keywords
    if (/fight|battle|combat|ambush|strike|sword|blade|danger|hazard|stalk|beast|enemy|attack|hostile|pursuit|alarm/i.test(text)) {
      return 'combat_tension';
    }

    // Cyberpunk & Rain keywords
    if (/cyber|neon|rain|kuroshio|deck|alley|drone|city|terminal|hover|wire|synthetic|corporate/i.test(text)) {
      return 'cyberpunk_rain';
    }

    // Cosmic & Eldritch Horror
    if (/astral|cosmic|eldritch|void|horror|biomass|alien|abyss|prometheus|warp|cryo|madness|tentacle/i.test(text)) {
      return 'cosmic_horror';
    }

    // Sanctuary & Peace & Holy
    if (/sanctum|altar|temple|relic|safe|holy|chapel|blessed|valerius|flame|shrine|rest|triumph/i.test(text)) {
      return 'sanctuary_peace';
    }

    // Wilderness & Wind & Desolation
    if (/wind|mountain|forest|crag|cliff|storm|desert|waste|trail|outdoor|snow|tundra/i.test(text)) {
      return 'wind_wilderness';
    }

    // Arcane & Ancient Ruins
    if (/rune|arcane|spell|magic|enchanted|library|scroll|tome|portal|crystall/i.test(text)) {
      return 'mystic_ruins';
    }

    // Default to dungeon catacombs
    return 'dungeon_catacombs';
  }

  /**
   * Called whenever the story chapter or sceneSummary updates.
   */
  public handleSceneChange(sceneSummary: string, genre: string = '') {
    if (!this.autoShift) return;
    const detectedMood = this.analyzeSceneSummary(sceneSummary, genre);
    if (detectedMood !== this.currentMood) {
      this.setMood(detectedMood);
    }
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async start(): Promise<void> {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.buildCurrentMood();
    this.notify();
  }

  public stop(): void {
    this.cleanupActiveNodes();
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public setAutoShift(enabled: boolean): void {
    this.autoShift = enabled;
    this.notify();
  }

  public toggleSfx(): void {
    this.sfxEnabled = !this.sfxEnabled;
    this.notify();
  }

  public setMood(mood: SoundscapeMood): void {
    this.currentMood = mood;
    if (this.isPlaying) {
      this.crossfadeToMood(mood);
    }
    this.notify();
  }

  private cleanupActiveNodes() {
    if (this.rainInterval) clearInterval(this.rainInterval);
    if (this.dripInterval) clearInterval(this.dripInterval);
    if (this.pulseInterval) clearInterval(this.pulseInterval);

    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.activeNodes = [];
  }

  private crossfadeToMood(newMood: SoundscapeMood) {
    if (!this.ctx || !this.masterGain) return;

    // Fade out previous mood gain
    if (this.currentMoodGain) {
      const oldGain = this.currentMoodGain;
      const now = this.ctx.currentTime;
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      setTimeout(() => {
        try {
          oldGain.disconnect();
        } catch (e) {}
      }, 2100);
    }

    this.cleanupActiveNodes();
    this.buildCurrentMood();
  }

  /**
   * Synthesize atmospheric layers based on current mood
   */
  private buildCurrentMood() {
    if (!this.ctx || !this.masterGain) return;

    const moodGain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    moodGain.gain.setValueAtTime(0.0001, now);
    moodGain.gain.exponentialRampToValueAtTime(1.0, now + 1.5);
    moodGain.connect(this.masterGain);
    this.currentMoodGain = moodGain;

    switch (this.currentMood) {
      case 'dungeon_catacombs':
        this.synthesizeDungeonAtmosphere(moodGain);
        break;
      case 'cyberpunk_rain':
        this.synthesizeCyberpunkAtmosphere(moodGain);
        break;
      case 'cosmic_horror':
        this.synthesizeCosmicHorrorAtmosphere(moodGain);
        break;
      case 'combat_tension':
        this.synthesizeCombatTensionAtmosphere(moodGain);
        break;
      case 'sanctuary_peace':
        this.synthesizeSanctuaryAtmosphere(moodGain);
        break;
      case 'wind_wilderness':
        this.synthesizeWindAtmosphere(moodGain);
        break;
      case 'mystic_ruins':
      default:
        this.synthesizeMysticRuinsAtmosphere(moodGain);
        break;
    }
  }

  // Helper: White/Pink/Brown Noise Buffer Generator
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown' = 'pink'): AudioBuffer {
    const bufferSize = this.ctx!.sampleRate * 3; // 3 second loop
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        data[i] = white * 0.5;
      } else if (type === 'brown') {
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        // Pink noise approximation
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // 1. Dungeon Catacombs: Sub rumble + minor drone + water droplets
  private synthesizeDungeonAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    // Sub-bass rumble
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 85;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.7;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(parent);
    noise.start();
    this.activeNodes.push(noise, filter, noiseGain);

    // Ominous minor drone (D2 & Ab2 - tritone tension)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 73.42; // D2

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 103.83; // Ab2 (diminished 5th)

    const oscFilter = this.ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.value = 160;

    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.08;

    osc1.connect(oscFilter);
    osc2.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(parent);
    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2, oscFilter, oscGain);

    // Random echoing cavern water drips
    this.dripInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const dripOsc = this.ctx.createOscillator();
      const dripGain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      dripOsc.type = 'sine';
      const baseFreq = 900 + Math.random() * 800;
      dripOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      dripOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.08);

      dripGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      dripGain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.02);
      dripGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      if (panner) {
        panner.pan.value = (Math.random() - 0.5) * 1.4;
        dripOsc.connect(panner);
        panner.connect(dripGain);
      } else {
        dripOsc.connect(dripGain);
      }

      dripGain.connect(parent);
      dripOsc.start();
      dripOsc.stop(this.ctx.currentTime + 0.4);
    }, 2800);
  }

  // 2. Cyberpunk Rain: Rain filter + pulse bass + synth pad
  private synthesizeCyberpunkAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    // Rain sound
    const rain = this.ctx.createBufferSource();
    rain.buffer = this.createNoiseBuffer('pink');
    rain.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1800;
    rainFilter.Q.value = 0.8;

    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0.28;

    rain.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(parent);
    rain.start();
    this.activeNodes.push(rain, rainFilter, rainGain);

    // Warm analog synth drone (C2 + Eb2 + G2 minor chord)
    const freqs = [65.41, 77.78, 98.0];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;

      const fNode = this.ctx!.createBiquadFilter();
      fNode.type = 'lowpass';
      fNode.frequency.value = 240;

      const g = this.ctx!.createGain();
      g.gain.value = 0.04;

      osc.connect(fNode);
      fNode.connect(g);
      g.connect(parent);
      osc.start();
      this.activeNodes.push(osc, fNode, g);
    });

    // Electrical neon hum (60Hz + 120Hz)
    const hum = this.ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 60;
    const humGain = this.ctx.createGain();
    humGain.gain.value = 0.05;
    hum.connect(humGain);
    humGain.connect(parent);
    hum.start();
    this.activeNodes.push(hum, humGain);
  }

  // 3. Cosmic Horror: Dual beating binaural frequencies + astral sweep
  private synthesizeCosmicHorrorAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    // Dual beating sine waves (55Hz and 58.5Hz - creates eerie 3.5Hz theta pulsation)
    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'sine';
    oscA.frequency.value = 55.0;
    oscB.frequency.value = 58.5;

    const beatGain = this.ctx.createGain();
    beatGain.gain.value = 0.12;

    oscA.connect(beatGain);
    oscB.connect(beatGain);
    beatGain.connect(parent);
    oscA.start();
    oscB.start();
    this.activeNodes.push(oscA, oscB, beatGain);

    // High crystalline resonance (2400Hz resonant bandpass)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('pink');
    noise.loop = true;

    const resFilter = this.ctx.createBiquadFilter();
    resFilter.type = 'bandpass';
    resFilter.frequency.value = 2200;
    resFilter.Q.value = 8.0;

    const resGain = this.ctx.createGain();
    resGain.gain.value = 0.04;

    noise.connect(resFilter);
    resFilter.connect(resGain);
    resGain.connect(parent);
    noise.start();
    this.activeNodes.push(noise, resFilter, resGain);
  }

  // 4. Combat Tension: Heartbeat thud + intense filter sweep
  private synthesizeCombatTensionAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    // Heartbeat pulse interval
    this.pulseInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;

      const beat = (delay: number, freq: number) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(32, this.ctx!.currentTime + delay + 0.14);

        g.gain.setValueAtTime(0.001, this.ctx!.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.2);

        osc.connect(g);
        g.connect(parent);
        osc.start(this.ctx!.currentTime + delay);
        osc.stop(this.ctx!.currentTime + delay + 0.22);
      };

      // Double-thump heartbeat (Lub-dub)
      beat(0, 75);
      beat(0.22, 60);
    }, 1200);

    // Low tense drone
    const drone = this.ctx.createOscillator();
    drone.type = 'triangle';
    drone.frequency.value = 55;
    const dGain = this.ctx.createGain();
    dGain.gain.value = 0.09;
    drone.connect(dGain);
    dGain.connect(parent);
    drone.start();
    this.activeNodes.push(drone, dGain);
  }

  // 5. Sanctuary: Warm major 7th chord & celestial shimmer
  private synthesizeSanctuaryAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    // Warm chords (F3, A3, C4, E4)
    const freqs = [174.61, 220.0, 261.63, 329.63];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;

      const g = this.ctx!.createGain();
      g.gain.value = 0.035;

      osc.connect(g);
      g.connect(parent);
      osc.start();
      this.activeNodes.push(osc, g);
    });

    // Soft celestial chime shimmer
    const chime = this.ctx.createOscillator();
    chime.type = 'sine';
    chime.frequency.value = 880;
    const cGain = this.ctx.createGain();
    cGain.gain.value = 0.012;
    chime.connect(cGain);
    cGain.connect(parent);
    chime.start();
    this.activeNodes.push(chime, cGain);
  }

  // 6. Wilderness Winds: Filtered howling wind noise
  private synthesizeWindAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('pink');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 350;
    filter.Q.value = 2.5;

    // Oscillate filter to simulate wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15; // slow sweep
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(filter.frequency);
    lfo.start();

    const wGain = this.ctx.createGain();
    wGain.gain.value = 0.22;

    noise.connect(filter);
    filter.connect(wGain);
    wGain.connect(parent);
    noise.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain, wGain);
  }

  // 7. Mystic Ruins: Resonant chanting harmonics
  private synthesizeMysticRuinsAtmosphere(parent: GainNode) {
    if (!this.ctx) return;

    const freqs = [110.0, 164.81, 220.0];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;

      const fNode = this.ctx!.createBiquadFilter();
      fNode.type = 'lowpass';
      fNode.frequency.value = 300;

      const g = this.ctx!.createGain();
      g.gain.value = 0.04;

      osc.connect(fNode);
      fNode.connect(g);
      g.connect(parent);
      osc.start();
      this.activeNodes.push(osc, fNode, g);
    });
  }

  // ================= INTERACTIVE SOUND EFFECTS =================
  public playClickSfx() {
    if (!this.sfxEnabled) return;
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

    g.gain.setValueAtTime(0.04, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playTurnFanfareSfx() {
    if (!this.sfxEnabled) return;
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    // Harmonic arpeggio (C4, E4, G4, C5)
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = this.ctx!.currentTime + idx * 0.08;
      g.gain.setValueAtTime(0.001, startTime);
      g.gain.linearRampToValueAtTime(0.06, startTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  public playItemAcquireSfx() {
    if (!this.sfxEnabled) return;
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6 sparkle
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.ctx!.currentTime + idx * 0.06;
      g.gain.setValueAtTime(0.001, startTime);
      g.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  public playDiceRollSfx() {
    if (!this.sfxEnabled) return;
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    // Quick rattling clicks
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 250 + Math.random() * 300;

      const startTime = this.ctx.currentTime + i * 0.04;
      g.gain.setValueAtTime(0.03, startTime);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.04);
    }
  }
}

export const soundscape = new SoundscapeEngine();

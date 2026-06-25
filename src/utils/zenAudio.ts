// Procedural Zen Ambient Soundscape Generator using Web Audio API
// Synthesizes soothing mountain rain and randomized temple wind chimes in real-time.

export class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private rainVolumeNode: GainNode | null = null;
  private chimeVolumeNode: GainNode | null = null;
  private masterVolumeNode: GainNode | null = null;
  private isPlaying = false;
  private chimeTimer: number | null = null;
  private currentVolume = 0.3; // 0 to 1

  constructor() {}

  // Starts the procedural ambient generator
  public start() {
    if (this.isPlaying) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.isPlaying = true;

      // Create Master Gain
      this.masterVolumeNode = this.ctx.createGain();
      this.masterVolumeNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterVolumeNode.connect(this.ctx.destination);

      // 1. Generate Soothing Mountain Rain (White noise with low-pass filters)
      this.startRain();

      // 2. Generate Random Zen Wind Chimes
      this.startChimes();

    } catch (e) {
      console.error("Failed to start procedural Zen audio engine:", e);
    }
  }

  // Stops the procedural ambient generator
  public stop() {
    this.isPlaying = false;
    
    if (this.chimeTimer) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }

    this.rainNode = null;
    this.rainVolumeNode = null;
    this.chimeVolumeNode = null;
    this.masterVolumeNode = null;
  }

  // Adjusts the master ambient volume
  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterVolumeNode && this.ctx) {
      this.masterVolumeNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  // Synthesizes realistic rain using white noise buffer
  private startRain() {
    if (!this.ctx || !this.masterVolumeNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Populate with white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Create a 2nd order Lowpass Filter to make it sound like deep, cozy rain
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(600, this.ctx.currentTime);
    lowpass.Q.setValueAtTime(1, this.ctx.currentTime);

    // Create another highpass to filter out extreme mud
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(80, this.ctx.currentTime);

    // Gain node for rain volume
    this.rainVolumeNode = this.ctx.createGain();
    this.rainVolumeNode.gain.setValueAtTime(0.22, this.ctx.currentTime);

    // Connect noise -> filters -> rain gain -> master gain
    whiteNoise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(this.rainVolumeNode);
    this.rainVolumeNode.connect(this.masterVolumeNode);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  // Trigger random pleasant oriental wind chimes (bell synthesis)
  private startChimes() {
    if (!this.ctx || !this.masterVolumeNode) return;

    this.chimeVolumeNode = this.ctx.createGain();
    this.chimeVolumeNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.chimeVolumeNode.connect(this.masterVolumeNode);

    // Traditional Pentatonic Scale Frequencies (Beautiful harmonized sound)
    const pentatonicScales = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
      1174.66, // D6
      1318.51, // E6
      1567.98, // G6
    ];

    const playSingleChime = () => {
      if (!this.ctx || !this.isPlaying || !this.chimeVolumeNode) return;

      const now = this.ctx.currentTime;
      const freq = pentatonicScales[Math.floor(Math.random() * pentatonicScales.length)];
      
      // Traditional Chinese Wind Chimes are composed of metal tubes, synthesized with multi-harmonics
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      // Overtones for rich metallic/bell resonance
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      // Soft wind chime volume envelope (instant attack, long elegant decay)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05); // quick chime ring
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5); // long reverberation

      // Connect nodes
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.chimeVolumeNode);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 4);
      osc2.stop(now + 4);
    };

    // Random trigger loop (approximately every 1.5 to 5 seconds)
    const scheduleNextChime = () => {
      if (!this.isPlaying) return;
      const delay = 1500 + Math.random() * 3500;
      this.chimeTimer = window.setTimeout(() => {
        playSingleChime();
        scheduleNextChime();
      }, delay);
    };

    scheduleNextChime();
  }
}

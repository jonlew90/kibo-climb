// Web Audio API — File-backed SFX + Synthesis BGM for Kibo Climb
// SFX: Real .ogg files via AudioBuffer (Kenney CC0), synthesis fallback if unavailable
// BGM: Improved generative pentatonic loop with dynamics compression

let _hapticsEnabled = true;

export function setHapticsEnabled(enabled) {
  _hapticsEnabled = enabled;
}

export function triggerHaptic(pattern = 15) {
  if (!_hapticsEnabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    if (navigator.userActivation && navigator.userActivation.hasBeenActive === false) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

// ─── SFX file map ────────────────────────────────────────────────────────────
const SFX_FILES = {
  bgm_climb:      '/audio/bgm_climb.mp3',
  correct:        '/audio/sfx_correct.ogg',
  victory:        '/audio/sfx_victory.ogg',
  incorrect:      '/audio/sfx_incorrect.ogg',
  tap:            '/audio/sfx_tap.ogg',
  spark:          '/audio/sfx_spark.ogg',
  badge:          '/audio/sfx_badge.ogg',
  block_complete: '/audio/sfx_block_complete.ogg',
  streak:         '/audio/sfx_streak.ogg',
  brand_intro:    '/audio/sfx_brand_intro.ogg',
  toggle:         '/audio/sfx_toggle.ogg',
};

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.bgmSource = null;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.bgmNoteIndex = 0;
    // AudioBuffer cache: key → AudioBuffer | null (null = failed)
    this._buffers = {};
    this._loading = {};
  }

  // ─── Context init ────────────────────────────────────────────────────────

  init() {
    if (typeof navigator !== 'undefined' &&
        navigator.userActivation &&
        navigator.userActivation.hasBeenActive === false) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try { this.ctx = new AudioCtx(); } catch (e) { return; }
      }
    }
    if (this.ctx?.state === 'suspended') {
      try { this.ctx.resume().catch(() => {}); } catch (e) {}
    }
  }

  // ─── State ───────────────────────────────────────────────────────────────

  toggleMute() { this.isMuted = !this.isMuted; return this.isMuted; }
  setMuted(v) { this.isMuted = v; }
  setMusicMuted(v) {
    this.isMusicMuted = v;
    if (v) this.stopBGM();
  }

  // ─── AudioBuffer loader ──────────────────────────────────────────────────

  async _loadBuffer(key) {
    if (key in this._buffers) return this._buffers[key];
    if (this._loading[key]) return this._loading[key];

    this._loading[key] = (async () => {
      try {
        const url = SFX_FILES[key];
        if (!url || !this.ctx) return null;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
        this._buffers[key] = audioBuf;
        return audioBuf;
      } catch (e) {
        this._buffers[key] = null; // mark as unavailable, use synthesis
        return null;
      }
    })();

    return this._loading[key];
  }

  // Preload all SFX buffers after first user interaction
  preloadAll() {
    this.init();
    if (!this.ctx) return;
    Object.keys(SFX_FILES).forEach(k => this._loadBuffer(k));
  }

  // ─── File playback helper ────────────────────────────────────────────────

  async _playFile(key, volume = 1.0) {
    if (this.isMuted) return false;
    this.init();
    if (!this.ctx) return false;
    const buf = await this._loadBuffer(key);
    if (!buf) return false; // fall through to synthesis
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const compressor = this.ctx.createDynamicsCompressor();
    src.buffer = buf;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    src.connect(gain);
    gain.connect(compressor);
    compressor.connect(this.ctx.destination);
    src.start();
    return true;
  }

  // ─── BGM ─────────────────────────────────────────────────────────────────
  // Uses bgm_climb.mp3 with seamless looping and smooth gain fading.
  // Falls back to pentatonic synthesis if audio buffer fails to load.

  async startBGM() {
    if (this.isMusicMuted) return;
    this.init();
    if (!this.ctx) return;
    this.stopBGM();

    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (e) {}
    }

    // Attempt to load and play the real audio file
    const buf = await this._loadBuffer('bgm_climb');
    if (buf && !this.isMusicMuted) {
      try {
        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        src.buffer = buf;
        src.loop = true;

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 1.2); // Soft ambient volume fade-in

        src.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(0);

        this.bgmSource = src;
        this.bgmGain = gain;
        return;
      } catch (e) {
        console.warn('Failed to start file BGM, using synthesis fallback', e);
      }
    }

    // Generative Synthesis Fallback: Pentatonic C major (C4 D4 E4 G4 A4 C5)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    const pattern = [0, 2, 4, 5, 4, 2, 1, 0, 3, 5, 3, 1];
    let step = this.bgmNoteIndex % pattern.length;

    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(this.ctx.destination);

    const playStep = () => {
      if (this.isMusicMuted || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const freq = scale[pattern[step]];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc.connect(gain);
      gain.connect(compressor);
      osc.start(now);
      osc.stop(now + 1.4);

      step = (step + 1) % pattern.length;
      this.bgmNoteIndex = step;
    };

    playStep();
    this.bgmInterval = setInterval(playStep, 900);
  }

  stopBGM() {
    if (this.bgmSource) {
      try {
        if (this.bgmGain && this.ctx) {
          const now = this.ctx.currentTime;
          this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
          this.bgmGain.gain.linearRampToValueAtTime(0.001, now + 0.3); // Smooth fade-out
          setTimeout(() => {
            try { this.bgmSource?.stop(); } catch (e) {}
            this.bgmSource = null;
            this.bgmGain = null;
          }, 320);
        } else {
          this.bgmSource.stop();
          this.bgmSource = null;
          this.bgmGain = null;
        }
      } catch (e) {
        this.bgmSource = null;
        this.bgmGain = null;
      }
    }

    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // ─── SFX: Correct ────────────────────────────────────────────────────────

  async playCorrect() {
    triggerHaptic([20, 30, 20]);
    const used = await this._playFile('correct', 0.8);
    if (used) return;
    // Synthesis fallback: warm two-tone chime
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const comp = this.ctx.createDynamicsCompressor();
    comp.connect(this.ctx.destination);
    [[523.25, 0, 0.18], [783.99, 0.1, 0.22]].forEach(([freq, delay, dur]) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      g.gain.setValueAtTime(0.28, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(g); g.connect(comp);
      osc.start(now + delay); osc.stop(now + delay + dur);
    });
  }

  // ─── SFX: Incorrect ──────────────────────────────────────────────────────

  async playIncorrect() {
    triggerHaptic(40);
    const used = await this._playFile('incorrect', 0.7);
    if (used) return;
    // Synthesis fallback: gentle descending wobble (not harsh)
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.28);
  }

  // ─── SFX: Key Tap ────────────────────────────────────────────────────────

  async playKeyTap() {
    const used = await this._playFile('tap', 0.5);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.055);
  }

  // ─── SFX: Victory ────────────────────────────────────────────────────────

  async playVictory() {
    triggerHaptic([30, 40, 30, 40, 60]);
    const used = await this._playFile('victory', 0.85);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const comp = this.ctx.createDynamicsCompressor();
    comp.connect(this.ctx.destination);
    [
      { freq: 523.25, t: 0,    dur: 0.14 },
      { freq: 659.25, t: 0.13, dur: 0.14 },
      { freq: 783.99, t: 0.26, dur: 0.14 },
      { freq: 1046.5, t: 0.39, dur: 0.5  },
    ].forEach(({ freq, t, dur }) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + t);
      g.gain.setValueAtTime(0.28, now + t);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
      osc.connect(g); g.connect(comp);
      osc.start(now + t); osc.stop(now + t + dur);
    });
  }

  playVictoryFanfare() { return this.playVictory(); }

  // ─── SFX: Spark Collect ──────────────────────────────────────────────────

  async playSparkCollect() {
    triggerHaptic([20, 20]);
    const used = await this._playFile('spark', 0.7);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [[880, 0, 0.09], [1318.5, 0.08, 0.16]].forEach(([freq, delay, dur]) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      g.gain.setValueAtTime(0.22, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(now + delay); osc.stop(now + delay + dur);
    });
  }

  // ─── SFX: Badge Unlock ───────────────────────────────────────────────────

  async playBadgeUnlock() {
    triggerHaptic([20, 30, 20, 30, 60]);
    const used = await this._playFile('badge', 0.8);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const comp = this.ctx.createDynamicsCompressor();
    comp.connect(this.ctx.destination);
    // Ascending sparkle arpeggio
    [440, 554.37, 659.25, 880, 1108.7].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      g.gain.setValueAtTime(0.2, now + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
      osc.connect(g); g.connect(comp);
      osc.start(now + i * 0.09); osc.stop(now + i * 0.09 + 0.35);
    });
  }

  // ─── SFX: Block Complete ─────────────────────────────────────────────────

  async playBlockComplete() {
    triggerHaptic([30, 30, 60]);
    const used = await this._playFile('block_complete', 0.75);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Warm resolving chord
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      g.gain.setValueAtTime(0.15, now + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(now + i * 0.04); osc.stop(now + 0.8);
    });
  }

  // ─── SFX: Streak ─────────────────────────────────────────────────────────

  async playStreakMilestone() {
    triggerHaptic([20, 20, 20, 20, 80]);
    const used = await this._playFile('streak', 0.8);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Quick rising whoosh
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.35);
  }

  // ─── SFX: Brand Intro ────────────────────────────────────────────────────

  async playBrandIntroChime() {
    triggerHaptic([30, 40, 50]);
    const used = await this._playFile('brand_intro', 0.8);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const comp = this.ctx.createDynamicsCompressor();
    comp.connect(this.ctx.destination);
    // Sub pad
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(55, now + 1.4);
    subG.gain.setValueAtTime(0.3, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    sub.connect(subG); subG.connect(comp);
    sub.start(now); sub.stop(now + 1.5);
    // Staggered A-major chord
    [[220, 0.05, 1.3],[277.18, 0.12, 1.2],[329.63, 0.18, 1.2],[440, 0.25, 1.1],[554.37, 0.32, 1.0],[659.25, 0.38, 0.9]].forEach(([f, d, dur]) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + d);
      g.gain.setValueAtTime(0, now);
      g.gain.setValueAtTime(0.16, now + d);
      g.gain.exponentialRampToValueAtTime(0.001, now + d + dur);
      osc.connect(g); g.connect(comp);
      osc.start(now + d); osc.stop(now + d + dur);
    });
  }

  // ─── SFX: Toggle ────────────────────────────────────────────────────────

  async playToggle() {
    const used = await this._playFile('toggle', 0.5);
    if (used) return;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.07);
  }
}

export const soundFx = new SoundSystem();

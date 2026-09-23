// Web Audio API — File-backed SFX + Synthesis BGM for Kibo Climb
// SFX: Real .ogg files via AudioBuffer (Kenney CC0), synthesis fallback if unavailable
// BGM: Improved generative pentatonic loop with dynamics compression

let _hapticsEnabled = true;

export function setHapticsEnabled(enabled) {
  _hapticsEnabled = enabled;
}

export function triggerHaptic(pattern = 6) {
  if (!_hapticsEnabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    if (navigator.userActivation && navigator.userActivation.hasBeenActive === false) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

// ─── SFX file map ────────────────────────────────────────────────────────────
const SFX_FILES = {
  bgm_climb:      '/audio/bgm_climb.mp3',
  bgm_home:       '/audio/bgm_home.mp3',
  bgm_shop:       '/audio/bgm_shop.mp3',
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

const DEFAULT_BGM_VOLUMES = {
  bgm_home: 0.18,
  bgm_shop: 0.18,
  bgm_climb: 0.32,
};

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.currentBgmKey = null;
    this.pendingBgmKey = null;
    this.pendingBgmVolume = null;
    this._unlocked = false;
    this._bgmAudio = null;
    // AudioBuffer cache: key → AudioBuffer | null (null = failed)
    this._buffers = {};
    this._loading = {};

    this._initBgmAudio();
    this._setupUnlock();
  }

  _initBgmAudio() {
    if (typeof window === 'undefined') return;
    if (!this._bgmAudio) {
      try {
        this._bgmAudio = new Audio();
        this._bgmAudio.loop = true;
        this._bgmAudio.preload = 'auto';
      } catch (e) {}
    }
  }

  // ─── Global User Activation Unlock ────────────────────────────────────────

  _setupUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = async () => {
      this._unlocked = true;
      ['click', 'pointerup', 'keydown', 'touchend'].forEach(evt => {
        window.removeEventListener(evt, unlock, true);
      });
      this.init();
      if (this.ctx?.state === 'suspended') {
        try { await this.ctx.resume(); } catch (e) {}
      }
      if (this.pendingBgmKey && !this.isMusicMuted && !this.isMuted) {
        this.startBGM(this.pendingBgmKey, this.pendingBgmVolume);
      }
    };
    ['click', 'pointerup', 'keydown', 'touchend'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: true, passive: true, capture: true });
    });
  }

  // ─── Context init ────────────────────────────────────────────────────────

  init() {
    if (typeof window === 'undefined') return;
    if (!this._unlocked) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try { this.ctx = new AudioCtx(); } catch (e) { return; }
      }
    }
    if (this.ctx?.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch (e) {}
    }
  }

  // ─── State ───────────────────────────────────────────────────────────────

  toggleMute() { this.isMuted = !this.isMuted; return this.isMuted; }
  setMuted(v) {
    this.isMuted = v;
    if (v) {
      this.stopBGM();
    } else if (!this.isMusicMuted && this.pendingBgmKey) {
      this.startBGM(this.pendingBgmKey, this.pendingBgmVolume);
    }
  }

  setMusicMuted(v) {
    this.isMusicMuted = v;
    if (v) {
      this.stopBGM();
    } else {
      if (this.pendingBgmKey) {
        this.startBGM(this.pendingBgmKey, this.pendingBgmVolume);
      }
    }
  }

  // ─── AudioBuffer loader (for SFX) ────────────────────────────────────────

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
    if (!this._unlocked || !this.ctx) return;
    Object.keys(SFX_FILES).forEach(k => {
      if (!k.startsWith('bgm_')) {
        this._loadBuffer(k);
      }
    });
  }

  // ─── File playback helper (for SFX) ──────────────────────────────────────

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
  // Supports trackKey: 'bgm_home' (lobby), 'bgm_shop' (workshop/closet), 'bgm_climb' (active climb)
  // Powered by a single dedicated HTMLAudioElement ensuring absolute zero track overlap.

  startBGM(trackKey = 'bgm_climb', targetVolume = null) {
    const vol = targetVolume ?? DEFAULT_BGM_VOLUMES[trackKey] ?? 0.18;
    this.pendingBgmKey = trackKey;
    this.pendingBgmVolume = vol;

    if (this.isMusicMuted || this.isMuted) {
      this.stopBGM();
      return;
    }

    this._initBgmAudio();
    if (!this._bgmAudio) return;

    // If already playing this track, update volume and return
    if (this.currentBgmKey === trackKey && !this._bgmAudio.paused) {
      try { this._bgmAudio.volume = vol; } catch (e) {}
      return;
    }

    const url = SFX_FILES[trackKey];
    if (!url) return;

    try {
      this._bgmAudio.pause();
      this._bgmAudio.src = url;
      this._bgmAudio.volume = vol;
      this._bgmAudio.loop = true;
      this.currentBgmKey = trackKey;

      const playPromise = this._bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Awaiting user gesture
        });
      }
    } catch (e) {
      console.warn('Failed to start BGM playback', e);
    }
  }

  stopBGM() {
    this.currentBgmKey = null;
    if (this._bgmAudio) {
      try {
        this._bgmAudio.pause();
        this._bgmAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // ─── SFX: Correct ────────────────────────────────────────────────────────

  async playCorrect() {
    triggerHaptic([6, 12, 6]);
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
    triggerHaptic(12);
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
    // Intentionally no-op to remove button click sound
  }

  // ─── SFX: Victory ────────────────────────────────────────────────────────

  async playVictory() {
    triggerHaptic([8, 12, 8, 12, 16]);
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
    triggerHaptic([6, 8]);
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
    triggerHaptic([6, 10, 6, 10, 16]);
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
    triggerHaptic([8, 12, 16]);
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
    triggerHaptic([6, 8, 6, 8, 18]);
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
    triggerHaptic([8, 10, 14]);
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

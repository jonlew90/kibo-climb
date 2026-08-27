// Web Audio API Synthesizer & Web Haptics Engine for Kibo Climb

let _hapticsEnabled = true;

export function setHapticsEnabled(enabled) {
  _hapticsEnabled = enabled;
}

// Web Haptics Helper (navigator.vibrate fallback)
export function triggerHaptic(pattern = 15) {
  if (!_hapticsEnabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Graceful fallback if unsupported
    }
  }
}

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  // Micro-variation pitch multiplier (+/- 3%) to prevent audio fatigue
  _getPitchJitter() {
    return 0.97 + Math.random() * 0.06;
  }

  // Play crisp cheerful pop/bell for correct answers + haptic pulse
  playCorrect() {
    triggerHaptic([20, 30, 20]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const jitter = this._getPitchJitter();
    const now = this.ctx.currentTime;

    // Harmonic bell chime (Fundamental + overtone)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25 * jitter, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50 * jitter, now + 0.12); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50 * jitter, now); // C6
    osc2.frequency.exponentialRampToValueAtTime(1318.51 * jitter, now + 0.14); // E6

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  // Play gentle, encouraging, non-punitive boing/low tone for incorrect answers
  playIncorrect() {
    triggerHaptic(40);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(146.83, now + 0.22); // D3

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Play wooden key tap / marimba click audio + subtle haptic tap
  playKeyTap() {
    triggerHaptic(15);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const jitter = this._getPitchJitter();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(300 * jitter, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Play ascending glockenspiel streak combo fanfare
  playStreakBonus(streakCount = 3) {
    triggerHaptic([20, 20, 30]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseScale = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C E G C E
    const count = Math.min(streakCount, 5);

    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseScale[i], startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    }
  }

  // Play item equipped / cosmetic unlock magical chime
  playEquipItem() {
    triggerHaptic([25, 35]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 783.99, time: 0, dur: 0.08 },   // G5
      { freq: 1046.50, time: 0.07, dur: 0.08 }, // C6
      { freq: 1318.51, time: 0.14, dur: 0.2 }  // E6
    ];

    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.22, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  // Play celebratory victory fanfare + victory haptic
  playVictory() {
    triggerHaptic([30, 40, 30, 40, 60]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { notes: [523.25, 659.25], dur: 0.14, time: 0 },
      { notes: [587.33, 739.99], dur: 0.14, time: 0.14 },
      { notes: [659.25, 830.61], dur: 0.14, time: 0.28 },
      { notes: [783.99, 1046.50, 1318.51], dur: 0.5, time: 0.42 }
    ];

    chords.forEach((c) => {
      c.notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + c.time);

        gain.gain.setValueAtTime(0.18, now + c.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.time + c.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + c.time);
        osc.stop(now + c.time + c.dur);
      });
    });
  }

  playVictoryFanfare() {
    this.playVictory();
  }

  // Play energetic spark collection chime
  playSparkCollect() {
    triggerHaptic([20, 20]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const jitter = this._getPitchJitter();
    const now = this.ctx.currentTime;
    const notes = [
      { freq: 880 * jitter, duration: 0.08, time: 0 },
      { freq: 1318.5 * jitter, duration: 0.15, time: 0.07 }
    ];

    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.25, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration);
    });
  }
}

export const soundFx = new SoundSystem();

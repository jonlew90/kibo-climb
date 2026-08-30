// Web Audio API Synthesizer & Web Haptics Engine for Kibo Math

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
    this.isMusicMuted = false;
    this.bgmOscillator = null;
    this.bgmGain = null;
    this.bgmInterval = null;
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

  setMusicMuted(muted) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      // Re-start BGM if it should be playing. For simplicity, we just allow the session to start it.
    }
  }

  startBGM() {
    if (this.isMusicMuted) return;
    this.init();
    if (!this.ctx) return;

    // Stop any existing BGM loop
    this.stopBGM();

    // Simple generative loop using Web Audio API
    // We will play a gentle sequence of notes periodically
    const notes = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      523.25  // C5
    ];

    let noteIndex = 0;

    const playNextNote = () => {
      if (this.isMusicMuted) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], now);

      // Very soft volume
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);

      noteIndex = (noteIndex + 1) % notes.length;
    };

    // Play first note immediately
    playNextNote();

    // Set up loop
    this.bgmInterval = setInterval(playNextNote, 2000);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // Play crisp pop for correct answers + haptic pulse
  playCorrect() {
    triggerHaptic([20, 30, 20]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12); // C6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Play light low tone / buzz for incorrect answers
  playIncorrect() {
    triggerHaptic(40);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Play key tap click audio + subtle haptic tap
  playKeyTap() {
    triggerHaptic(15);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Play celebratory victory fanfare + victory haptic
  playVictory() {
    triggerHaptic([30, 40, 30, 40, 60]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 523.25, duration: 0.12, time: 0 },
      { freq: 659.25, duration: 0.12, time: 0.12 },
      { freq: 783.99, duration: 0.12, time: 0.24 },
      { freq: 1046.50, duration: 0.4, time: 0.36 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.3, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration);
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

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 880, duration: 0.08, time: 0 },
      { freq: 1318.5, duration: 0.15, time: 0.07 }
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

  // Play cinematic brand intro sonic chord
  playBrandIntroChime() {
    triggerHaptic([30, 40, 50]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Warm low sub-bass pad
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now); // A2
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 1.4); // A1 drop
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.5);

    // Resonant crystalline summit chord (A major 9)
    const chordNotes = [
      { freq: 220.00, delay: 0.05, dur: 1.3 }, // A3
      { freq: 277.18, delay: 0.12, dur: 1.2 }, // C#4
      { freq: 329.63, delay: 0.18, dur: 1.2 }, // E4
      { freq: 440.00, delay: 0.25, dur: 1.1 }, // A4
      { freq: 554.37, delay: 0.32, dur: 1.0 }, // C#5
      { freq: 659.25, delay: 0.38, dur: 0.9 }  // E5
    ];

    chordNotes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.18, now + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.dur);
    });
  }
}

export const soundFx = new SoundSystem();

// Kibo Audio Manager — Web Audio API Synthesizer & Sound Effects Engine
import { soundFx, triggerHaptic } from './audio';

class KiboAudioManagerEngine {
  constructor() {
    this.soundFx = soundFx;
  }

  get isMuted() {
    return this.soundFx.isMuted;
  }

  toggleMute() {
    return this.soundFx.toggleMute();
  }

  // Play rising major chord chime (C5 -> E5 -> G5)
  playCorrectSFX() {
    this.soundFx.playCorrect();
  }

  // Play energetic triple-pop sound effect for streaks
  playStreakSFX() {
    triggerHaptic([30, 40, 50]);
    if (this.isMuted) return;
    this.soundFx.init();
    const ctx = this.soundFx.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [600, 800, 1000];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.1);
    });
  }

  // Play soft marimba tone (low frequency)
  playIncorrectSFX() {
    this.soundFx.playIncorrect();
  }

  // Play crisp spark collect sound effect
  playSparkCollectSFX() {
    triggerHaptic(20);
    if (this.isMuted) return;
    this.soundFx.init();
    const ctx = this.soundFx.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Play gentle breath/cozy sound effect for break overlay
  playBreakSFX() {
    triggerHaptic([40, 60]);
    if (this.isMuted) return;
    this.soundFx.init();
    const ctx = this.soundFx.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.3); // A4

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const KiboAudioManager = new KiboAudioManagerEngine();

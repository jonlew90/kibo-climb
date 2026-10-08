import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SoundSystem } from '../src/utils/audio';

describe('SoundSystem audio gating', () => {
  let soundSystem;

  beforeEach(() => {
    vi.restoreAllMocks();
    soundSystem = new SoundSystem();
    // mock AudioContext
    soundSystem.ctx = {
      state: 'running',
      currentTime: 0,
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      createDynamicsCompressor: vi.fn(() => ({
        connect: vi.fn(),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
      })),
      destination: {},
      suspend: vi.fn().mockResolvedValue(),
      resume: vi.fn().mockResolvedValue(),
    };
    soundSystem._unlocked = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isPageActive()', () => {
    it('returns true when document is visible and focused', () => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.hasFocus = vi.fn(() => true);
      expect(soundSystem.isPageActive()).toBe(true);
    });

    it('returns false when document.hidden is true', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.hasFocus = vi.fn(() => true);
      expect(soundSystem.isPageActive()).toBe(false);
    });

    it('returns false when document.hasFocus() is false', () => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.hasFocus = vi.fn(() => false);
      expect(soundSystem.isPageActive()).toBe(false);
    });
  });

  describe('canPlaySfx() and canPlayMusic()', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.hasFocus = vi.fn(() => true);
      soundSystem.isMuted = false;
      soundSystem.isMusicMuted = false;
    });

    it('allows both when page is active and not muted', () => {
      expect(soundSystem.canPlaySfx()).toBe(true);
      expect(soundSystem.canPlayMusic()).toBe(true);
    });

    it('disallows both when page is hidden', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      expect(soundSystem.canPlaySfx()).toBe(false);
      expect(soundSystem.canPlayMusic()).toBe(false);
    });

    it('disallows both when page is unfocused', () => {
      document.hasFocus = vi.fn(() => false);
      expect(soundSystem.canPlaySfx()).toBe(false);
      expect(soundSystem.canPlayMusic()).toBe(false);
    });

    it('disallows both when isMuted is true', () => {
      soundSystem.isMuted = true;
      expect(soundSystem.canPlaySfx()).toBe(false);
      expect(soundSystem.canPlayMusic()).toBe(false);
    });

    it('allows SFX but disallows music when isMusicMuted is true', () => {
      soundSystem.isMusicMuted = true;
      expect(soundSystem.canPlaySfx()).toBe(true);
      expect(soundSystem.canPlayMusic()).toBe(false);
    });

    it('disallows SFX and music when onboarding is active', () => {
      soundSystem.setOnboardingActive(true);
      expect(soundSystem.canPlaySfx()).toBe(false);
      expect(soundSystem.canPlayMusic()).toBe(false);
      soundSystem.setOnboardingActive(false);
      expect(soundSystem.canPlaySfx()).toBe(true);
      expect(soundSystem.canPlayMusic()).toBe(true);
    });
  });

  describe('startBGM() gating', () => {
    let mockAudio;

    beforeEach(() => {
      mockAudio = {
        play: vi.fn().mockResolvedValue(),
        pause: vi.fn(),
        paused: true,
        volume: 0,
        src: '',
      };
      soundSystem._bgmAudio = mockAudio;
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.hasFocus = vi.fn(() => true);
      soundSystem.isMuted = false;
      soundSystem.isMusicMuted = false;
    });

    it('plays BGM when page active and unmuted', () => {
      soundSystem.startBGM('bgm_home');
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('does not play BGM when isMusicMuted', () => {
      soundSystem.isMusicMuted = true;
      soundSystem.startBGM('bgm_home');
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('does not play BGM when isMuted', () => {
      soundSystem.isMuted = true;
      soundSystem.startBGM('bgm_home');
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('does not play BGM and pauses if page is hidden', () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      soundSystem.startBGM('bgm_home');
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('does not play BGM and pauses if page is unfocused', () => {
      document.hasFocus = vi.fn(() => false);
      soundSystem.startBGM('bgm_home');
      expect(mockAudio.play).not.toHaveBeenCalled();
    });
  });

  describe('SFX playback gating', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.hasFocus = vi.fn(() => true);
      soundSystem.isMuted = false;
    });

    it('does not create oscillators when isMuted is true', async () => {
      soundSystem.isMuted = true;
      await soundSystem.playCorrect();
      expect(soundSystem.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('does not create oscillators when page is hidden', async () => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      await soundSystem.playCorrect();
      expect(soundSystem.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('does not create oscillators when page is unfocused', async () => {
      document.hasFocus = vi.fn(() => false);
      await soundSystem.playCorrect();
      expect(soundSystem.ctx.createOscillator).not.toHaveBeenCalled();
    });

    it('creates oscillators when active and unmuted', async () => {
      await soundSystem.playCorrect();
      expect(soundSystem.ctx.createOscillator).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { soundFx, setHapticsEnabled, triggerHaptic } from '../../src/utils/audio.js';

describe('audio.js', () => {
  let mockContext;
  let mockOscillator;
  let mockGain;
  let AudioContextMock;

  beforeEach(() => {
    // Reset haptics to enabled
    setHapticsEnabled(true);

    mockOscillator = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockContext = {
      currentTime: 100,
      state: 'suspended',
      resume: vi.fn(),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      destination: {},
    };

    // Correct way to mock a constructor function in JS
    AudioContextMock = vi.fn().mockImplementation(function() {
      return mockContext;
    });

    // Setup global window properties
    global.window.AudioContext = AudioContextMock;
    global.window.webkitAudioContext = undefined;
    global.navigator.vibrate = vi.fn();

    // Reset sound system state
    soundFx.ctx = null;
    soundFx.isMuted = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Haptics', () => {
    it('triggers haptics if enabled and supported', () => {
      triggerHaptic(20);
      expect(global.navigator.vibrate).toHaveBeenCalledWith(20);
    });

    it('does not trigger haptics if disabled', () => {
      setHapticsEnabled(false);
      triggerHaptic(20);
      expect(global.navigator.vibrate).not.toHaveBeenCalled();
    });

    it('handles lack of navigator.vibrate gracefully', () => {
      global.navigator.vibrate = undefined;
      expect(() => triggerHaptic(20)).not.toThrow();
    });
  });

  describe('SoundSystem', () => {
    it('initializes context', () => {
      soundFx.init();
      expect(global.window.AudioContext).toHaveBeenCalled();
      expect(mockContext.resume).toHaveBeenCalled();
    });

    it('toggles mute state', () => {
      expect(soundFx.isMuted).toBe(false);
      soundFx.toggleMute();
      expect(soundFx.isMuted).toBe(true);
      soundFx.setMuted(false);
      expect(soundFx.isMuted).toBe(false);
    });

    it('playCorrect plays sound and haptics', () => {
      soundFx.playCorrect();
      expect(global.navigator.vibrate).toHaveBeenCalledWith([20, 30, 20]);
      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('playIncorrect plays sound and haptics', () => {
      soundFx.playIncorrect();
      expect(global.navigator.vibrate).toHaveBeenCalledWith(40);
      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('triangle');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('playKeyTap plays sound and haptics', () => {
      soundFx.playKeyTap();
      expect(global.navigator.vibrate).toHaveBeenCalledWith(15);
      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('sine');
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    it('playVictory plays sound and haptics', () => {
      soundFx.playVictory();
      expect(global.navigator.vibrate).toHaveBeenCalledWith([30, 40, 30, 40, 60]);
      expect(mockContext.createOscillator).toHaveBeenCalled();
    });

    it('playStreakBonus plays sound and haptics', () => {
      soundFx.playStreakBonus(4);
      expect(global.navigator.vibrate).toHaveBeenCalledWith([20, 20, 30]);
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(4);
    });

    it('playEquipItem plays sound and haptics', () => {
      soundFx.playEquipItem();
      expect(global.navigator.vibrate).toHaveBeenCalledWith([25, 35]);
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('playVictoryFanfare wraps playVictory', () => {
      const playVictorySpy = vi.spyOn(soundFx, 'playVictory');
      soundFx.playVictoryFanfare();
      expect(playVictorySpy).toHaveBeenCalled();
    });

    it('playSparkCollect plays sound and haptics', () => {
      soundFx.playSparkCollect();
      expect(global.navigator.vibrate).toHaveBeenCalledWith([20, 20]);
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(2); // 2 notes
    });

    it('does not play sound if muted', () => {
      soundFx.setMuted(true);
      soundFx.playCorrect();
      // Should trigger haptics but not create oscillator
      expect(global.navigator.vibrate).toHaveBeenCalledWith([20, 30, 20]);
      expect(mockContext.createOscillator).not.toHaveBeenCalled();
    });
  });
});

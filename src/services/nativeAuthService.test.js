import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nativeAuthService } from './nativeAuthService.js';

describe('nativeAuthService', () => {
  let originalWindow;
  let originalNavigator;
  let originalLocalStorage;

  beforeEach(() => {
    originalWindow = global.window;
    originalNavigator = global.navigator;
    originalLocalStorage = global.localStorage;

    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: vi.fn((key) => (key in store ? store[key] : null)),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key];
        }
      }),
    };

    // Reset inMemoryMockConfig via setMockConfig
    nativeAuthService.setMockConfig({ enabled: false, available: true, success: true });
    global.localStorage.clear();

    // Mock navigator
    global.navigator = {
      credentials: {
        create: vi.fn(),
        get: vi.fn(),
      }
    };

    // Mock window
    global.window = {
      PublicKeyCredential: {
        isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true)
      },
      crypto: {
        getRandomValues: vi.fn((arr) => arr)
      },
      location: {
        hostname: 'localhost'
      }
    };
  });

  afterEach(() => {
    global.window = originalWindow;
    global.navigator = originalNavigator;
    global.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('returns true if mock is enabled and available', async () => {
      nativeAuthService.setMockConfig({ enabled: true, available: true });
      const result = await nativeAuthService.isAvailable();
      expect(result).toBe(true);
    });

    it('returns false if mock is enabled and unavailable', async () => {
      nativeAuthService.setMockConfig({ enabled: true, available: false });
      const result = await nativeAuthService.isAvailable();
      expect(result).toBe(false);
    });

    it('returns true using PublicKeyCredential if available', async () => {
      const result = await nativeAuthService.isAvailable();
      expect(result).toBe(true);
      expect(window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });

    it('returns false if PublicKeyCredential throws and navigator lacks credentials', async () => {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(new Error('test'));
      delete global.navigator.credentials;
      const result = await nativeAuthService.isAvailable();
      expect(result).toBe(false);
    });

    it('returns true as fallback if navigator has credentials', async () => {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(new Error('test'));
      const result = await nativeAuthService.isAvailable();
      expect(result).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('returns mock success if mock is enabled', async () => {
      nativeAuthService.setMockConfig({ enabled: true, success: true });
      const result = await nativeAuthService.authenticate();
      expect(result).toEqual({ success: true, isMock: true, method: 'mock' });
    });

    it('returns mock failure if mock is enabled and success is false', async () => {
      nativeAuthService.setMockConfig({ enabled: true, success: false });
      const result = await nativeAuthService.authenticate();
      expect(result).toEqual({ success: false, error: 'Mock native biometric verification failed.', isMock: true });
    });

    it('authenticates with existing credential successfully', async () => {
      global.localStorage.setItem('kibo_biometric_credential_id', 'some-base64-url');
      navigator.credentials.get.mockResolvedValue({});

      const result = await nativeAuthService.authenticate();

      expect(result).toEqual({ success: true, isMock: false, method: 'webauthn_verify' });
      expect(navigator.credentials.get).toHaveBeenCalled();
    });

    it('handles failure when authenticating with existing credential and falls back to create', async () => {
      global.localStorage.setItem('kibo_biometric_credential_id', 'some-base64-url');

      // get throws generic error
      navigator.credentials.get.mockRejectedValue(new Error('Failed get'));
      // create succeeds
      navigator.credentials.create.mockResolvedValue({ rawId: new ArrayBuffer(16) });

      const result = await nativeAuthService.authenticate();

      expect(navigator.credentials.get).toHaveBeenCalled();
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('kibo_biometric_credential_id');
      expect(navigator.credentials.create).toHaveBeenCalled();
      expect(result).toEqual({ success: true, isMock: false, method: 'webauthn_register' });
    });

    it('returns error if user cancels existing credential auth', async () => {
      global.localStorage.setItem('kibo_biometric_credential_id', 'some-base64-url');
      const error = new Error();
      error.name = 'NotAllowedError';
      navigator.credentials.get.mockRejectedValue(error);

      const result = await nativeAuthService.authenticate();

      expect(result).toEqual({ success: false, error: 'Biometric authentication was cancelled or denied.' });
    });

    it('creates new credential successfully', async () => {
      navigator.credentials.create.mockResolvedValue({ rawId: new ArrayBuffer(16) });

      const result = await nativeAuthService.authenticate();

      expect(navigator.credentials.create).toHaveBeenCalled();
      expect(global.localStorage.setItem).toHaveBeenCalledWith('kibo_biometric_credential_id', expect.any(String));
      expect(result).toEqual({ success: true, isMock: false, method: 'webauthn_register' });
    });

    it('handles NotAllowedError on create', async () => {
      const error = new Error();
      error.name = 'NotAllowedError';
      navigator.credentials.create.mockRejectedValue(error);

      const result = await nativeAuthService.authenticate();

      expect(result).toEqual({ success: false, error: 'Device authentication request was cancelled or denied.' });
    });

    it('handles SecurityError on create', async () => {
      const error = new Error();
      error.name = 'SecurityError';
      navigator.credentials.create.mockRejectedValue(error);

      const result = await nativeAuthService.authenticate();

      expect(result).toEqual({ success: false, error: 'Biometrics security check requires HTTPS or localhost domain.' });
    });

    it('handles generic error on create', async () => {
      navigator.credentials.create.mockRejectedValue(new Error('Some generic error'));

      const result = await nativeAuthService.authenticate();

      expect(result).toEqual({ success: false, error: 'Some generic error' });
    });

    it('returns unsupported error if no WebAuthn API', async () => {
      delete global.window.PublicKeyCredential;
      const result = await nativeAuthService.authenticate();
      expect(result).toEqual({ success: false, error: 'Native local authentication unavailable or unsupported.' });
    });
  });

  describe('resetCredential', () => {
    it('removes credential from localStorage', () => {
      nativeAuthService.resetCredential();
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('kibo_biometric_credential_id');
    });
  });

  describe('Mock Config Helpers', () => {
    it('isMockEnabled returns value from localStorage if set', () => {
      global.localStorage.setItem('kibo_mock_bio_enabled', 'true');
      expect(nativeAuthService.isMockEnabled()).toBe(true);

      global.localStorage.setItem('kibo_mock_bio_enabled', 'false');
      expect(nativeAuthService.isMockEnabled()).toBe(false);
    });

    it('getMockConfig returns combined config', () => {
      global.localStorage.setItem('kibo_mock_bio_enabled', 'true');
      global.localStorage.setItem('kibo_mock_bio_available', 'false');
      global.localStorage.setItem('kibo_mock_bio_success', 'false');

      const cfg = nativeAuthService.getMockConfig();
      expect(cfg).toEqual({ enabled: true, available: false, success: false });
    });
  });
});

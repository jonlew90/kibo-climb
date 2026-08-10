// Native Device Authentication Service for Kibo Climb Parental Gate
// Hooks into WebAuthn / PublicKeyCredential / LocalAuthentication APIs with Dev/Test Mock Support

const MOCK_ENABLED_KEY = 'kibo_mock_bio_enabled';
const MOCK_AVAILABLE_KEY = 'kibo_mock_bio_available';
const MOCK_SUCCESS_KEY = 'kibo_mock_bio_success';

export const nativeAuthService = {
  /**
   * Checks if native device biometrics / local auth is available on this platform or mock config.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    // 1. Check Dev Mock Overrides
    if (this.isMockEnabled()) {
      const isMockAvailable = typeof localStorage !== 'undefined' ? localStorage.getItem(MOCK_AVAILABLE_KEY) : null;
      return isMockAvailable === null ? true : isMockAvailable === 'true';
    }

    // 2. Web / Browser WebAuthn API Check
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) return true;
      }
    } catch (e) {
      console.warn('nativeAuthService: WebAuthn check warning:', e);
    }

    // 3. Fallback: Check window.navigator.credentials or return true in web app
    return typeof window !== 'undefined' && 'credentials' in navigator;
  },

  /**
   * Triggers Native Device Authentication (Biometrics Face ID / Touch ID / Device Passcode).
   * @param {string} promptReason Custom prompt message for native OS dialog.
   * @returns {Promise<{ success: boolean, error?: string, isMock?: boolean }>}
   */
  async authenticate(promptReason = 'Parental verification required to access restricted area.') {
    // 1. Check Dev Mock Mode
    if (this.isMockEnabled()) {
      // Simulate minor async prompt delay for UX fidelity
      await new Promise((resolve) => setTimeout(resolve, 150));
      const shouldSucceed = typeof localStorage !== 'undefined' ? localStorage.getItem(MOCK_SUCCESS_KEY) !== 'false' : true;
      if (shouldSucceed) {
        return { success: true, isMock: true };
      } else {
        return { success: false, error: 'Mock native biometric verification failed.', isMock: true };
      }
    }

    // 2. WebAuthn / Local Auth Prompt
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const credential = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'required',
            rpId: window.location.hostname || 'localhost'
          }
        });

        if (credential) {
          return { success: true };
        }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return { success: false, error: 'Authentication request was cancelled or denied.' };
      }
      console.warn('nativeAuthService: Primary local auth fallback triggered', err);
    }

    // Fallback: If native device auth API prompt failed or wasn't completed
    return { success: false, error: 'Native local authentication unavailable or skipped.' };
  },

  /**
   * Dev / Test Mock Mode Helpers
   */
  isMockEnabled() {
    if (typeof localStorage === 'undefined') return true;
    const val = localStorage.getItem(MOCK_ENABLED_KEY);
    return val === null ? true : val === 'true';
  },

  getMockConfig() {
    if (typeof localStorage === 'undefined') {
      return { enabled: true, available: true, success: true };
    }
    return {
      enabled: this.isMockEnabled(),
      available: localStorage.getItem(MOCK_AVAILABLE_KEY) !== 'false',
      success: localStorage.getItem(MOCK_SUCCESS_KEY) !== 'false'
    };
  },

  setMockConfig({ enabled, available, success }) {
    if (typeof localStorage === 'undefined') return;
    if (enabled !== undefined) localStorage.setItem(MOCK_ENABLED_KEY, String(enabled));
    if (available !== undefined) localStorage.setItem(MOCK_AVAILABLE_KEY, String(available));
    if (success !== undefined) localStorage.setItem(MOCK_SUCCESS_KEY, String(success));
  }
};

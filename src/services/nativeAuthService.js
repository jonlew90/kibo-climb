// Native Device Authentication Service for Kibo Climb Parental Gate
// Hooks into WebAuthn / PublicKeyCredential / LocalAuthentication APIs with Dev/Test Mock Support

const MOCK_ENABLED_KEY = 'kibo_mock_bio_enabled';
const MOCK_AVAILABLE_KEY = 'kibo_mock_bio_available';
const MOCK_SUCCESS_KEY = 'kibo_mock_bio_success';
const CREDENTIAL_ID_KEY = 'kibo_biometric_credential_id';

let inMemoryMockConfig = {
  enabled: null, // null = auto-detect based on platform WebAuthn support
  available: true,
  success: true
};

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let string = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    string += String.fromCharCode(bytes[i]);
  }
  return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToBuffer(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer.buffer;
}

export const nativeAuthService = {
  /**
   * Checks if native device biometrics / local auth is available on this platform or mock config.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    // 1. Check Dev Mock Overrides
    if (this.isMockEnabled()) {
      const cfg = this.getMockConfig();
      return cfg.available;
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

    // 3. Fallback check for web environment
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'credentials' in navigator;
  },

  /**
   * Triggers Native Device Authentication (Biometrics Face ID / Touch ID / Device Passcode via WebAuthn).
   * @param {string} promptReason Custom prompt message for native OS dialog.
   * @returns {Promise<{ success: boolean, error?: string, isMock?: boolean, method?: string }>}
   */
  async authenticate(promptReason = 'Parental verification required to access restricted area.') {
    // 1. Check Dev Mock Mode
    if (this.isMockEnabled()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const cfg = this.getMockConfig();
      if (cfg.success) {
        return { success: true, isMock: true, method: 'mock' };
      } else {
        return { success: false, error: 'Mock native biometric verification failed.', isMock: true };
      }
    }

    // 2. Genuine WebAuthn / Local Biometrics Prompt
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        if (window.crypto && window.crypto.getRandomValues) {
          window.crypto.getRandomValues(challenge);
        }

        const storedCredentialId = typeof localStorage !== 'undefined' ? localStorage.getItem(CREDENTIAL_ID_KEY) : null;

        // Try authentication with existing credential if present
        if (storedCredentialId) {
          try {
            const credential = await navigator.credentials.get({
              publicKey: {
                challenge,
                allowCredentials: [{
                  id: base64UrlToBuffer(storedCredentialId),
                  type: 'public-key'
                }],
                userVerification: 'required',
                timeout: 60000
              }
            });

            if (credential) {
              return { success: true, isMock: false, method: 'webauthn_verify' };
            }
          } catch (getErr) {
            console.warn('nativeAuthService: Existing credential authentication failed, trying creation:', getErr);
            if (getErr.name === 'NotAllowedError' || getErr.name === 'AbortError') {
              return { success: false, error: 'Biometric authentication was cancelled or denied.' };
            }
            if (typeof localStorage !== 'undefined') localStorage.removeItem(CREDENTIAL_ID_KEY);
          }
        }

        // Create new credential (triggers OS Face ID / Touch ID / Passcode prompt)
        const hostname = window.location.hostname || 'localhost';
        const credential = await navigator.credentials.create({
          publicKey: {
            rp: {
              name: 'Kibo Climb Parental Gate',
              id: hostname
            },
            user: {
              id: new Uint8Array([75, 105, 98, 111, 80, 97, 114, 101, 110, 116]),
              name: 'parent@kiboclimb.app',
              displayName: 'Kibo Parent'
            },
            challenge,
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },  // ES256
              { alg: -257, type: 'public-key' } // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required'
            },
            timeout: 60000
          }
        });

        if (credential) {
          const credIdBase64 = bufferToBase64Url(credential.rawId);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CREDENTIAL_ID_KEY, credIdBase64);
          }
          return { success: true, isMock: false, method: 'webauthn_register' };
        }
      }
    } catch (err) {
      console.warn('nativeAuthService: WebAuthn execution error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return { success: false, error: 'Device authentication request was cancelled or denied.' };
      }
      if (err.name === 'SecurityError') {
        return { success: false, error: 'Biometrics security check requires HTTPS or localhost domain.' };
      }
      return { success: false, error: err.message || 'Native local authentication unavailable.' };
    }

    return { success: false, error: 'Native local authentication unavailable or unsupported.' };
  },

  /**
   * Clears saved biometric credential ID (for resetting enrollment)
   */
  resetCredential() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CREDENTIAL_ID_KEY);
    }
  },

  /**
   * Dev / Test Mock Mode Helpers
   */
  isMockEnabled() {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(MOCK_ENABLED_KEY);
      if (val !== null) return val === 'true';
    }
    if (inMemoryMockConfig.enabled !== null) {
      return inMemoryMockConfig.enabled;
    }
    // Auto-detect: if WebAuthn platform API is unsupported in this env, use mock/simulated biometrics
    const hasWebAuthn = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
    return !hasWebAuthn;
  },

  getMockConfig() {
    if (typeof localStorage !== 'undefined') {
      const enabledVal = localStorage.getItem(MOCK_ENABLED_KEY);
      return {
        enabled: enabledVal !== null ? enabledVal === 'true' : this.isMockEnabled(),
        available: localStorage.getItem(MOCK_AVAILABLE_KEY) !== 'false',
        success: localStorage.getItem(MOCK_SUCCESS_KEY) !== 'false'
      };
    }
    return {
      enabled: this.isMockEnabled(),
      available: inMemoryMockConfig.available,
      success: inMemoryMockConfig.success
    };
  },

  setMockConfig({ enabled, available, success }) {
    if (enabled !== undefined) {
      inMemoryMockConfig.enabled = Boolean(enabled);
      if (typeof localStorage !== 'undefined') localStorage.setItem(MOCK_ENABLED_KEY, String(enabled));
    }
    if (available !== undefined) {
      inMemoryMockConfig.available = Boolean(available);
      if (typeof localStorage !== 'undefined') localStorage.setItem(MOCK_AVAILABLE_KEY, String(available));
    }
    if (success !== undefined) {
      inMemoryMockConfig.success = Boolean(success);
      if (typeof localStorage !== 'undefined') localStorage.setItem(MOCK_SUCCESS_KEY, String(success));
    }
  }
};



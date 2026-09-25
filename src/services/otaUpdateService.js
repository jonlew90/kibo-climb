import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const MANIFEST_URL = 'https://kibo-climb.web.app/ota_manifest.json';
const OTA_LAST_CHECK_KEY = 'kibo_ota_last_check';
const OTA_CHECK_INTERVAL_MS = 1000 * 60 * 15; // Check at most every 15 minutes to preserve battery/bandwidth

/**
 * Self-Hosted Native Mobile OTA Update Service for Kibo Climb
 * Communicates directly with your Firebase Hosting / Storage manifest without Capgo Cloud.
 */
export const otaUpdateService = {
  /**
   * Initializes the updater on native platforms.
   * Tells CapacitorUpdater that the current bundle loaded successfully.
   */
  async notifyAppReady() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await CapacitorUpdater.notifyAppReady();
    } catch (err) {
      console.warn('OTA notifyAppReady:', err?.message || err);
    }
  },

  /**
   * Checks the Firebase Hosting manifest for a new web bundle version.
   * If a newer bundle exists, downloads and prepares it in the background.
   * @param {boolean} force - If true, bypasses the 15-minute throttle
   * @returns {Promise<{ updated: boolean, version?: string }>}
   */
  async checkForUpdates(force = false) {
    if (!Capacitor.isNativePlatform()) {
      return { updated: false };
    }

    const now = Date.now();
    const lastCheck = Number(localStorage.getItem(OTA_LAST_CHECK_KEY) || 0);
    if (!force && now - lastCheck < OTA_CHECK_INTERVAL_MS) {
      return { updated: false };
    }
    localStorage.setItem(OTA_LAST_CHECK_KEY, String(now));

    try {
      // 1. Fetch current device bundle version
      const current = await CapacitorUpdater.current();
      const currentVersion = current?.bundle?.version || '1.0.0-mvp';

      // 2. Fetch self-hosted manifest from Firebase
      const res = await fetch(`${MANIFEST_URL}?t=${now}`, {
        cache: 'no-store'
      });
      if (!res.ok) return { updated: false };

      const manifest = await res.json();
      if (!manifest || !manifest.version || !manifest.url) {
        return { updated: false };
      }

      // 3. Compare versions
      if (manifest.version === currentVersion) {
        return { updated: false };
      }

      console.info(`[OTA] New bundle found: ${manifest.version} (current: ${currentVersion}). Downloading...`);

      // 4. Download new bundle directly from Firebase
      const bundle = await CapacitorUpdater.download({
        url: manifest.url,
        version: manifest.version,
      });

      if (!bundle || !bundle.version) {
        return { updated: false };
      }

      // 5. Set new bundle active for next app restart/resume
      await CapacitorUpdater.set(bundle);
      console.info(`[OTA] Bundle ${bundle.version} installed successfully and queued for next restart.`);

      return { updated: true, version: bundle.version };
    } catch (err) {
      console.warn('[OTA] Check/Download failed:', err?.message || err);
      return { updated: false, error: err?.message };
    }
  },

  /**
   * Instantly reloads the WebView to apply the queued bundle.
   */
  async reloadApp() {
    if (!Capacitor.isNativePlatform()) {
      window.location.reload();
      return;
    }
    try {
      await CapacitorUpdater.reload();
    } catch {
      window.location.reload();
    }
  }
};

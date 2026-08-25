import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService.js';
import { requestAppReview } from '../src/utils/AppReview.js';

describe('In-App Rating Prompt & Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to unrated and not dismissed', () => {
    const status = storageService.getAppRatingStatus();
    expect(status.hasRated).toBe(false);
    expect(status.lastDismissedAt).toBeNull();
  });

  it('records rating completion permanently', () => {
    storageService.setAppRated(true);
    const status = storageService.getAppRatingStatus();
    expect(status.hasRated).toBe(true);
    expect(typeof status.ratedAt).toBe('number');
  });

  it('records dismissal timestamp for 60-day cooldown calculation', () => {
    const before = Date.now();
    storageService.dismissAppRatingPrompt();
    const after = Date.now();

    const status = storageService.getAppRatingStatus();
    expect(status.hasRated).toBe(false);
    expect(status.lastDismissedAt).toBeGreaterThanOrEqual(before);
    expect(status.lastDismissedAt).toBeLessThanOrEqual(after);
  });

  it('evaluates 60-day cooldown properly', () => {
    const COOLDOWN_60_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Case 1: Dismissed 10 days ago -> In cooldown
    localStorage.setItem('kibo_app_rating_status', JSON.stringify({
      hasRated: false,
      lastDismissedAt: now - (10 * 24 * 60 * 60 * 1000)
    }));
    let status = storageService.getAppRatingStatus();
    let isSuppressed = (now - status.lastDismissedAt) < COOLDOWN_60_DAYS_MS;
    expect(isSuppressed).toBe(true);

    // Case 2: Dismissed 61 days ago -> Eligible again
    localStorage.setItem('kibo_app_rating_status', JSON.stringify({
      hasRated: false,
      lastDismissedAt: now - (61 * 24 * 60 * 60 * 1000)
    }));
    status = storageService.getAppRatingStatus();
    isSuppressed = (now - status.lastDismissedAt) < COOLDOWN_60_DAYS_MS;
    expect(isSuppressed).toBe(false);
  });

  it('requestAppReview executes gracefully on web/PWA without throws', async () => {
    const result = await requestAppReview();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

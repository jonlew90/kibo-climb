import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Analytics Service & UTM Attribution Verification', () => {
  let originalGtag;

  beforeEach(() => {
    originalGtag = window.gtag;
  });

  afterEach(() => {
    window.gtag = originalGtag;
    vi.restoreAllMocks();
  });

  it('preserves initial landing URL and referrer on first page_view, and chains referrer on subsequent views', async () => {
    // Reset module cache to simulate a fresh page landing
    vi.resetModules();

    const loggedEvents = [];
    window.gtag = vi.fn((type, eventName, params) => {
      loggedEvents.push({ type, eventName, params });
    });

    const { analyticsService } = await import('../../src/services/analyticsService.js');

    analyticsService.logPageView('/math', 'Math Ascent');

    expect(loggedEvents.length).toBe(1);
    expect(loggedEvents[0].eventName).toBe('page_view');
    expect(loggedEvents[0].params.page_path).toBe('/math');
    expect(loggedEvents[0].params.page_title).toBe('Math Ascent');
    expect(loggedEvents[0].params.page_location).toBeDefined();

    // Second navigation (virtual SPA pageview)
    analyticsService.logPageView('/leaderboard', 'Leaderboard');

    expect(loggedEvents.length).toBe(2);
    expect(loggedEvents[1].eventName).toBe('page_view');
    expect(loggedEvents[1].params.page_path).toBe('/leaderboard');
    expect(loggedEvents[1].params.page_title).toBe('Leaderboard');
    // Referrer of second pageview should be the first pageview path/location (/math)
    expect(loggedEvents[1].params.page_referrer).toBe('http://localhost:3000/math');
  });

  it('ensures all push notification URLs in functions/index.js include utm_medium=push to prevent GA4 Unassigned classification', () => {
    const functionsIndexPath = path.resolve(__dirname, '../../functions/index.js');
    const content = fs.readFileSync(functionsIndexPath, 'utf-8');

    // Extract all lines containing utm_source=push_notification
    const lines = content.split('\n').filter((l) => l.includes('utm_source=push_notification'));

    expect(lines.length).toBeGreaterThanOrEqual(6);

    for (const line of lines) {
      expect(line).toContain('utm_medium=push');
      expect(line).toContain('utm_source=push_notification');
      expect(line).toContain('utm_campaign=');
    }
  });
});

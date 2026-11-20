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

  it('filters noisy errors, deduplicates identical messages, and caps exception events per session', async () => {
    vi.resetModules();

    const loggedEvents = [];
    window.gtag = vi.fn((type, eventName, params) => {
      loggedEvents.push({ type, eventName, params });
    });

    const { analyticsService } = await import('../../src/services/analyticsService.js');

    // Noise should be ignored
    analyticsService.logError('Script error.');
    analyticsService.logError('[WM] WorkerMessenger failed');
    analyticsService.logError('ResizeObserver loop completed with undelivered notifications.');
    expect(loggedEvents.length).toBe(0);

    // Duplicate real errors should only log once
    analyticsService.logError(new Error('Real crash 1'), { fatal: true });
    analyticsService.logError(new Error('Real crash 1'), { fatal: true });
    expect(loggedEvents.length).toBe(1);
    expect(loggedEvents[0].eventName).toBe('exception');
    expect(loggedEvents[0].params.description).toBe('Real crash 1');

    // Session cap at 5 total exception events
    for (let i = 2; i <= 8; i++) {
      analyticsService.logError(new Error(`Real crash ${i}`), { fatal: false });
    }
    expect(loggedEvents.length).toBe(5);
  });

  it('preserves homepage canonical on "/" instead of overwriting it to "/math" and respects subject routes', async () => {
    vi.resetModules();
    document.head.innerHTML = '<link rel="canonical" href="https://kiboclimb.com/" />';

    const { updateDocumentSeo } = await import('../../src/utils/seoMetadata.js');

    // Homepage "/" must remain canonical https://kiboclimb.com/
    window.history.replaceState({}, '', '/');
    updateDocumentSeo({ route: 'adaptive_session', subject: 'math' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://kiboclimb.com/');

    // Subject route "/words" gets its self-referencing canonical
    window.history.replaceState({}, '', '/words');
    updateDocumentSeo({ route: 'adaptive_session', subject: 'words' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://kiboclimb.com/words');

    // Dedicated routes (blog_post, worksheet_viewer) are not clobbered
    document.querySelector('link[rel="canonical"]').setAttribute('href', 'https://kiboclimb.com/blog/sample');
    updateDocumentSeo({ route: 'blog_post', subject: 'math' });
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://kiboclimb.com/blog/sample');
  });
});

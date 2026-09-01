import { describe, it, expect, beforeEach } from 'vitest';
import {
  NavigationHistory,
  VIEWS,
  VIEW_TYPES,
  getPathForId,
  isModalView,
  normalizeEntry,
  SUBJECT_ROUTES
} from '../src/utils/navigationHistory';

describe('NavigationHistory System', () => {
  let nav;

  beforeEach(() => {
    nav = new NavigationHistory();
  });

  it('initializes with default adaptive_session route', () => {
    expect(nav.getCurrent()).toEqual({
      type: VIEW_TYPES.ROUTE,
      id: VIEWS.ADAPTIVE_SESSION,
      path: '/',
      params: {}
    });
    expect(nav.getStack().length).toBe(1);
    expect(nav.getBaseRoute()).toEqual({
      type: VIEW_TYPES.ROUTE,
      id: VIEWS.ADAPTIVE_SESSION,
      path: '/',
      params: {}
    });
  });

  it('correctly maps route IDs to URL paths and distinguishes modal vs route views', () => {
    expect(getPathForId(VIEWS.ADAPTIVE_SESSION)).toBe('/');
    expect(getPathForId(VIEWS.ADAPTIVE_SESSION, { subject: 'words' })).toBe('/words');
    expect(getPathForId(VIEWS.ADAPTIVE_SESSION, { subject: 'world' })).toBe('/world');
    expect(getPathForId(VIEWS.ADAPTIVE_SESSION, { subject: 'coding' })).toBe('/coding');
    expect(getPathForId(VIEWS.ADAPTIVE_SESSION, { subject: 'math' })).toBe('/math');
    expect(getPathForId(VIEWS.SETTINGS)).toBe('/settings');
    expect(getPathForId(VIEWS.PRIVACY)).toBe('/privacy');
    expect(getPathForId(VIEWS.TERMS)).toBe('/terms');
    expect(getPathForId(VIEWS.LEADERBOARD)).toBe('/leaderboard');
    expect(getPathForId(VIEWS.QUESTS)).toBe('/quests');
    expect(getPathForId(VIEWS.PARENT_DASHBOARD)).toBe('/parent');

    expect(isModalView(VIEWS.WORKSHOP)).toBe(true);
    expect(isModalView(VIEWS.BADGES)).toBe(true);
    expect(isModalView(VIEWS.ASCENT_ROADMAP)).toBe(true);
    expect(isModalView(VIEWS.PIN_GATE)).toBe(true);
    expect(isModalView(VIEWS.PARENT_DASHBOARD)).toBe(false);
    expect(isModalView(VIEWS.ADAPTIVE_SESSION)).toBe(false);
    expect(isModalView(VIEWS.SETTINGS)).toBe(false);
  });

  it('normalizes entries with shorthand string or object', () => {
    const entryFromStr = normalizeEntry('settings');
    expect(entryFromStr).toEqual({
      type: VIEW_TYPES.ROUTE,
      id: 'settings',
      path: '/settings',
      params: {}
    });

    const modalFromStr = normalizeEntry('workshop');
    expect(modalFromStr).toEqual({
      type: VIEW_TYPES.MODAL,
      id: 'workshop',
      path: '/',
      params: {}
    });
  });

  it('handles App -> Shop -> Passport -> Back -> Shop -> Back -> App flow (User Issue)', () => {
    // 1. Initially on App
    expect(nav.getCurrent().id).toBe(VIEWS.ADAPTIVE_SESSION);

    // 2. Click Shop
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP, params: { hub: 'wearables', viewMode: 'shop' } });
    expect(nav.getCurrent().id).toBe(VIEWS.WORKSHOP);
    expect(nav.getBaseRoute().id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getStack().length).toBe(2);

    // 3. Click Passport
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.BADGES });
    expect(nav.getCurrent().id).toBe(VIEWS.BADGES);
    expect(nav.getBaseRoute().id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getStack().length).toBe(3);

    // 4. Hit Back button on Passport -> Must return to Shop
    const backToShop = nav.pop();
    expect(backToShop.id).toBe(VIEWS.WORKSHOP);
    expect(nav.getCurrent().id).toBe(VIEWS.WORKSHOP);
    expect(nav.getStack().length).toBe(2);

    // 5. Hit Back button on Shop -> Must return to App
    const backToApp = nav.pop();
    expect(backToApp.id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getCurrent().id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getStack().length).toBe(1);
  });

  it('handles App -> Leaderboard -> Quests -> Back -> Leaderboard -> Back -> App flow', () => {
    // 1. Open Leaderboard
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.LEADERBOARD, path: '/leaderboard' });
    expect(nav.getCurrent().id).toBe(VIEWS.LEADERBOARD);
    expect(nav.getBaseRoute().id).toBe(VIEWS.LEADERBOARD);

    // 2. Open Quests
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.QUESTS, path: '/quests' });
    expect(nav.getCurrent().id).toBe(VIEWS.QUESTS);
    expect(nav.getBaseRoute().id).toBe(VIEWS.QUESTS);

    // 3. Hit Back on Quests -> Returns to Leaderboard
    const back1 = nav.pop();
    expect(back1.id).toBe(VIEWS.LEADERBOARD);
    expect(nav.getCurrent().id).toBe(VIEWS.LEADERBOARD);

    // 4. Hit Back on Leaderboard -> Returns to App
    const back2 = nav.pop();
    expect(back2.id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getCurrent().id).toBe(VIEWS.ADAPTIVE_SESSION);
  });

  it('handles Leaderboard -> Shop -> Passport -> Back -> Shop -> Back -> Leaderboard flow', () => {
    // 1. Go to Leaderboard
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.LEADERBOARD, path: '/leaderboard' });

    // 2. Open Shop modal from Leaderboard
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });
    expect(nav.getCurrent().id).toBe(VIEWS.WORKSHOP);
    expect(nav.getBaseRoute().id).toBe(VIEWS.LEADERBOARD);

    // 3. Open Passport modal
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.BADGES });
    expect(nav.getCurrent().id).toBe(VIEWS.BADGES);

    // 4. Back from Passport -> Shop
    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.WORKSHOP);

    // 5. Back from Shop -> Leaderboard (underlying route preserved)
    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.LEADERBOARD);
    expect(nav.getBaseRoute().id).toBe(VIEWS.LEADERBOARD);
  });

  it('handles Settings -> Privacy Policy -> Back -> Settings -> Back -> App flow', () => {
    // 1. Go to Settings
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.SETTINGS, path: '/settings' });

    // 2. Go to Privacy Policy
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.PRIVACY, path: '/privacy' });
    expect(nav.getCurrent().id).toBe(VIEWS.PRIVACY);

    // 3. Back from Privacy Policy -> Settings
    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.SETTINGS);

    // 4. Back from Settings -> App
    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.ADAPTIVE_SESSION);
  });

  it('handles Settings -> Terms of Service -> Back -> Settings flow', () => {
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.SETTINGS, path: '/settings' });
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.TERMS, path: '/terms' });
    expect(nav.getCurrent().id).toBe(VIEWS.TERMS);

    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.SETTINGS);
  });

  it('handles Passport -> Ascent Roadmap -> Back -> Passport flow', () => {
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.BADGES });
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.ASCENT_ROADMAP });
    expect(nav.getCurrent().id).toBe(VIEWS.ASCENT_ROADMAP);

    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.BADGES);
  });

  it('handles Shop -> PIN Gate -> replace with Parent Dashboard -> Back -> Shop flow', () => {
    // 1. Open Shop
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });

    // 2. Open PIN Gate to access Parent Zone
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.PIN_GATE, params: { source: 'shop' } });
    expect(nav.getCurrent().id).toBe(VIEWS.PIN_GATE);

    // 3. Upon unlock, replace PIN Gate with Parent Dashboard
    nav.replace({ type: VIEW_TYPES.MODAL, id: VIEWS.PARENT_DASHBOARD, params: { tab: 'verification' } });
    expect(nav.getCurrent().id).toBe(VIEWS.PARENT_DASHBOARD);

    // 4. Closing Parent Dashboard pops directly back to Shop (skips PIN gate)
    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.WORKSHOP);
  });

  it('handles Settings -> Feedback Modal -> Back -> Settings flow', () => {
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.SETTINGS, path: '/settings' });
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.FEEDBACK });
    expect(nav.getCurrent().id).toBe(VIEWS.FEEDBACK);

    nav.pop();
    expect(nav.getCurrent().id).toBe(VIEWS.SETTINGS);
  });

  it('deduplicates consecutive identical navigation entries', () => {
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });
    expect(nav.getStack().length).toBe(2);

    // Push same modal again with same params
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });
    expect(nav.getStack().length).toBe(2);
  });

  it('does not allow stack to become empty on excess pops', () => {
    expect(nav.getStack().length).toBe(1);
    const popped = nav.pop();
    expect(popped.id).toBe(VIEWS.ADAPTIVE_SESSION);
    expect(nav.getStack().length).toBe(1);
  });

  it('resets the stack completely when reset is invoked', () => {
    nav.push({ type: VIEW_TYPES.ROUTE, id: VIEWS.SETTINGS, path: '/settings' });
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });
    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.BADGES });
    expect(nav.getStack().length).toBe(4);

    nav.reset({ type: VIEW_TYPES.ROUTE, id: VIEWS.ADAPTIVE_SESSION, path: '/' });
    expect(nav.getStack().length).toBe(1);
    expect(nav.getCurrent().id).toBe(VIEWS.ADAPTIVE_SESSION);
  });

  it('notifies subscribers on state mutations', () => {
    let notifiedState = null;
    const unsub = nav.subscribe((state) => {
      notifiedState = state;
    });

    nav.push({ type: VIEW_TYPES.MODAL, id: VIEWS.WORKSHOP });
    expect(notifiedState).not.toBeNull();
    expect(notifiedState.current.id).toBe(VIEWS.WORKSHOP);
    expect(notifiedState.stack.length).toBe(2);

    unsub();
    nav.pop();
    // After unsubscribe, notifiedState should not update from pop
    expect(notifiedState.current.id).toBe(VIEWS.WORKSHOP);
  });
});

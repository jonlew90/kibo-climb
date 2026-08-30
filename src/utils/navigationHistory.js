export const VIEW_TYPES = {
  ROUTE: 'route',
  MODAL: 'modal'
};

export const VIEWS = {
  // Routes
  ADAPTIVE_SESSION: 'adaptive_session',
  SETTINGS: 'settings',
  PRIVACY: 'privacy',
  TERMS: 'terms',
  LEADERBOARD: 'leaderboard',
  QUESTS: 'quests',

  // Modals
  WORKSHOP: 'workshop',
  BADGES: 'badges',
  ASCENT_ROADMAP: 'ascent_roadmap',
  PARENT_DASHBOARD: 'parent_dashboard',
  PIN_GATE: 'pin_gate',
  PROFILE_SWITCHER: 'profile_switcher',
  FEEDBACK: 'feedback',
  NEWS: 'news',
  FRIENDS: 'friends',
  FAMILY_UPGRADE: 'family_upgrade',
  ACCOUNT_LINK: 'account_link',
  MOCK_CHECKOUT: 'mock_checkout',
  STRIPE_CHECKOUT: 'stripe_checkout',
  SHARE: 'share'
};

export const isModalView = (id) => {
  return [
    VIEWS.WORKSHOP,
    VIEWS.BADGES,
    VIEWS.ASCENT_ROADMAP,
    VIEWS.PARENT_DASHBOARD,
    VIEWS.PIN_GATE,
    VIEWS.PROFILE_SWITCHER,
    VIEWS.FEEDBACK,
    VIEWS.NEWS,
    VIEWS.FRIENDS,
    VIEWS.FAMILY_UPGRADE,
    VIEWS.ACCOUNT_LINK,
    VIEWS.MOCK_CHECKOUT,
    VIEWS.STRIPE_CHECKOUT,
    VIEWS.SHARE
  ].includes(id);
};

export const getPathForId = (id) => {
  switch (id) {
    case VIEWS.SETTINGS:
      return '/settings';
    case VIEWS.PRIVACY:
      return '/privacy';
    case VIEWS.TERMS:
      return '/terms';
    case VIEWS.LEADERBOARD:
      return '/leaderboard';
    case VIEWS.QUESTS:
      return '/quests';
    case VIEWS.ADAPTIVE_SESSION:
    default:
      return '/';
  }
};

export const normalizeEntry = (entry) => {
  if (typeof entry === 'string') {
    entry = { id: entry };
  }
  const id = entry?.id || VIEWS.ADAPTIVE_SESSION;
  const isModal = isModalView(id);
  return {
    type: entry?.type || (isModal ? VIEW_TYPES.MODAL : VIEW_TYPES.ROUTE),
    id,
    path: entry?.path || getPathForId(id),
    params: entry?.params ? { ...entry.params } : {}
  };
};

export class NavigationHistory {
  constructor(initialStack = []) {
    if (initialStack && initialStack.length > 0) {
      this.stack = initialStack.map(normalizeEntry);
    } else {
      this.stack = [normalizeEntry({ id: VIEWS.ADAPTIVE_SESSION, path: '/' })];
    }
    this.listeners = new Set();
  }

  getStack() {
    return this.stack.map(e => ({ ...e, params: { ...e.params } }));
  }

  getCurrent() {
    if (this.stack.length === 0) {
      return normalizeEntry({ id: VIEWS.ADAPTIVE_SESSION, path: '/' });
    }
    const current = this.stack[this.stack.length - 1];
    return { ...current, params: { ...current.params } };
  }

  getBaseRoute() {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].type === VIEW_TYPES.ROUTE) {
        return { ...this.stack[i], params: { ...this.stack[i].params } };
      }
    }
    return normalizeEntry({ id: VIEWS.ADAPTIVE_SESSION, path: '/' });
  }

  push(entry) {
    if (!entry) return this.getCurrent();
    const normalized = normalizeEntry(entry);
    const current = this.getCurrent();

    // Avoid pushing duplicate consecutive state with identical id and params
    if (current.id === normalized.id && JSON.stringify(current.params) === JSON.stringify(normalized.params)) {
      return current;
    }

    this.stack.push(normalized);
    this.notify();
    return normalized;
  }

  pop() {
    if (this.stack.length > 1) {
      this.stack.pop();
      const current = this.getCurrent();
      this.notify();
      return current;
    }

    // If at root but not default adaptive_session, reset to adaptive_session
    if (this.stack.length === 1 && this.stack[0].id !== VIEWS.ADAPTIVE_SESSION) {
      this.stack = [normalizeEntry({ id: VIEWS.ADAPTIVE_SESSION, path: '/' })];
      const current = this.getCurrent();
      this.notify();
      return current;
    }

    return this.getCurrent();
  }

  replace(entry) {
    if (!entry) return this.getCurrent();
    const normalized = normalizeEntry(entry);
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = normalized;
    } else {
      this.stack = [normalized];
    }
    this.notify();
    return normalized;
  }

  reset(entry = { id: VIEWS.ADAPTIVE_SESSION, path: '/' }) {
    const normalized = normalizeEntry(entry);
    this.stack = [normalized];
    this.notify();
    return normalized;
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  notify() {
    const current = this.getCurrent();
    const stack = this.getStack();
    const baseRoute = this.getBaseRoute();
    const payload = { current, stack, baseRoute };
    this.listeners.forEach(listener => {
      try {
        listener(payload, current, stack, baseRoute);
      } catch (e) {
        console.error('NavigationHistory listener error:', e);
      }
    });
  }
}

export const navigationHistory = new NavigationHistory();

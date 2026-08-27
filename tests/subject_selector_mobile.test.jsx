import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../src/App';
import LeaderboardScreen from '../src/components/LeaderboardScreen';
import { storageService } from '../src/services/storageService';

vi.mock('../src/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(() => null),
    getAuthState: vi.fn(() => null),
    initAnonymousGuest: vi.fn(() => Promise.resolve({ uid: 'guest_123' })),
    onAuthStateChanged: vi.fn(() => () => {})
  }
}));

vi.mock('../src/services/syncService', () => ({
  syncService: {
    init: vi.fn(),
    initBackgroundSync: vi.fn(),
    sync: vi.fn()
  }
}));

vi.mock('../src/services/shopLedgerService', () => ({
  shopLedgerService: {
    getTransactions: vi.fn(() => [])
  }
}));

vi.mock('../src/services/leaderboardService', () => ({
  leaderboardService: {
    getLeaderboard: vi.fn(() => Promise.resolve([])),
    subscribeToLeaderboard: vi.fn(() => () => {}),
    submitScore: vi.fn(),
    getCurrentUser: vi.fn(() => null),
    fetchCloudFriendRequests: vi.fn(() => Promise.resolve({ received: [], sent: [] })),
    syncUserScore: vi.fn()
  }
}));

vi.mock('../src/services/analyticsService', () => ({
  analyticsService: {
    logQuestionAnswered: vi.fn()
  }
}));

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playKeyTap: vi.fn(),
    playIncorrect: vi.fn(),
    playSparkCollect: vi.fn(),
    playStreakBonus: vi.fn(),
    playPowerUp: vi.fn(),
    playWhoosh: vi.fn(),
    playBadgeFanfare: vi.fn(),
    setMuted: vi.fn()
  },
  setHapticsEnabled: vi.fn()
}));

vi.mock('../src/components/ConfettiCanvas', () => ({
  default: () => null
}));

vi.mock('../src/components/Mascot', () => ({
  default: () => <div data-testid="mascot" />
}));

describe('Mobile Subject Selector Sizing and Centering', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    localStorage.clear();
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  it('renders mobile subject selector centered and constrained in App home view', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const mobileDropdownBtn = container.querySelector('button[title="Switch Subject"]');
    expect(mobileDropdownBtn).not.toBeNull();

    const mobileDropdownContainer = mobileDropdownBtn.parentElement;
    expect(mobileDropdownContainer).not.toBeNull();

    // Verify it is not spanning full width (w-full) and is width-constrained
    const containerClasses = mobileDropdownContainer.className;
    expect(containerClasses).toContain('w-48');
    expect(containerClasses).toContain('max-w-[220px]');
    expect(containerClasses).not.toContain('w-full');

    // Verify parent wrapper is centered
    const outerWrapper = mobileDropdownContainer.parentElement;
    expect(outerWrapper.className).toContain('justify-center');
  });

  it('renders mobile subject selector centered and constrained in LeaderboardScreen', async () => {
    await act(async () => {
      root.render(
        <LeaderboardScreen
          currentProfileId="default_child"
          activeSubject="math"
          onClose={() => {}}
        />
      );
    });

    const mobileDropdownBtn = container.querySelector('button[title="Switch Subject"]');
    expect(mobileDropdownBtn).not.toBeNull();

    const mobileDropdownContainer = mobileDropdownBtn.parentElement;
    expect(mobileDropdownContainer).not.toBeNull();

    const containerClasses = mobileDropdownContainer.className;
    expect(containerClasses).toContain('w-48');
    expect(containerClasses).toContain('max-w-[220px]');
    expect(containerClasses).not.toContain('w-full');

    const outerWrapper = mobileDropdownContainer.parentElement;
    expect(outerWrapper.className).toContain('justify-center');

    // Controls bar container must have z-30 / relative positioning to stay above podium elements (z-10, z-20)
    const controlsBar = outerWrapper.parentElement;
    expect(controlsBar.className).toContain('relative');
    expect(controlsBar.className).toContain('z-30');
  });
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MathSessionView from '../src/components/MathSessionView';
import WordsSessionView from '../src/components/WordsSessionView';
import WorldSessionView from '../src/components/WorldSessionView';
import CodingSessionView from '../src/components/CodingSessionView';
import { storageService } from '../src/services/storageService';

vi.mock('../src/services/storageService', () => {
  let savedStates = {};
  return {
    storageService: {
      getUserData: vi.fn((subject = 'math') => ({
        adaptiveCompetenceRating: 1000,
        competenceRank: 1000,
        unlockedBadges: []
      })),
      saveUserData: vi.fn(),
      getActiveClimbState: vi.fn((profileId, subjectId = 'math') => {
        return savedStates[subjectId] || null;
      }),
      saveActiveClimbState: vi.fn((state, profileId, subjectId = 'math') => {
        savedStates[subjectId] = state;
      }),
      clearActiveClimbState: vi.fn((profileId, subjectId = 'math') => {
        delete savedStates[subjectId];
      }),
      getFriends: vi.fn(() => []),
      getActiveProfile: vi.fn(() => ({ id: 'test_child', name: 'Tester', avatar: 'fox' })),
      getActiveProfileId: vi.fn(() => 'test_child'),
      _clearMockStorage: () => {
        savedStates = {};
      }
    }
  };
});

vi.mock('../src/components/ConfettiCanvas', () => ({
  default: () => null
}));

vi.mock('../src/components/Mascot', () => ({
  default: () => <div data-testid="mascot" />
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
  }
}));

describe('Climb Auto-Pause on Navigation / Inactivity across All Subjects', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    storageService._clearMockStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  const subjects = [
    { name: 'math', Component: MathSessionView },
    { name: 'words', Component: WordsSessionView },
    { name: 'world', Component: WorldSessionView },
    { name: 'coding', Component: CodingSessionView }
  ];

  subjects.forEach(({ name, Component }) => {
    describe(`${name.toUpperCase()} Session View`, () => {
      it('should start climb, auto-pause on window blur/visibilitychange, save state, and display resume prompt', async () => {
        await act(async () => {
          root.render(
            <Component
              profileId="test_child"
              isPaused={false}
              equippedItems={[]}
              sparks={100}
              streak={5}
            />
          );
        });

        // Initially on pre-climb screen
        expect(container.textContent).toMatch(/Start Climb|Ready for the Climb/i);

        // Click Start Climb
        const startBtn = container.querySelector('button');
        expect(startBtn).toBeTruthy();
        await act(async () => {
          startBtn.click();
        });

        // Now in active climb session
        expect(container.textContent).not.toMatch(/Start Climb/i);

        // Simulate navigating away / tab switch (visibilitychange with document.hidden = true)
        Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
        await act(async () => {
          document.dispatchEvent(new Event('visibilitychange'));
        });

        // Climb should auto-pause and return to pre-climb resume view
        expect(storageService.saveActiveClimbState).toHaveBeenCalledWith(
          expect.anything(),
          'test_child',
          name
        );
        expect(container.textContent).toMatch(/Resume Climb|Resume|Climb in Progress/i);

        // Reset document.hidden
        Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      });

      it('should auto-pause when unmounted mid-climb (e.g. user navigates to Leaderboard/Settings/Subject Switch)', async () => {
        await act(async () => {
          root.render(
            <Component
              profileId="test_child"
              isPaused={false}
              equippedItems={[]}
              sparks={100}
              streak={5}
            />
          );
        });

        // Click Start Climb
        const startBtn = container.querySelector('button');
        await act(async () => {
          startBtn.click();
        });

        // Verify unmount triggers save
        storageService.saveActiveClimbState.mockClear();
        await act(async () => {
          root.unmount();
        });

        expect(storageService.saveActiveClimbState).toHaveBeenCalledWith(
          expect.anything(),
          'test_child',
          name
        );
      });
    });
  });
});

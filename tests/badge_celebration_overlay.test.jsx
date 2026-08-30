import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MathSessionView from '../src/components/MathSessionView';
import WordsSessionView from '../src/components/WordsSessionView';
import WorldSessionView from '../src/components/WorldSessionView';
import { storageService } from '../src/services/storageService';
import { evaluateBadges } from '../src/utils/badgeManager';

vi.mock('../src/services/storageService', () => {
  return {
    storageService: {
      getUserData: vi.fn(() => ({
        adaptiveCompetenceRating: 1000,
        competenceRank: 1000,
        unlockedBadges: []
      })),
      saveUserData: vi.fn(),
      getActiveClimbState: vi.fn(() => null),
      saveActiveClimbState: vi.fn(),
      clearActiveClimbState: vi.fn(),
      getFriends: vi.fn(() => []),
      getActiveProfile: vi.fn(() => ({ id: 'test_child', name: 'Tester' })),
      getActiveProfileId: vi.fn(() => 'test_child')
    }
  };
});

vi.mock('../src/utils/mathGenerator', () => ({
  generateProblems: () => [
    {
      id: 'm1',
      prompt: '1 + 1 = ?',
      displayString: '1 + 1 = ?',
      answer: '2',
      answerString: '2',
      tier: 1
    }
  ]
}));

vi.mock('../src/utils/wordsGenerator', () => ({
  generateProblems: () => [
    {
      id: 'w1',
      prompt: 'CAT',
      word: 'CAT',
      answer: 'CAT',
      answerString: 'CAT',
      displayString: '_ A T',
      tier: 1
    }
  ],
  generateTierProblem: () => ({
    id: 'w1_tier',
    prompt: 'CAT',
    word: 'CAT',
    answer: 'CAT',
    answerString: 'CAT',
    displayString: '_ A T',
    tier: 1
  })
}));

vi.mock('../src/utils/worldGenerator', () => ({
  generateWorldSession: () => [
    {
      id: 'world1',
      prompt: 'What continent is France in?',
      displayString: 'What continent is France in?',
      answer: 'Europe',
      correctAnswer: 'Europe',
      answerString: 'Europe',
      options: ['Europe', 'Asia'],
      tier: 1
    }
  ],
  generateWorldProblem: () => ({
    id: 'world1',
    prompt: 'What continent is France in?',
    displayString: 'What continent is France in?',
    answer: 'Europe',
    correctAnswer: 'Europe',
    answerString: 'Europe',
    options: ['Europe', 'Asia'],
    tier: 1
  }),
  getNormalizedProblemKey: () => 'world1',
  shuffleArray: (arr) => arr
}));

vi.mock('../src/components/ConfettiCanvas', () => ({
  default: () => <div data-testid="confetti" />
}));

vi.mock('../src/components/Mascot', () => ({
  default: () => <div data-testid="mascot" />
}));

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playKeyTap: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playSparkCollect: vi.fn(),
    playStreakBonus: vi.fn(),
    playPowerUp: vi.fn(),
    playWhoosh: vi.fn(),
    playBadgeFanfare: vi.fn(),
    setMuted: vi.fn(),
    startBGM: vi.fn(),
    stopBGM: vi.fn(),
    setMusicMuted: vi.fn(),
    init: vi.fn()
  },
  triggerHaptic: vi.fn()
}));

vi.mock('../src/utils/badgeManager', () => ({
  evaluateBadges: vi.fn()
}));

describe('Mid-Climb Badge Celebration Modal Overlay', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
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
    document.body.style.overflow = '';
  });

  describe('MathSessionView', () => {
    it('mounts full-screen overlay to document.body, locks scroll, and closes on Keep Climbing button', async () => {
      evaluateBadges.mockReturnValue({
        newlyUnlocked: [
          {
            id: 'speed_demon',
            title: 'Lightning Climber',
            name: 'Lightning Climber',
            description: 'Completed in record time!',
            icon: '⚡'
          }
        ],
        updatedUnlocked: [{ id: 'speed_demon' }]
      });

      await act(async () => {
        root.render(
          <MathSessionView
            profileId="test_child"
            isPaused={false}
            onAwardSparks={vi.fn()}
            onUnlockedBadgesChange={vi.fn()}
          />
        );
      });

      // Find and click the Start Climb CTA button
      const allButtons = Array.from(container.querySelectorAll('button'));
      const startBtn = allButtons.find(b => b.textContent.includes('CLIMB') || b.textContent.includes('START'));
      expect(startBtn).toBeTruthy();
      await act(async () => {
        startBtn.click();
      });

      // Find the keypad digit '2' button (correct answer for 1 + 1 = 2)
      const keypadButtons = Array.from(container.querySelectorAll('button'));
      const twoBtn = keypadButtons.find(b => b.textContent.trim() === '2');
      expect(twoBtn).toBeTruthy();

      await act(async () => {
        twoBtn.click();
      });

      // Overlay should be attached directly to document.body with z-[1000] and fixed inset-0
      const modalBackdrop = document.body.querySelector('.z-\\[1000\\]');
      expect(modalBackdrop).toBeTruthy();
      expect(modalBackdrop.parentElement).toBe(document.body);
      expect(modalBackdrop.classList.contains('fixed')).toBe(true);
      expect(modalBackdrop.classList.contains('inset-0')).toBe(true);

      // Body scroll should be locked
      expect(document.body.style.overflow).toBe('hidden');

      // Modal should display badge details
      expect(modalBackdrop.textContent).toContain('Lightning Climber');
      expect(modalBackdrop.textContent).toContain('Completed in record time!');

      // Clicking "Keep Climbing 🚀" button should close the overlay
      const keepClimbingBtn = Array.from(modalBackdrop.querySelectorAll('button')).find(
        b => b.textContent.includes('Keep Climbing')
      );
      expect(keepClimbingBtn).toBeTruthy();

      await act(async () => {
        keepClimbingBtn.click();
      });

      // Overlay should be gone and body overflow restored
      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });

    it('closes celebration overlay on Escape keydown', async () => {
      evaluateBadges.mockReturnValue({
        newlyUnlocked: [
          {
            id: 'sum_master',
            title: 'Master of Sums',
            name: 'Master of Sums',
            description: 'Solved 10 sum problems!',
            icon: '🏆'
          }
        ],
        updatedUnlocked: [{ id: 'sum_master' }]
      });

      await act(async () => {
        root.render(
          <MathSessionView
            profileId="test_child"
            isPaused={false}
            onAwardSparks={vi.fn()}
            onUnlockedBadgesChange={vi.fn()}
          />
        );
      });

      const allButtons = Array.from(container.querySelectorAll('button'));
      const startBtn = allButtons.find(b => b.textContent.includes('CLIMB') || b.textContent.includes('START'));
      await act(async () => {
        startBtn.click();
      });

      const keypadButtons = Array.from(container.querySelectorAll('button'));
      const twoBtn = keypadButtons.find(b => b.textContent.trim() === '2');
      await act(async () => {
        twoBtn.click();
      });

      expect(document.body.querySelector('.z-\\[1000\\]')).toBeTruthy();

      // Dispatch Escape key
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('WorldSessionView', () => {
    it('mounts full-screen overlay to document.body, locks scroll, and closes on backdrop click', async () => {
      evaluateBadges.mockReturnValue({
        newlyUnlocked: [
          {
            id: 'globe_trotter',
            title: 'Globe Trotter',
            name: 'Globe Trotter',
            description: 'Explored 5 continents!',
            icon: '🌍'
          }
        ],
        updatedUnlocked: [{ id: 'globe_trotter' }]
      });

      await act(async () => {
        root.render(
          <WorldSessionView
            profileId="test_child"
            isPaused={false}
            onAwardSparks={vi.fn()}
            onUnlockedBadgesChange={vi.fn()}
          />
        );
      });

      const allButtons = Array.from(container.querySelectorAll('button'));
      const startBtn = allButtons.find(b => b.textContent.includes('CLIMB') || b.textContent.includes('START'));
      expect(startBtn).toBeTruthy();
      await act(async () => {
        startBtn.click();
      });

      // Click the 'Europe' option button
      const optionButtons = Array.from(container.querySelectorAll('button'));
      const europeBtn = optionButtons.find(b => b.textContent.includes('Europe'));
      expect(europeBtn).toBeTruthy();

      await act(async () => {
        europeBtn.click();
      });

      const modalBackdrop = document.body.querySelector('.z-\\[1000\\]');
      expect(modalBackdrop).toBeTruthy();
      expect(modalBackdrop.parentElement).toBe(document.body);
      expect(document.body.style.overflow).toBe('hidden');

      // Click backdrop to dismiss
      await act(async () => {
        modalBackdrop.click();
      });

      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('WordsSessionView', () => {
    it('mounts full-screen overlay to document.body and locks scroll', async () => {
      evaluateBadges.mockReturnValue({
        newlyUnlocked: [
          {
            id: 'word_wizard',
            title: 'Word Wizard',
            name: 'Word Wizard',
            description: 'Mastered 10 word puzzles!',
            icon: '📚'
          }
        ],
        updatedUnlocked: [{ id: 'word_wizard' }]
      });

      await act(async () => {
        root.render(
          <WordsSessionView
            profileId="test_child"
            isPaused={false}
            onAwardSparks={vi.fn()}
            onUnlockedBadgesChange={vi.fn()}
          />
        );
      });

      const allButtons = Array.from(container.querySelectorAll('button'));
      const startBtn = allButtons.find(b => b.textContent.includes('CLIMB') || b.textContent.includes('START'));
      expect(startBtn).toBeTruthy();
      await act(async () => {
        startBtn.click();
      });

      // Type the missing letter 'C' via Qwerty keyboard button
      const keyButtons = Array.from(container.querySelectorAll('button'));
      const cBtn = keyButtons.find(b => b.textContent.trim() === 'C');
      expect(cBtn).toBeTruthy();

      await act(async () => {
        cBtn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      });

      const modalBackdrop = document.body.querySelector('.z-\\[1000\\]');
      expect(modalBackdrop).toBeTruthy();
      expect(modalBackdrop.parentElement).toBe(document.body);
      expect(document.body.style.overflow).toBe('hidden');

      // Dismiss via Escape
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });
  });
});

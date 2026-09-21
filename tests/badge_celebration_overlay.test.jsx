import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MathSessionView from '../src/components/MathSessionView';
import WordsSessionView from '../src/components/WordsSessionView';
import WorldSessionView from '../src/components/WorldSessionView';
import KiboBreakOverlay from '../src/components/KiboBreakOverlay';
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
      getActiveProfileId: vi.fn(() => 'test_child'),
      hasClubMembership: vi.fn(() => false)
    }
  };
});

vi.mock('../src/services/questService', () => ({
  questService: {
    getQuests: vi.fn(() => ({ levelInfo: { level: 1, title: 'Basecamp Explorer', progressPct: 0 } })),
    getDailySubjectsCompleted: vi.fn(() => []),
    isDailyMultiSubjectBonusClaimed: vi.fn(() => false)
  }
}));

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
    playStreakMilestone: vi.fn(),
    playBlockComplete: vi.fn(),
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

describe('End-Screen Badge Celebration Showcase (Non-blocking Mid-Climb)', () => {
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
    it('shows non-blocking toast banner on mid-climb badge unlock without blocking modal', async () => {
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

      // Find and click Start Climb CTA button
      const allButtons = Array.from(container.querySelectorAll('button'));
      const startBtn = allButtons.find(b => b.textContent.includes('CLIMB') || b.textContent.includes('START'));
      expect(startBtn).toBeTruthy();
      await act(async () => {
        startBtn.click();
      });

      // Answer correctly (1 + 1 = 2)
      const keypadButtons = Array.from(container.querySelectorAll('button'));
      const twoBtn = keypadButtons.find(b => b.textContent.trim() === '2');
      expect(twoBtn).toBeTruthy();

      await act(async () => {
        twoBtn.click();
      });

      // No full-screen modal blocking the user (no document.body modal portal)
      const modalBackdrop = document.body.querySelector('.z-\\[1000\\]');
      expect(modalBackdrop).toBeNull();

      // Non-blocking toast banner should appear in container
      expect(container.textContent).toContain('Badge Unlocked: Lightning Climber!');
    });
  });

  describe('WorldSessionView', () => {
    it('shows non-blocking toast banner on mid-climb badge unlock', async () => {
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

      // Click Europe
      const optionButtons = Array.from(container.querySelectorAll('button'));
      const europeBtn = optionButtons.find(b => b.textContent.includes('Europe'));
      expect(europeBtn).toBeTruthy();

      await act(async () => {
        europeBtn.click();
      });

      // No modal popup
      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      // Toast appears
      expect(container.textContent).toContain('Badge Unlocked: Globe Trotter!');
    });
  });

  describe('WordsSessionView', () => {
    it('shows non-blocking toast banner on mid-climb badge unlock', async () => {
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

      // Type missing letter 'C'
      const keyButtons = Array.from(container.querySelectorAll('button'));
      const cBtn = keyButtons.find(b => b.textContent.trim() === 'C');
      expect(cBtn).toBeTruthy();

      await act(async () => {
        cBtn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      });

      // No modal popup
      expect(document.body.querySelector('.z-\\[1000\\]')).toBeNull();
      // Toast appears
      expect(container.textContent).toContain('Badge Unlocked: Word Wizard!');
    });
  });

  describe('KiboBreakOverlay End Screen', () => {
    it('renders newly unlocked badges showcase when badges are unlocked during the block', async () => {
      const mockBadges = [
        {
          id: 'speed_demon',
          title: 'Lightning Climber',
          name: 'Lightning Climber',
          description: 'Completed in record time!',
          icon: '⚡'
        },
        {
          id: 'perfect_ascent',
          title: 'Flawless Ascent',
          name: 'Flawless Ascent',
          description: '12/12 with zero mistakes!',
          icon: '🏔️'
        }
      ];

      await act(async () => {
        root.render(
          <KiboBreakOverlay
            correctCount={12}
            totalCount={12}
            streak={12}
            sparksEarned={50}
            blockRatingGain={25}
            competenceRating={1250}
            newlyUnlockedBadges={mockBadges}
            profileId="test_child"
            activeSubject="math"
            onResumeClimb={vi.fn()}
          />
        );
      });

      expect(container.textContent).toContain('2 New Badges Unlocked!');
      expect(container.textContent).toContain('Lightning Climber');
      expect(container.textContent).toContain('Completed in record time!');
      expect(container.textContent).toContain('Flawless Ascent');
      expect(container.textContent).toContain('12/12 with zero mistakes!');
    });
  });
});

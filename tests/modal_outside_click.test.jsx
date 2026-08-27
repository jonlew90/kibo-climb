import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import NewsModal from '../src/components/NewsModal';
import MockCheckoutModal from '../src/components/MockCheckoutModal';
import DailyStreakIncreasedModal from '../src/components/DailyStreakIncreasedModal';
import StreakSavedModal from '../src/components/StreakSavedModal';
import PerfectMonthProgressModal from '../src/components/PerfectMonthProgressModal';
import ProfileSelectorScreen from '../src/components/ProfileSelectorScreen';

vi.mock('../src/services/storageService', () => {
  const mockStorage = {
    getProfiles: vi.fn(() => [{ id: 'p1', name: 'Kid 1', avatar: 'fox', grade: 'Grade 1' }]),
    getAllProfiles: vi.fn(() => [{ id: 'p1', name: 'Kid 1', avatar: 'fox', grade: 'Grade 1' }]),
    getActiveProfile: vi.fn(() => ({ id: 'p1', name: 'Kid 1', avatar: 'fox', grade: 'Grade 1' })),
    hasFamilyPlan: vi.fn(() => false),
    hasSinglePlan: vi.fn(() => false),
    isItemEquipped: vi.fn(() => false),
    getCurrentStreak: vi.fn(() => 0),
    getProfileStreak: vi.fn(() => 0),
    getStreakShieldsRemaining: vi.fn(() => 0),
    getPerfectMonthProgress: vi.fn(() => ({ count: 0 })),
    getProfileCount: vi.fn(() => 1),
    needsProfileDowngradeSelection: vi.fn(() => false),
    getPrimaryProfileId: vi.fn(() => 'p1'),
    isProfileLocked: vi.fn((profileId) => profileId !== 'p1')
  };
  return {
    default: mockStorage,
    storageService: mockStorage
  };
});

// Mock ConfettiCanvas and audio
vi.mock('../src/components/ConfettiCanvas', () => ({
  default: () => null
}));

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playKeyTap: vi.fn(),
    playIncorrect: vi.fn(), setMuted: vi.fn(), startBGM: vi.fn(), stopBGM: vi.fn(), setMusicMuted: vi.fn()
  }
}));

describe('Modal Outside Click Behavior', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
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

  describe('NewsModal', () => {
    it('calls onClose when clicking outside on the backdrop', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <NewsModal
            isOpen={true}
            onClose={handleClose}
            newsItems={[{ id: '1', title: 'Test News', message: 'Hello' }]}
          />
        );
      });

      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).not.toBeNull();

      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onClose when clicking inside the modal content', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <NewsModal
            isOpen={true}
            onClose={handleClose}
            newsItems={[{ id: '1', title: 'Test News', message: 'Hello' }]}
          />
        );
      });

      const modalContent = container.querySelector('.rounded-3xl');
      expect(modalContent).not.toBeNull();

      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('MockCheckoutModal', () => {
    it('calls onClose when clicking backdrop and not when clicking inside', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <MockCheckoutModal
            isOpen={true}
            onClose={handleClose}
            packageInfo={{ id: 'pkg1', name: 'Test Pkg', price: '$0.99' }}
            onConfirm={vi.fn()}
          />
        );
      });

      const backdrop = container.querySelector('.fixed.inset-0');
      const modalContent = container.querySelector('.rounded-3xl');

      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).not.toHaveBeenCalled();

      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('DailyStreakIncreasedModal', () => {
    it('calls onClose when clicking backdrop and not when clicking inside', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <DailyStreakIncreasedModal
            isOpen={true}
            onClose={handleClose}
            streak={5}
          />
        );
      });

      const backdrop = container.querySelector('.fixed.inset-0');
      const modalContent = container.querySelector('.rounded-3xl');

      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).not.toHaveBeenCalled();

      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('StreakSavedModal', () => {
    it('calls onClose when clicking backdrop and not when clicking inside', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <StreakSavedModal
            isOpen={true}
            onClose={handleClose}
            streak={3}
            remainingShields={1}
          />
        );
      });

      const backdrop = container.querySelector('.fixed.inset-0');
      const modalContent = container.querySelector('.rounded-3xl');

      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).not.toHaveBeenCalled();

      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerfectMonthProgressModal', () => {
    it('calls onClose when clicking backdrop and not when clicking inside', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <PerfectMonthProgressModal
            isOpen={true}
            onClose={handleClose}
            currentMonthStr="2026-08"
            daysPlayedThisMonth={5}
          />
        );
      });

      const backdrop = container.querySelector('.fixed.inset-0');
      const modalContent = container.querySelector('.rounded-3xl');

      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).not.toHaveBeenCalled();

      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProfileSelectorScreen Family Plan Modal', () => {
    it('closes the unlock family plan modal when clicking on the backdrop', () => {
      act(() => {
        root.render(
          <ProfileSelectorScreen
            isOpen={true}
            onClose={vi.fn()}
            onSelectProfile={vi.fn()}
            onOpenParentZone={vi.fn()}
          />
        );
      });

      // Find "Add a climber profile" button that triggers upsell
      const addProfileBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Add a climber profile')
      );
      expect(addProfileBtn).toBeDefined();

      // Click to open upsell modal
      act(() => {
        addProfileBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      // Find backdrop and modal content for upsell modal
      const backdrop = container.querySelector('.bg-slate-900\\/60');
      expect(backdrop).not.toBeNull();
      expect(backdrop.textContent).toContain('Unlock Family Plan');

      const modalContent = backdrop.querySelector('.rounded-3xl');
      expect(modalContent).not.toBeNull();

      // Clicking inside does not close
      act(() => {
        modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(container.querySelector('.bg-slate-900\\/60')).not.toBeNull();

      // Clicking backdrop closes modal
      act(() => {
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(container.querySelector('.bg-slate-900\\/60')).toBeNull();
    });
  });
});

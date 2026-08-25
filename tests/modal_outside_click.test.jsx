import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import NewsModal from '../src/components/NewsModal';
import MockCheckoutModal from '../src/components/MockCheckoutModal';
import DailyStreakIncreasedModal from '../src/components/DailyStreakIncreasedModal';
import StreakSavedModal from '../src/components/StreakSavedModal';
import PerfectMonthProgressModal from '../src/components/PerfectMonthProgressModal';

// Mock ConfettiCanvas and audio
vi.mock('../src/components/ConfettiCanvas', () => ({
  default: () => null
}));

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playKeyTap: vi.fn(),
    playIncorrect: vi.fn()
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
});

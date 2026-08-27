import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useInactivityAutoPause from '../src/hooks/useInactivityAutoPause';

function TestComponent({ isActive, timeoutMs, onAutoPause }) {
  useInactivityAutoPause({ isActive, timeoutMs, onAutoPause });
  return <div id="test-elem">Active: {isActive ? 'yes' : 'no'}</div>;
}

describe('useInactivityAutoPause', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
  });

  it('triggers onAutoPause after timeout when active', () => {
    const onAutoPause = vi.fn();
    act(() => {
      root.render(<TestComponent isActive={true} timeoutMs={10000} onAutoPause={onAutoPause} />);
    });

    expect(onAutoPause).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onAutoPause).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onAutoPause).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onAutoPause when not active', () => {
    const onAutoPause = vi.fn();
    act(() => {
      root.render(<TestComponent isActive={false} timeoutMs={10000} onAutoPause={onAutoPause} />);
    });

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(onAutoPause).not.toHaveBeenCalled();
  });

  it('resets inactivity timer on user interaction', () => {
    const onAutoPause = vi.fn();
    act(() => {
      root.render(<TestComponent isActive={true} timeoutMs={10000} onAutoPause={onAutoPause} />);
    });

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(onAutoPause).not.toHaveBeenCalled();

    // User interaction resets timer
    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onAutoPause).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onAutoPause).toHaveBeenCalledTimes(1);
  });
});

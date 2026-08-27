import { useEffect, useRef } from 'react';

/**
 * Hook to trigger auto-pause when user is inactive during an active climb session.
 * @param {Object} options
 * @param {boolean} options.isActive - Whether the climb session is actively in progress
 * @param {number} [options.timeoutMs=60000] - Inactivity duration before auto-pausing (default: 60s)
 * @param {Function} options.onAutoPause - Callback triggered on inactivity timeout
 */
export function useInactivityAutoPause({ isActive, timeoutMs = 60000, onAutoPause }) {
  const lastActivityRef = useRef(Date.now());
  const hasTriggeredRef = useRef(false);
  const onAutoPauseRef = useRef(onAutoPause);
  onAutoPauseRef.current = onAutoPause;

  useEffect(() => {
    if (!isActive) {
      hasTriggeredRef.current = false;
      return;
    }

    lastActivityRef.current = Date.now();
    hasTriggeredRef.current = false;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      hasTriggeredRef.current = false;
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const interval = setInterval(() => {
      if (!hasTriggeredRef.current && (Date.now() - lastActivityRef.current >= timeoutMs)) {
        hasTriggeredRef.current = true;
        if (onAutoPauseRef.current) {
          onAutoPauseRef.current();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isActive, timeoutMs]);
}

export default useInactivityAutoPause;

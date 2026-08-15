import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { WORKSHOP_ITEMS } from '../utils/itemsCatalog';

const SECRET_CODE = 'kibodev';

export function useDevState(onStateChange) {
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      if (isInput) return;

      const key = e.key.toLowerCase();
      if (key.length !== 1) return; // Only process printable character keys

      // Append key to buffer
      bufferRef.current += key;

      // Keep buffer trimmed to length of SECRET_CODE
      if (bufferRef.current.length > SECRET_CODE.length) {
        bufferRef.current = bufferRef.current.slice(-SECRET_CODE.length);
      }

      // Reset buffer timer after 2s inactivity
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, 2000);

      // Check for secret sequence match
      if (bufferRef.current === SECRET_CODE) {
        setIsDevPanelOpen((prev) => !prev);
        bufferRef.current = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetAllStats = () => {
    localStorage.clear();
    window.location.reload();
  };

  const setRating = (newRating) => {
    const numericRating = Math.max(500, Math.min(3000, Number(newRating) || 1000));
    storageService.saveUserData({
      adaptiveCompetenceRating: numericRating,
      competenceRank: numericRating
    });
    if (onStateChange) onStateChange();
  };

  const adjustSparks = (deltaOrSet) => {
    const currentData = storageService.getUserData('math');
    let newSparks = 0;
    if (deltaOrSet === 'clear') {
      newSparks = 0;
    } else {
      newSparks = Math.max(0, (currentData.sparks || 0) + Number(deltaOrSet));
    }
    storageService.saveUserData({ sparks: newSparks });
    localStorage.setItem('kibo_math_sparks', newSparks.toString());
    if (onStateChange) onStateChange();
  };

  const unlockAllWorkshopItems = () => {
    const allItemIds = (WORKSHOP_ITEMS || []).map((item) => item.id);
    storageService.saveShopState({
      unlockedItems: allItemIds
    });
    if (onStateChange) onStateChange();
  };

  return {
    isDevPanelOpen,
    setIsDevPanelOpen,
    resetAllStats,
    setRating,
    adjustSparks,
    unlockAllWorkshopItems
  };
}

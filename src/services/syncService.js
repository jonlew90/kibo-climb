// Offline Sync Queue & Cloud Replication Service for Kibo Climb
// Manages local offline payload queue and flushes state when network is online

import { storageService } from './storageService';
import { antiCheatService } from './antiCheatService';

const QUEUE_KEY = 'kibo_offline_sync_queue';

function getPendingQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function savePendingQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('syncService: error saving sync queue', e);
  }
}

export const syncService = {
  /**
   * Enqueues a completed climb session payload for cloud sync.
   */
  enqueueSessionRun(sessionPayload) {
    const queue = getPendingQueue();

    // Validate payload against anti-cheat engine before queuing
    const validation = antiCheatService.validateSessionPayload(sessionPayload);
    if (!validation.valid) {
      console.warn('syncService: Rejected invalid session payload', validation.reason);
      return { success: false, reason: validation.reason };
    }

    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      payload: sessionPayload,
      synced: false
    };

    queue.push(item);
    savePendingQueue(queue);

    // Attempt instant flush if online
    if (navigator.onLine) {
      this.flushQueue();
    }

    return { success: true, queuedId: item.id };
  },

  /**
   * Flushes all pending queued session runs to backend storage.
   */
  async flushQueue() {
    const queue = getPendingQueue();
    if (queue.length === 0) return { flushedCount: 0 };

    const remaining = [];
    let flushedCount = 0;

    for (const item of queue) {
      try {
        // Anti-cheat verification on sync
        const check = antiCheatService.validateSessionPayload(item.payload);
        if (check.valid) {
          // Replicate payload into local master profile
          const userData = storageService.getUserData();
          const updatedHistory = [item.payload, ...(userData.sessionHistory || [])];
          storageService.saveUserData({ sessionHistory: updatedHistory });
          flushedCount++;
        } else {
          console.warn('syncService: Rejected payload during queue flush', check.reason);
        }
      } catch (e) {
        remaining.push(item);
      }
    }

    savePendingQueue(remaining);
    return { flushedCount, remainingCount: remaining.length };
  },

  /**
   * Attaches window online listener for seamless background sync.
   */
  initBackgroundSync() {
    window.addEventListener('online', () => {
      console.log('Network status: ONLINE. Flushing pending Kibo Climb sync queue...');
      this.flushQueue();
    });
  }
};

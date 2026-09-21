import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn()
}));

vi.mock('../../src/config/firebase', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'parent_user_123',
      email: 'parent@example.com',
      isAnonymous: false
    }
  },
  functions: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, col, id) => ({ path: `${col}/${id}` })),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP')
}));

import { userSyncService } from '../../src/services/userSyncService.js';
import { storageService } from '../../src/services/storageService.js';

describe('UserSyncService Scheduled Digest Preferences Sync', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('includes parent email and notification settings in pushLocalToCloud payload', async () => {
    const { setDoc } = await import('firebase/firestore');

    storageService.saveNotificationSettings({
      weeklyDigestEnabled: true,
      struggleAlertsEnabled: true,
      productUpdatesEnabled: false
    });
    storageService.setParentAccountEmail('parent@example.com');

    await userSyncService.pushLocalToCloud('parent_user_123');

    expect(setDoc).toHaveBeenCalled();
    const payload = setDoc.mock.calls[0][1];

    expect(payload.email).toBe('parent@example.com');
    expect(payload.notificationSettings).toEqual(expect.objectContaining({
      weeklyDigestEnabled: true,
      struggleAlertsEnabled: true,
      productUpdatesEnabled: false
    }));
  });
});

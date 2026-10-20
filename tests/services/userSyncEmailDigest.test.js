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
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteField: vi.fn(() => 'DELETE_FIELD'),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP')
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: { success: true } })))
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

  it('records deleted profile ID to prevent resurrection and calls cloud delete', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn(() => Promise.resolve({ data: { success: true } }));
    httpsCallable.mockReturnValue(mockCallable);

    await userSyncService.deleteProfileFromCloud('child_profile_to_delete', 'EpicPioneer92');

    const deleted = JSON.parse(localStorage.getItem('kibo_deleted_profile_ids') || '[]');
    expect(deleted).toContain('child_profile_to_delete');
    expect(httpsCallable).toHaveBeenCalled();
    expect(mockCallable).toHaveBeenCalledWith({
      type: 'delete_profile',
      profileId: 'child_profile_to_delete',
      childName: 'EpicPioneer92'
    });
  });
});

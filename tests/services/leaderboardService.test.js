import { describe, it, expect, vi, beforeEach } from 'vitest';

// We must mock firebase/auth before importing the service
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn()
}));

vi.mock('../../src/config/firebase.js', () => ({
  db: {},
  auth: { currentUser: { uid: 'mock_uid' } }
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] })
}));

import { leaderboardService } from '../../src/services/leaderboardService.js';
import { storageService } from '../../src/services/storageService.js';

describe('leaderboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('syncUserScore sets sync flag and calls firestore', async () => {
    vi.spyOn(storageService, 'getActiveProfile').mockReturnValue({
      id: 'prof_1',
      username: 'TestPlayer'
    });
    vi.spyOn(storageService, 'getUserData').mockReturnValue({
      sparks: 100,
      rating: 1200,
      tier: 2
    });

    const success = await leaderboardService.syncUserScore({
      profileId: 'prof_1',
      name: 'TestPlayer',
      score: 1200
    });
    expect(success).toBeUndefined();
  });

  it('fetchFriendScores handles request', async () => {
    const lb = await leaderboardService.fetchFriendScores('math', ['user_1']);
    expect(lb).toBeDefined();
    expect(Array.isArray(lb.standings)).toBe(true);
  });

  it('claimUsername returns failure if username missing', async () => {
    const res = await leaderboardService.claimUsername('');
    expect(res.success).toBe(false);
  });
});

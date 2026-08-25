import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storageService } from '../../src/services/storageService.js';

// Fully mock firebase auth to avoid initialization issues
vi.mock('../../src/config/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn()
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock_timestamp'),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn()
}));
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn()
}));
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}));

// We can import userSyncService after the mocks are ready
let userSyncService;

describe('PII Exposure Prevention', () => {
  let mockStorage = {};

  beforeEach(async () => {
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { mockStorage[key] = val; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });

    // Clear storage cache
    storageService.setActiveProfileId('__reset__');
    mockStorage = {};

    // Initialize a profile with an email for testing sanitization of legacy data
    const legacyProfile = {
      id: 'legacy_prof',
      name: 'Legacy User',
      userData: {
        email: 'test@example.com',
        cloudUid: 'cloud_123',
        isAnonymous: false
      }
    };
    mockStorage['kibo_profiles_data'] = JSON.stringify({
      activeProfileId: 'legacy_prof',
      profiles: {
        'legacy_prof': legacyProfile
      }
    });
    // Trigger internal reload of cache by invoking getActiveProfileId
    storageService.getActiveProfileId();

    const module = await import('../../src/services/userSyncService.js');
    userSyncService = module.userSyncService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('storageService setGlobalAccountLinkedState does not save email', () => {
    storageService.setGlobalAccountLinkedState({
      cloudUid: 'new_uid',
      email: 'new_email@example.com',
      isAnonymous: false,
      displayName: 'New Name'
    });

    const profiles = storageService.getAllProfiles();
    expect(profiles[0].userData.email).toBeUndefined();
    expect(profiles[0].userData.cloudUid).toBe('new_uid');
    expect(profiles[0].userData.displayName).toBe('New Name');
  });

  it('userSyncService pushLocalToCloud strips email from legacy profiles', async () => {
    const { setDoc } = await import('firebase/firestore');
    setDoc.mockClear();

    await userSyncService.pushLocalToCloud('cloud_123');

    expect(setDoc).toHaveBeenCalledTimes(1);

    const payload = setDoc.mock.calls[0][1];

    expect(payload.profiles['legacy_prof']).toBeDefined();
    expect(payload.profiles['legacy_prof'].userData.email).toBeUndefined();
    expect(payload.profiles['legacy_prof'].userData.cloudUid).toBe('cloud_123');
  });
});

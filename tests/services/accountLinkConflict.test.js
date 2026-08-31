import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storageService } from '../../src/services/storageService.js';

// Mock Firebase modules
vi.mock('../../src/config/firebase', () => ({
  auth: { currentUser: { uid: 'test_cloud_uid', isAnonymous: false } },
  db: {}
}));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn()
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock_timestamp'),
  collection: vi.fn()
}));
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn()
}));

describe('Account Link Conflict & Overwrite Mode', () => {
  let mockStorage = {};
  let userSyncService;
  let authService;

  beforeEach(async () => {
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { mockStorage[key] = val; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });

    // Initialize mock profile
    const testProfile = {
      id: 'local_device_prof',
      name: 'Local Climber',
      gradeLevel: 'Grade 3–4',
      userData: {
        adaptiveCompetenceRating: 1250,
        sparks: 500,
        isAnonymous: true
      }
    };
    mockStorage['kibo_profiles_data'] = JSON.stringify({
      activeProfileId: 'local_device_prof',
      profiles: {
        'local_device_prof': testProfile
      }
    });

    const syncModule = await import('../../src/services/userSyncService.js');
    userSyncService = syncModule.userSyncService;

    const authModule = await import('../../src/services/authService.js');
    authService = authModule.authService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pushLocalToCloud with default parameters uses merge: true', async () => {
    const { setDoc } = await import('firebase/firestore');
    setDoc.mockClear();

    await userSyncService.pushLocalToCloud('test_cloud_uid');

    expect(setDoc).toHaveBeenCalledTimes(1);
    const options = setDoc.mock.calls[0][2];
    expect(options).toEqual({ merge: true });
  });

  it('pushLocalToCloud with overwriteEntireDocument = true omits merge: true', async () => {
    const { setDoc } = await import('firebase/firestore');
    setDoc.mockClear();

    await userSyncService.pushLocalToCloud('test_cloud_uid', null, true);

    expect(setDoc).toHaveBeenCalledTimes(1);
    const options = setDoc.mock.calls[0][2];
    expect(options).toBeUndefined();
  });

  it('resolveLinkConflict keep_cloud wipes local profile and sets cloud link', async () => {
    mockStorage['kibo_parent_pin'] = '1234';
    expect(mockStorage['kibo_profiles_data']).toBeDefined();

    const res = await authService.resolveLinkConflict('keep_cloud', {
      uid: 'cloud_user_1',
      email: 'parent@example.com'
    });

    expect(res.success).toBe(true);
    expect(res.reload).toBe(true);
    expect(mockStorage['kibo_parent_pin']).toBeUndefined();
    
    const savedData = JSON.parse(mockStorage['kibo_profiles_data']);
    expect(savedData.profiles['local_device_prof']).toBeUndefined();
    expect(savedData.profiles['default_child'].userData.cloudUid).toBe('cloud_user_1');
  });

  it('resolveLinkConflict overwrite_cloud triggers pushLocalToCloud with overwriteEntireDocument', async () => {
    const pushSpy = vi.spyOn(userSyncService, 'pushLocalToCloud').mockResolvedValue(true);

    const res = await authService.resolveLinkConflict('overwrite_cloud', {
      uid: 'cloud_user_1',
      email: 'parent@example.com'
    });

    expect(res.success).toBe(true);
    expect(pushSpy).toHaveBeenCalledWith('cloud_user_1', null, true);
  });
});

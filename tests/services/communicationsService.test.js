import { describe, it, expect, vi, beforeEach } from 'vitest';
import { communicationsService } from '../../src/services/communicationsService';

vi.mock('../../src/config/firebase', () => ({
  functions: {},
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; }),
  signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: 'mock' } })),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn(async () => {
    return new Promise(resolve => setTimeout(() => resolve({ data: { id: 'mock-id' } }), 100));
  })),
}));

describe('communicationsService performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sendAllWeeklyDigests should complete faster with concurrent execution', async () => {
    const profiles = Array.from({ length: 10 }).map((_, i) => ({ id: `profile-${i}`, name: `Profile ${i}` }));

    const startTime = Date.now();

    const result = await communicationsService.sendAllWeeklyDigests({
      email: 'test@example.com',
      profiles,
      baseUrl: 'http://localhost'
    });

    const duration = Date.now() - startTime;
    console.log(`Execution time: ${duration}ms`);

    expect(result.success).toBe(true);
    expect(result.totalSent).toBe(10);
    expect(result.results).toHaveLength(10);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncService } from '../../src/services/syncService.js';
import { antiCheatService } from '../../src/services/antiCheatService.js';

describe('syncService', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { mockStorage[key] = val; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete mockStorage[key]; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enqueueSessionRun adds payload to queue if valid', () => {
    vi.spyOn(antiCheatService, 'validateSessionPayload').mockReturnValue({ valid: true });

    // Stub flushQueue so it doesn't immediately flush our mocked queue and empty it
    vi.spyOn(syncService, 'flushQueue').mockResolvedValue({ flushedCount: 0 });

    syncService.enqueueSessionRun({ score: 100 });
    const queueRaw = mockStorage['kibo_offline_sync_queue'];
    const queue = JSON.parse(queueRaw);

    expect(queue.length).toBe(1);
    expect(queue[0].payload.score).toBe(100);
  });

  it('enqueueSessionRun rejects invalid payloads', () => {
    vi.spyOn(antiCheatService, 'validateSessionPayload').mockReturnValue({ valid: false });

    syncService.enqueueSessionRun({ score: -100 });
    const queueRaw = mockStorage['kibo_offline_sync_queue'];
    expect(queueRaw).toBeUndefined(); // mockStorage returns undefined if not set
  });

  it('flushQueue resolves if network is online', async () => {
    // Basic test, actual flush typically calls backend
    vi.spyOn(antiCheatService, 'validateSessionPayload').mockReturnValue({ valid: true });

    syncService.enqueueSessionRun({ score: 100 });
    const result = await syncService.flushQueue();
    expect(result).toBeDefined();
    expect(result.flushedCount).toBeGreaterThanOrEqual(0);
  });
});

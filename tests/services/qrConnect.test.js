import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildUniversalFriendUrl,
  buildFriendQrPayload,
  buildParentPairPayload,
  parseQrPayload,
  QR_TYPES
} from '../../src/utils/qrProtocol.js';
import { storageService } from '../../src/services/storageService.js';

describe('QR Code Protocol & Parsing Suite', () => {
  it('builds valid universal friend URLs with and without referrer', () => {
    const urlWithoutRef = buildUniversalFriendUrl('KIBO-1234');
    expect(urlWithoutRef).toContain('?friend=KIBO-1234');

    const urlWithRef = buildUniversalFriendUrl('KIBO-5678', 'user_abc123');
    expect(urlWithRef).toContain('?friend=KIBO-5678');
    expect(urlWithRef).toContain('&ref=user_abc123');
  });

  it('builds internal friend QR string payloads', () => {
    const payload = buildFriendQrPayload('KIBO-9999', 'ref_xyz');
    expect(payload).toBe('kibo:friend:KIBO-9999?ref=ref_xyz');
  });

  it('parses internal friend QR payload correctly', () => {
    const parsed = parseQrPayload('kibo:friend:KIBO-8888?ref=user_777');
    expect(parsed.type).toBe(QR_TYPES.FRIEND);
    expect(parsed.friendCode).toBe('KIBO-8888');
    expect(parsed.referrerUid).toBe('user_777');
  });

  it('parses universal web URL QR payload correctly', () => {
    const parsed = parseQrPayload('https://kibo-climb.web.app/?friend=KIBO-4321&ref=referrer_456');
    expect(parsed.type).toBe(QR_TYPES.FRIEND);
    expect(parsed.friendCode).toBe('KIBO-4321');
    expect(parsed.referrerUid).toBe('referrer_456');
  });

  it('parses direct raw climber codes correctly', () => {
    const parsed = parseQrPayload('KIBO-7842');
    expect(parsed.type).toBe(QR_TYPES.FRIEND);
    expect(parsed.friendCode).toBe('KIBO-7842');
  });

  it('parses parent pairing payloads', () => {
    const payload = buildParentPairPayload('session_token_12345');
    const parsed = parseQrPayload(payload);
    expect(parsed.type).toBe(QR_TYPES.PARENT_PAIR);
    expect(parsed.token).toBe('session_token_12345');
  });

  it('returns unknown type for malformed string', () => {
    const parsed = parseQrPayload('some-random-barcode-text');
    expect(parsed.type).toBe('unknown');
  });
});

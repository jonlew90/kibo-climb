// src/utils/qrProtocol.js
// Standardized URI & payload encoder/decoder for Kibo Climb QR Codes

export const QR_TYPES = {
  FRIEND: 'friend',
  PARENT_PAIR: 'parent_pair',
  REFERRAL: 'referral'
};

/**
 * Resolves the appropriate production origin for QR codes and share links.
 * When running in production / Capacitor or when origin is not localhost, returns the canonical domain.
 */
export function getAppOrigin() {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If running in development on localhost or local IP, use local origin for testing
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return window.location.origin;
    }
    // If running on a deployed domain (kiboclimb.com, kibo-climb.web.app, etc.), return current origin
    if (window.location.origin && !window.location.origin.startsWith('file://') && !window.location.origin.startsWith('capacitor://')) {
      return window.location.origin;
    }
  }
  return 'https://kiboclimb.com';
}

/**
 * Builds a universal web URL for scanning via native device cameras.
 * If opened in browser/PWA, parameters ?friend=CODE and ?ref=UID trigger auto-connect.
 */
export function buildUniversalFriendUrl(climberCode, referrerUid = '') {
  const origin = getAppOrigin();
  const cleanCode = (climberCode || '').trim().toUpperCase();
  const cleanUid = (referrerUid || '').trim();
  
  let url = `${origin}/?friend=${encodeURIComponent(cleanCode)}`;
  if (cleanUid) {
    url += `&ref=${encodeURIComponent(cleanUid)}`;
  }
  return url;
}


/**
 * Builds a compact internal QR string payload:
 * Format: kibo:friend:KIBO-7842?ref=UID
 */
export function buildFriendQrPayload(climberCode, referrerUid = '') {
  const cleanCode = (climberCode || '').trim().toUpperCase();
  const cleanUid = (referrerUid || '').trim();
  return cleanUid
    ? `kibo:friend:${cleanCode}?ref=${cleanUid}`
    : `kibo:friend:${cleanCode}`;
}

/**
 * Builds a parent pairing token payload:
 * Format: kibo:pair:TOKEN_BASE64
 */
export function buildParentPairPayload(token) {
  return `kibo:pair:${token}`;
}

/**
 * Parses any scanned QR string (universal web URL, direct protocol, or raw climber code).
 */
export function parseQrPayload(rawScannedText) {
  if (!rawScannedText || typeof rawScannedText !== 'string') {
    return { type: 'unknown', raw: rawScannedText };
  }

  const text = rawScannedText.trim();

  // 1. Direct Parent Pair Protocol: kibo:pair:TOKEN
  if (text.startsWith('kibo:pair:')) {
    const token = text.replace('kibo:pair:', '').trim();
    return {
      type: QR_TYPES.PARENT_PAIR,
      token,
      raw: text
    };
  }

  // 2. Direct Friend Protocol: kibo:friend:CODE?ref=UID
  if (text.startsWith('kibo:friend:')) {
    const withoutPrefix = text.replace('kibo:friend:', '').trim();
    const [codePart, queryPart] = withoutPrefix.split('?');
    const friendCode = codePart ? codePart.trim().toUpperCase() : '';
    let referrerUid = '';
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      referrerUid = params.get('ref') || '';
    }
    return {
      type: QR_TYPES.FRIEND,
      friendCode,
      referrerUid,
      raw: text
    };
  }

  // 3. Universal Web URL (e.g., https://kibo-climb.web.app/?friend=KIBO-7842&ref=UID)
  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const parsedUrl = new URL(text);
      const friendParam = parsedUrl.searchParams.get('friend') || parsedUrl.searchParams.get('code');
      const refParam = parsedUrl.searchParams.get('ref');
      const pairParam = parsedUrl.searchParams.get('pair');

      if (pairParam) {
        return {
          type: QR_TYPES.PARENT_PAIR,
          token: pairParam,
          raw: text
        };
      }

      if (friendParam) {
        return {
          type: QR_TYPES.FRIEND,
          friendCode: friendParam.trim().toUpperCase(),
          referrerUid: refParam ? refParam.trim() : '',
          raw: text
        };
      }

      if (refParam) {
        return {
          type: QR_TYPES.REFERRAL,
          referrerUid: refParam.trim(),
          raw: text
        };
      }
    } catch (e) {
      // Ignore URL parse error and fall through
    }
  }

  // 4. Raw Climber Code (e.g. KIBO-7842 or KIBO-xxxx)
  if (/^KIBO-[A-Z0-9]{4,8}$/i.test(text)) {
    return {
      type: QR_TYPES.FRIEND,
      friendCode: text.toUpperCase(),
      referrerUid: '',
      raw: text
    };
  }

  return {
    type: 'unknown',
    raw: text
  };
}

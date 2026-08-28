// Relational Parent-Child Schema & COPPA Parent Gate Service for Kibo Climb
// Manages 1-to-Many Parent-Child Data Relational Structure & PIN Protected Route Challenges

import { storageService } from './storageService';

const PARENT_ACCOUNT_KEY = 'kibo_parent_account_schema';
const CHILD_PROFILES_KEY = 'kibo_child_profiles_schema';

/**
 * Initializes default relational Parent Account & Child Profiles structure if not present.
 */
export function initParentChildSchema() {
  let parentAccount;
  let childProfiles = {};

  try {
    const pRaw = localStorage.getItem(PARENT_ACCOUNT_KEY);
    const cRaw = localStorage.getItem(CHILD_PROFILES_KEY);

    if (pRaw) parentAccount = JSON.parse(pRaw);
    if (cRaw) childProfiles = JSON.parse(cRaw);
  } catch (e) {
    console.error('parentChildService: Error parsing relational schema', e);
  }

  if (!parentAccount) {
    const parentId = `parent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const defaultChildId = 'child_default_1';

    parentAccount = {
      id: parentId,
      email: 'parent@kiboclimb.com',
      is_coppa_verified: false,
      coppa_consent: {
        consented: false,
        consentedAt: null,
        method: null,
        version: '2026-08-COPPA',
        revokedAt: null
      },
      createdAt: new Date().toISOString(),
      pin: storageService.getParentSettings().pin || null,
      child_ids: [defaultChildId]
    };

    const activeUser = storageService.getUserData('math');
    const activeShop = storageService.getShopState();

    childProfiles[defaultChildId] = {
      id: defaultChildId,
      parent_id: parentId,
      display_name: 'Kibo Climber',
      avatar_id: 'kibo_mascot_default',
      current_elo: activeUser.adaptiveCompetenceRating || activeUser.competenceRank || 1000,
      tier: activeUser.tier || 1,
      kibo_inventory_json: {
        sparks: activeUser.sparks || 50,
        equippedItems: activeShop.equippedItems || [],
        unlockedItems: activeShop.unlockedItems || []
      },
      trophy_badges_json: {
        unlockedBadges: activeUser.unlockedBadges || [],
        personalRecords: activeUser.personalRecords || {}
      },
      stats_json: {
        totalProblemsSolved: activeUser.totalProblemsSolved || 0,
        streak: activeUser.streak ?? 0,
        sprintHistory: activeUser.sprintHistory || []
      }
    };

    saveParentAccount(parentAccount);
    saveChildProfiles(childProfiles);
  }

  return { parentAccount, childProfiles };
}

function saveParentAccount(acc) {
  try {
    localStorage.setItem(PARENT_ACCOUNT_KEY, JSON.stringify(acc));
  } catch (e) {
    console.error('parentChildService: error saving parent account', e);
  }
}

function saveChildProfiles(profiles) {
  try {
    localStorage.setItem(CHILD_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('parentChildService: error saving child profiles', e);
  }
}

export const parentChildService = {
  /**
   * Returns parent account metadata (Stripe customer ID, COPPA verification, linked children).
   */
  getParentAccount() {
    const { parentAccount } = initParentChildSchema();
    return parentAccount;
  },

  /**
   * Returns all child profiles linked to the parent account.
   */
  getChildProfiles() {
    const { childProfiles } = initParentChildSchema();
    return Object.values(childProfiles);
  },

  /**
   * Adds a new child profile to the parent account (1-to-Many relation).
   */
  createChildProfile(displayName = 'Little Climber', avatarId = 'kibo_mascot_default') {
    const { parentAccount, childProfiles } = initParentChildSchema();
    const newChildId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newChild = {
      id: newChildId,
      parent_id: parentAccount.id,
      display_name: displayName,
      avatar_id: avatarId,
      current_elo: 1000,
      tier: 1,
      kibo_inventory_json: {
        sparks: 50,
        equippedItems: [],
        unlockedItems: []
      },
      trophy_badges_json: {
        unlockedBadges: [],
        personalRecords: {
          fastest12QuestionsTime: null,
          highestCorrectStreak: 0,
          mostPerfectSessions: 0
        }
      },
      stats_json: {
        totalProblemsSolved: 0,
        streak: 0,
        sprintHistory: []
      }
    };

    childProfiles[newChildId] = newChild;
    parentAccount.child_ids.push(newChildId);

    saveParentAccount(parentAccount);
    saveChildProfiles(childProfiles);

    return newChild;
  },

  /**
   * Directly grants Parent Gate verification session (e.g. after successful native biometrics check).
   */
  grantParentGateAccess() {
    storageService.resetFailedAttempts();
    const sessionToken = `parent_gate_grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionStorage.setItem('kibo_parent_gate_session', sessionToken);
    return {
      granted: true,
      timestamp: new Date().toISOString(),
      sessionToken
    };
  },

  /**
   * Parent Gate Verification: Protects payment routes, settings, and dashboards.
   * Supports Custom PIN (non-1234) and Dynamic Challenge validation with rate limiting backoff.
   * @param {string} enteredValue - The PIN or challenge answer entered by the parent.
   * @param {string|null} expectedAnswer - Optional expected answer for dynamic challenge.
   * @returns {Object} { granted: boolean, isLocked?: boolean, remainingSeconds?: number, timestamp: string, sessionToken?: string, reason?: string }
   */
  verifyParentGateChallenge(enteredValue, expectedAnswer = null) {
    // 1. Check rate limit lockout status
    const lockout = storageService.getLockoutStatus();
    if (lockout.isLocked) {
      return {
        granted: false,
        isLocked: true,
        remainingSeconds: lockout.remainingSeconds,
        timestamp: new Date().toISOString(),
        reason: `Gate locked. Try again in ${lockout.remainingSeconds} seconds.`
      };
    }

    // 2. Reject legacy 1234 static PIN explicitly
    if (String(enteredValue).trim() === '1234') {
      const lockRes = storageService.recordFailedAttempt();
      return {
        granted: false,
        isLocked: lockRes.isLocked,
        remainingSeconds: lockRes.remainingSeconds,
        timestamp: new Date().toISOString(),
        reason: 'Default 1234 PIN is deprecated. Please use Face ID/Passcode or Dynamic Challenge.'
      };
    }

    let isSuccess = false;

    // 3. Verify Dynamic Challenge or Custom PIN
    if (expectedAnswer !== null) {
      isSuccess = String(enteredValue).trim() === String(expectedAnswer).trim();
    } else {
      const parentAccount = this.getParentAccount();
      const targetPin = parentAccount.pin || storageService.getParentSettings().pin;
      if (targetPin && targetPin !== '1234') {
        isSuccess = String(enteredValue).trim() === String(targetPin).trim();
      }
    }

    if (isSuccess) {
      return this.grantParentGateAccess();
    }

    // Record failure & return updated status
    const lockRes = storageService.recordFailedAttempt();
    return {
      granted: false,
      isLocked: lockRes.isLocked,
      remainingSeconds: lockRes.remainingSeconds,
      failedCount: lockRes.failedCount,
      timestamp: new Date().toISOString(),
      reason: lockRes.isLocked
        ? '3 failed attempts. Gate locked for 2 minutes.'
        : `Incorrect answer. (${3 - lockRes.failedCount} attempt(s) remaining)`
    };
  },

  /**
   * Checks if an active Parent Gate session is currently verified.
   */
  isParentGateVerified() {
    const token = sessionStorage.getItem('kibo_parent_gate_session');
    return !!token;
  },

  /**
   * Clears the Parent Gate session token.
   */
  lockParentGate() {
    sessionStorage.removeItem('kibo_parent_gate_session');
  },

  /**
   * Retrieves verifiable parental consent status.
   */
  getCOPPAConsentStatus() {
    const parentAccount = this.getParentAccount();
    return parentAccount?.coppa_consent || {
      consented: false,
      consentedAt: null,
      method: null,
      version: '2026-08-COPPA',
      revokedAt: null
    };
  },

  /**
   * Records verifiable parental consent (VPC).
   * @param {'knowledge_challenge' | 'parent_pin' | 'biometric' | 'payment_transaction'} method
   * @param {Object} details
   */
  recordParentalConsent(method = 'knowledge_challenge', details = {}) {
    const { parentAccount } = initParentChildSchema();
    const consentRecord = {
      consented: true,
      consentedAt: new Date().toISOString(),
      method,
      version: '2026-08-COPPA',
      details,
      revokedAt: null
    };
    parentAccount.is_coppa_verified = true;
    parentAccount.coppa_consent = consentRecord;
    saveParentAccount(parentAccount);
    return consentRecord;
  },

  /**
   * Revokes parental consent, terminating child cloud sync and data processing.
   */
  revokeParentalConsent() {
    const { parentAccount } = initParentChildSchema();
    parentAccount.is_coppa_verified = false;
    parentAccount.coppa_consent = {
      consented: false,
      consentedAt: null,
      method: null,
      version: '2026-08-COPPA',
      revokedAt: new Date().toISOString()
    };
    saveParentAccount(parentAccount);
    sessionStorage.removeItem('kibo_parent_gate_session');
    return parentAccount.coppa_consent;
  }
};

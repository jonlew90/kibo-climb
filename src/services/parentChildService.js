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
      stripe_customer_id: 'cus_demo_kibo_climb',
      is_coppa_verified: true,
      createdAt: new Date().toISOString(),
      pin: storageService.getParentSettings().pin || '1234',
      child_ids: [defaultChildId]
    };

    const activeUser = storageService.getUserData();
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
        streak: activeUser.streak || 1,
        sessionHistory: activeUser.sessionHistory || []
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
        streak: 1,
        sessionHistory: []
      }
    };

    childProfiles[newChildId] = newChild;
    parentAccount.child_ids.push(newChildId);

    saveParentAccount(parentAccount);
    saveChildProfiles(childProfiles);

    return newChild;
  },

  /**
   * Parent Gate Challenge Verification: Protects payment routes, settings, and dashboards.
   * @param {string} enteredPin - The 4-digit PIN entered by the parent.
   * @returns {Object} { granted: boolean, timestamp: string, sessionToken?: string, reason?: string }
   */
  verifyParentGateChallenge(enteredPin) {
    const parentAccount = this.getParentAccount();
    const targetPin = parentAccount.pin || storageService.getParentSettings().pin || '1234';

    if (String(enteredPin).trim() === String(targetPin).trim()) {
      const sessionToken = `parent_gate_grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem('kibo_parent_gate_session', sessionToken);

      return {
        granted: true,
        timestamp: new Date().toISOString(),
        sessionToken
      };
    }

    return {
      granted: false,
      timestamp: new Date().toISOString(),
      reason: 'Incorrect Parent Gate PIN'
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
  }
};

import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function checkAndPromptLinkAccount({
  purchasesCount,
  completedClimbs,
  streak,
  rating
}, setMilestoneCallback, showModalCallback) {
  const isAnon = authService.getAuthState().isAnonymous;
  if (!isAnon) return false;

  const userData = storageService.getUserData('math');
  const milestones = userData.promptedLinkMilestones || [];
  const lastPrompted = userData.lastPromptedLinkAt || 0;

  const now = Date.now();
  if (now - lastPrompted < COOLDOWN_MS) {
    return false; // Still in cooldown
  }

  let newMilestone = null;

  // Purchases: 2, then every 5 items (7, 12, 17, 22...)
  if (purchasesCount !== undefined) {
    if (purchasesCount >= 2) {
      if (!milestones.includes('purchases_2') && purchasesCount < 7) {
        newMilestone = { id: 'purchases_2', label: '2 Shop Items Purchased' };
      } else if (purchasesCount >= 7) {
        const nextTarget = 2 + Math.floor((purchasesCount - 2) / 5) * 5; // e.g. 7, 12, 17
        const milestoneId = `purchases_${nextTarget}`;
        if (!milestones.includes(milestoneId)) {
          newMilestone = { id: milestoneId, label: `${nextTarget} Shop Items Purchased` };
        }
      }
    }
  }

  // Climbs: 2, then a geometric scale (e.g. 5, 10, 20, 40, 80...)
  if (!newMilestone && completedClimbs !== undefined) {
    if (completedClimbs >= 2 && !milestones.includes('climbs_2') && completedClimbs < 5) {
      newMilestone = { id: 'climbs_2', label: '2 Climbs Completed' };
    } else if (completedClimbs >= 5) {
      const targets = [5, 10, 20, 40, 80, 160, 320, 640];
      let reachedTarget = null;
      for (const t of targets) {
        if (completedClimbs >= t) {
          reachedTarget = t;
        } else {
          break;
        }
      }
      if (reachedTarget) {
        const milestoneId = `climbs_${reachedTarget}`;
        if (!milestones.includes(milestoneId)) {
          newMilestone = { id: milestoneId, label: `${reachedTarget} Climbs Completed` };
        }
      }
    }
  }

  // Streak: 3, 7, 14, 30, and every 30 days thereafter
  if (!newMilestone && streak !== undefined) {
    const targets = [3, 7, 14, 30];
    let reachedTarget = null;
    for (const t of targets) {
      if (streak >= t) {
        reachedTarget = t;
      }
    }
    // After 30, every 30 days
    if (streak >= 60) {
      reachedTarget = Math.floor(streak / 30) * 30;
    }

    if (reachedTarget) {
      const milestoneId = `streak_${reachedTarget}`;
      if (!milestones.includes(milestoneId)) {
        newMilestone = { id: milestoneId, label: `${reachedTarget} Day Habit Formed` };
      }
    }
  }

  // Rating: 1200, 1500, 1800, 2000, 2200, 2400
  if (!newMilestone && rating !== undefined) {
    const targets = [1200, 1500, 1800, 2000, 2200, 2400];
    let reachedTarget = null;
    for (const t of targets) {
      if (rating >= t) {
        reachedTarget = t;
      }
    }
    if (reachedTarget) {
      const milestoneId = `rating_${reachedTarget}`;
      if (!milestones.includes(milestoneId)) {
        newMilestone = { id: milestoneId, label: `Milestone (Rating ${reachedTarget}+)` };
      }
    }
  }

  if (newMilestone) {
    // We also need to add legacy items to the array to prevent double prompting if they hit the old criteria
    // but haven't got the array yet.
    if (!milestones.includes('purchases_2') && userData.hasPromptedLink_2Purchases) milestones.push('purchases_2');
    if (!milestones.includes('climbs_2') && userData.hasPromptedLink_2Climbs) milestones.push('climbs_2');
    if (!milestones.includes('streak_3') && userData.hasPromptedLink_3DayStreak) milestones.push('streak_3');

    const legacyRating1200 = localStorage.getItem('kibo_prompted_link_1200');
    if (legacyRating1200 && !milestones.includes('rating_1200')) {
        milestones.push('rating_1200');
    }

    // Now if the newMilestone is actually one of the legacy ones we just pushed, abort.
    if (milestones.includes(newMilestone.id)) {
        return false;
    }

    const newMilestonesArray = [...milestones, newMilestone.id];
    storageService.saveUserData({
      promptedLinkMilestones: newMilestonesArray,
      lastPromptedLinkAt: now
    });

    if (setMilestoneCallback) setMilestoneCallback(newMilestone.label);
    if (showModalCallback) showModalCallback(true);
    return true;
  }

  return false;
}

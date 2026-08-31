// Local Web & Device Notification Engine for Kibo Climb (Hybrid Multi-Profile Architecture)
import { storageService } from '../services/storageService';

let reminderTimeouts = {};

export function getNotificationPrefs() {
  return storageService.getNotificationSettings();
}

export function saveNotificationPrefs(prefs) {
  storageService.saveNotificationSettings(prefs);
}

export function getProfileReminderPrefs(profileId) {
  return storageService.getProfileReminderSettings(profileId);
}

export function saveProfileReminderPrefs(profileId, reminderSettings) {
  storageService.saveProfileReminderSettings(profileId, reminderSettings);
  scheduleAllProfileReminders();
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      scheduleAllProfileReminders();
    }
    return permission;
  } catch (e) {
    return 'denied';
  }
}

export function triggerMilestoneNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'kibo-milestone'
    });
  } catch (e) {
    console.error('Notification trigger error', e);
  }
}

export function cancelPendingReminders() {
  Object.values(reminderTimeouts).forEach((id) => {
    if (id) clearTimeout(id);
  });
  reminderTimeouts = {};
}

export function scheduleAllProfileReminders() {
  cancelPendingReminders();

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const profiles = storageService.getAllProfiles();

  profiles.forEach((profile) => {
    const reminderEnabled = profile.dailyReminderEnabled ?? true;
    const timeStr = profile.reminderTime || '17:00';

    if (!reminderEnabled) return;

    const [targetHour, targetMin] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();

    target.setHours(targetHour || 17, targetMin || 0, 0, 0);

    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const delayMs = target.getTime() - now.getTime();
    const childName = profile.name || 'Kibo Climber';

    reminderTimeouts[profile.id] = setTimeout(() => {
      triggerMilestoneNotification(
        `🏔️ ${childName}'s Daily Streak Reminder!`,
        `Keep ${childName}'s learning streak alive! Kibo is waiting for today's climb.`
      );
      // Re-schedule for next day
      scheduleAllProfileReminders();
    }, delayMs);
  });
}

// Sets home screen app icon badge count / notification dot (Web Badging API & Capacitor/Native support)
export async function updateAppBadge(count) {
  try {
    // 1. Native Capacitor Badge Plugin (if available on iOS/Android native wrapper)
    if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Badge) {
      if (count > 0) {
        await window.Capacitor.Plugins.Badge.set({ count });
      } else {
        await window.Capacitor.Plugins.Badge.clear();
      }
      return;
    }

    // 2. Web App Badging API (PWA / Installed Mobile Web App on Android Chrome & iOS Safari 16.4+)
    if (typeof navigator !== 'undefined') {
      if (count > 0 && 'setAppBadge' in navigator) {
        await navigator.setAppBadge(count);
      } else if (count === 0 && 'clearAppBadge' in navigator) {
        await navigator.clearAppBadge();
      }
    }
  } catch (e) {
    // Fail silently if unsupported or restricted
  }
}

// Clears home screen app badge
export async function clearAppBadge() {
  await updateAppBadge(0);
}

// Backwards-compatible single reminder alias
export function scheduleDailyStreakReminder(timeStr = '17:00') {
  const activeProfile = storageService.getActiveProfile();
  if (activeProfile?.id) {
    saveProfileReminderPrefs(activeProfile.id, { dailyReminderEnabled: true, reminderTime: timeStr });
  } else {
    scheduleAllProfileReminders();
  }
}


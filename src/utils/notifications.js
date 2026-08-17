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

// Backwards-compatible single reminder alias
export function scheduleDailyStreakReminder(timeStr = '17:00') {
  const activeProfile = storageService.getActiveProfile();
  if (activeProfile?.id) {
    saveProfileReminderPrefs(activeProfile.id, { dailyReminderEnabled: true, reminderTime: timeStr });
  } else {
    scheduleAllProfileReminders();
  }
}

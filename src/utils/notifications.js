// Local Web & Device Notification Engine for Kibo Math
import { storageService } from '../services/storageService';

let reminderTimeoutId = null;

export function getNotificationPrefs() {
  return storageService.getNotificationSettings();
}

export function saveNotificationPrefs(prefs) {
  storageService.saveNotificationSettings(prefs);
  if (prefs.dailyReminderEnabled) {
    scheduleDailyStreakReminder(prefs.reminderTime);
  } else {
    cancelPendingReminders();
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';

  try {
    const permission = await Notification.requestPermission();
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
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
    reminderTimeoutId = null;
  }
}

export function scheduleDailyStreakReminder(timeStr = '17:00') {
  cancelPendingReminders();

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const [targetHour, targetMin] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();

  target.setHours(targetHour, targetMin, 0, 0);

  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delayMs = target.getTime() - now.getTime();

  reminderTimeoutId = setTimeout(() => {
    triggerMilestoneNotification(
      '🏔️ Kibo Climb Streak Reminder!',
      "Keep your daily math streak alive! Kibo is waiting for today's climb."
    );
    scheduleDailyStreakReminder(timeStr);
  }, delayMs);
}

// Local Web & Device Notification Engine for Kibo Math

let reminderTimeoutId = null;

const DEFAULT_PREFS = {
  dailyReminderEnabled: true,
  reminderTime: '17:00', // 5:00 PM
  weeklyDigestEnabled: true,
  struggleAlertsEnabled: true
};

export function getNotificationPrefs() {
  try {
    const saved = localStorage.getItem('kibo_parent_notif_prefs');
    return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
  } catch (e) {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem('kibo_parent_notif_prefs', JSON.stringify(prefs));
    if (prefs.dailyReminderEnabled) {
      scheduleDailyStreakReminder(prefs.reminderTime);
    } else {
      cancelPendingReminders();
    }
  } catch (e) {
    console.error('Failed to save notification preferences', e);
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

  // If time has already passed today, schedule for tomorrow
  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delayMs = target.getTime() - now.getTime();

  reminderTimeoutId = setTimeout(() => {
    triggerMilestoneNotification(
      '🏔️ Kibo Climb Streak Reminder!',
      "Keep your daily math streak alive! Kibo is waiting for today's climb."
    );
    // Schedule for next day
    scheduleDailyStreakReminder(timeStr);
  }, delayMs);
}

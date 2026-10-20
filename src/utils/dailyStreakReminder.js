/**
 * Daily Streak Reminder Evaluator and OneSignal Push Notification Dispatcher
 */

/**
 * Dispatches a push notification via the OneSignal REST API.
 * Targets users via their authenticated external user ID (Firebase UID) or subscription IDs.
 */
export async function dispatchOneSignalPush({ uids = [], subscriptionIds = [], title, message, url, data = {}, apiKey, appId }) {
  const finalApiKey = apiKey || (typeof process !== 'undefined' ? process.env.ONESIGNAL_REST_API_KEY : undefined);
  const finalAppId = appId || (typeof process !== 'undefined' ? process.env.ONESIGNAL_APP_ID : undefined) || "d192b852-cda6-4a6b-897a-51b3831ab1af";

  if (!finalApiKey) {
    console.warn("[OneSignal Push] Missing ONESIGNAL_REST_API_KEY in environment/secrets. Push skipped.");
    return { success: false, error: "OneSignal REST API Key not configured." };
  }

  const payload = {
    app_id: finalAppId,
    target_channel: "push",
    headings: { en: title },
    contents: { en: message },
    url: url || "https://kiboclimb.com/?action=play&utm_source=push_notification&utm_medium=push&utm_campaign=daily_streak",
    chrome_web_icon: "https://kiboclimb.com/favicon.png",
    firefox_icon: "https://kiboclimb.com/favicon.png",
    small_icon: "ic_stat_onesignal_default",
    large_icon: "https://kiboclimb.com/favicon.png",
    data: {
      ...data,
      sentAt: new Date().toISOString()
    }
  };

  // OneSignal REST API strictly forbids combining include_aliases and include_subscription_ids
  // in the same payload (triggers HTTP 400 Bad Request). They must be sent in separate requests.
  const postNotification = async (targetField) => {
    const finalPayload = {
      ...payload,
      ...targetField
    };
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${finalApiKey}`
      },
      body: JSON.stringify(finalPayload)
    });
    const result = await response.json();
    return { response, result };
  };

  try {
    let lastResponse;
    let lastResult;

    // 1. Try external_id alias targeting if UIDs provided
    if (uids && uids.length > 0) {
      const aliasRes = await postNotification({
        include_aliases: { external_id: uids }
      });
      lastResponse = aliasRes.response;
      lastResult = aliasRes.result;

      if (lastResponse.ok && lastResult.recipients > 0 && (!lastResult.errors || lastResult.errors.length === 0)) {
        return {
          success: true,
          id: lastResult.id,
          recipients: lastResult.recipients
        };
      }
    }

    // 2. If alias delivery had 0 recipients or failed, or no UIDs provided, fallback to direct subscription IDs
    if (subscriptionIds && subscriptionIds.length > 0) {
      const subRes = await postNotification({
        include_subscription_ids: subscriptionIds
      });
      lastResponse = subRes.response;
      lastResult = subRes.result;

      if (lastResponse.ok && (!lastResult.errors || lastResult.errors.length === 0)) {
        return {
          success: true,
          id: lastResult.id,
          recipients: lastResult.recipients || 0
        };
      }
    }

    if (!lastResponse) {
      return { success: false, error: "No target external user IDs or subscription IDs specified." };
    }

    if (!lastResponse.ok || (lastResult.errors && lastResult.errors.length > 0)) {
      console.error("[OneSignal Push Error]:", lastResult);
      return { success: false, error: lastResult.errors ? JSON.stringify(lastResult.errors) : `HTTP ${lastResponse.status}` };
    }

    return {
      success: true,
      id: lastResult?.id,
      recipients: lastResult?.recipients || 0
    };
  } catch (err) {
    console.error("[OneSignal Push Exception]:", err);
    return { success: false, error: err.message || "Failed to dispatch push notification." };
  }
}

/**
 * Evaluates whether a profile should receive a daily practice/streak reminder.
 * Enforces scheduled practice days (never alerts on rest days) and prevents UTC date bleed.
 */
export function evaluateDailyStreakReminder(prof, { now = new Date(), fallbackTimezone = 'America/New_York' } = {}) {
  if (!prof || prof.dailyReminderEnabled === false) {
    return { shouldAlert: false, reason: 'profile_reminders_disabled' };
  }

  const uData = prof?.userData || {};
  const subjects = uData.subjects || {};
  const userTz = uData.lastSprintTimezone || fallbackTimezone;

  let profileDateStr, profileDayOfWeek;
  try {
    profileDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    profileDayOfWeek = new Date(`${profileDateStr}T12:00:00Z`).getUTCDay();
  } catch (e) {
    profileDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: fallbackTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    profileDayOfWeek = new Date(`${profileDateStr}T12:00:00Z`).getUTCDay();
  }

  // Check practice days schedule if set (defaults to 1..5 Mon-Fri)
  const practiceDays = Array.isArray(prof.practiceDays) ? prof.practiceDays : [1, 2, 3, 4, 5];
  const isScheduledPracticeDay = practiceDays.includes(profileDayOfWeek);

  // Scheduled practice days guard: Rest days NEVER break a streak and never trigger daily alarms.
  if (!isScheduledPracticeDay) {
    return { shouldAlert: false, reason: 'not_a_practice_day', profileDayOfWeek };
  }

  // Collect all potential climb dates formatted in the user's local timezone
  const candidateDates = [];
  if (uData.lastSprintDate) candidateDates.push(String(uData.lastSprintDate).slice(0, 10));
  if (uData.lastPlayedDate) candidateDates.push(String(uData.lastPlayedDate).slice(0, 10));

  if (uData.lastSprintTimestamp) {
    try {
      const tsDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: userTz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(uData.lastSprintTimestamp));
      candidateDates.push(tsDateStr);
    } catch (e) {
      candidateDates.push(String(uData.lastSprintTimestamp).slice(0, 10));
    }
  }

  ['math', 'words', 'world', 'coding'].forEach((sub) => {
    const subData = subjects[sub];
    if (subData) {
      if (subData.lastSprintDate) candidateDates.push(String(subData.lastSprintDate).slice(0, 10));
      if (subData.sprintHistory && subData.sprintHistory[0]?.date) {
        candidateDates.push(String(subData.sprintHistory[0].date).slice(0, 10));
      }
      if (subData.lastSprintTimestamp) {
        try {
          const subTsStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(new Date(subData.lastSprintTimestamp));
          candidateDates.push(subTsStr);
        } catch (e) {}
      }
    }
  });

  if (uData.sprintHistory && uData.sprintHistory[0]?.date) {
    candidateDates.push(String(uData.sprintHistory[0].date).slice(0, 10));
  }

  const hasClimbedToday = candidateDates.some(d => d === profileDateStr);
  if (hasClimbedToday) {
    return { shouldAlert: false, reason: 'already_climbed_today', profileDateStr };
  }

  const currentStreak = Number(uData.streak || 0);
  const unclaimedQuests = Number(prof?.unclaimedQuestsCount || 0);

  return {
    shouldAlert: true,
    profileDateStr,
    profileDayOfWeek,
    currentStreak,
    unclaimedQuests,
    name: prof.username || prof.name || 'Kibo Climber'
  };
}

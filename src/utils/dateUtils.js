// Timezone and Travel-Resilient Date & Streak Utilities for Kibo Climb

export const CUTOFF_HOUR = 4; // 4:00 AM cutoff window for late night / jet-lag grace

/**
 * Returns the IANA timezone string for the client environment (e.g., "America/New_York", "Asia/Tokyo")
 */
export const getCurrentTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Converts a Date object or timestamp into the logical Date shifted by cutoffHour.
 * e.g., 2:30 AM on Aug 18th is treated as part of the Aug 17th active practice day.
 */
export const getLogicalDate = (dateInput = new Date(), cutoffHour = CUTOFF_HOUR) => {
  const d = new Date(dateInput);
  d.setHours(d.getHours() - cutoffHour);
  return d;
};

/**
 * Formats a Date object to YYYY-MM-DD string in local time.
 */
export const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns the YYYY-MM-DD string for the current logical day (accounting for the 4:00 AM cutoff).
 */
export const getTodayStr = (cutoffHour = CUTOFF_HOUR) => {
  return formatDateStr(getLogicalDate(new Date(), cutoffHour));
};

/**
 * Returns the YYYY-MM-DD string for the previous logical day.
 */
export const getYesterdayStr = (cutoffHour = CUTOFF_HOUR) => {
  const d = getLogicalDate(new Date(), cutoffHour);
  d.setDate(d.getDate() - 1);
  return formatDateStr(d);
};

/**
 * Determines whether a session occurred within the travel / rolling grace period.
 * If a traveler skips a calendar date due to fast eastward travel or flight schedules,
 * an elapsed time <= maxElapsedHours (default 36h) preserves the streak.
 */
export const isWithinTravelGracePeriod = (lastSessionTimestamp, currentTimestamp = new Date(), maxElapsedHours = 36) => {
  if (!lastSessionTimestamp) return false;
  const lastTime = new Date(lastSessionTimestamp).getTime();
  const currTime = new Date(currentTimestamp).getTime();
  if (isNaN(lastTime) || isNaN(currTime)) return false;

  const diffHours = (currTime - lastTime) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= maxElapsedHours;
};

/**
 * Calculates continuous streak from combined sprint history and scheduled practice days.
 * Resilient to time zone transitions, midnight crossings, and custom weekly schedules.
 */
export const calculateStreakFromHistory = (sprintHistory = [], practiceDays = [1, 2, 3, 4, 5], cutoffHour = CUTOFF_HOUR) => {
  if (!Array.isArray(sprintHistory) || sprintHistory.length === 0) return 0;

  const playedDates = new Set();
  sprintHistory.forEach((item) => {
    if (!item) return;
    if (item.date) {
      playedDates.add(item.date);
    } else if (item.timestamp) {
      const logical = getLogicalDate(new Date(item.timestamp), cutoffHour);
      playedDates.add(formatDateStr(logical));
    }
  });

  if (playedDates.size === 0) return 0;

  let checkDate = getLogicalDate(new Date(), cutoffHour);
  let dateStr = formatDateStr(checkDate);

  // If not played yet today, check if yesterday was played
  if (!playedDates.has(dateStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = formatDateStr(checkDate);
    if (!playedDates.has(dateStr)) {
      return 0;
    }
  }

  let streakCount = 0;
  while (true) {
    const currentStr = formatDateStr(checkDate);
    if (playedDates.has(currentStr)) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const dayIdx = checkDate.getDay();
      if (practiceDays.includes(dayIdx)) {
        // A scheduled practice day was missed
        break;
      } else {
        // Rest day — skip backwards without breaking the streak
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  return streakCount;
};

/**
 * Returns the ISO week string (e.g., "2023-W42") based on UTC time.
 * Weeks start on Monday at 00:00 UTC.
 */
export const getWeekStr = () => {
  const now = new Date();
  // Copy date so don't modify original
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  // Return string of year and week number
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

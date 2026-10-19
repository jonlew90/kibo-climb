import { describe, it, expect } from 'vitest';
import { calculateStreakFromHistory } from '../src/utils/dateUtils';
const { evaluateDailyStreakReminder } = require('../functions/index');

describe('calculateStreakFromHistory - Weekend and Rest Day Resiliency', () => {
  const monToFri = [1, 2, 3, 4, 5];

  // Simulating consecutive climb week:
  // Mon: 2026-10-12
  // Tue: 2026-10-13
  // Wed: 2026-10-14
  // Thu: 2026-10-15
  // Fri: 2026-10-16
  const weekdaySprintHistory = [
    { date: '2026-10-16' },
    { date: '2026-10-15' },
    { date: '2026-10-14' },
    { date: '2026-10-13' },
    { date: '2026-10-12' }
  ];

  it('preserves active streak on Saturday when Saturday is a rest day', () => {
    // Saturday Oct 17, 2026, 12:00 PM
    const saturday = new Date('2026-10-17T12:00:00');
    const streak = calculateStreakFromHistory(weekdaySprintHistory, monToFri, 4, saturday);
    expect(streak).toBe(5);
  });

  it('preserves active streak on Sunday when Sunday is a rest day', () => {
    // Sunday Oct 18, 2026, 17:00 PM (neither Saturday nor Sunday climbed)
    const sunday = new Date('2026-10-18T17:00:00');
    const streak = calculateStreakFromHistory(weekdaySprintHistory, monToFri, 4, sunday);
    expect(streak).toBe(5);
  });

  it('preserves active streak on Monday morning before child practices', () => {
    // Monday Oct 19, 2026, 09:00 AM (Monday not played yet)
    const mondayMorning = new Date('2026-10-19T09:00:00');
    const streak = calculateStreakFromHistory(weekdaySprintHistory, monToFri, 4, mondayMorning);
    expect(streak).toBe(5);
  });

  it('increments streak on Monday after child practices', () => {
    const mondayPlayedHistory = [
      { date: '2026-10-19' },
      ...weekdaySprintHistory
    ];
    // Monday Oct 19, 2026, 16:00 PM
    const mondayAfternoon = new Date('2026-10-19T16:00:00');
    const streak = calculateStreakFromHistory(mondayPlayedHistory, monToFri, 4, mondayAfternoon);
    expect(streak).toBe(6);
  });

  it('returns 0 if the previous scheduled practice day (Friday) was missed', () => {
    const missedFridayHistory = [
      { date: '2026-10-15' }, // Thursday
      { date: '2026-10-14' },
      { date: '2026-10-13' }
    ];
    // Sunday Oct 18, 2026: Friday was a scheduled practice day and was missed!
    const sunday = new Date('2026-10-18T17:00:00');
    const streak = calculateStreakFromHistory(missedFridayHistory, monToFri, 4, sunday);
    expect(streak).toBe(0);
  });

  it('counts bonus climb sessions on rest days (e.g. Saturday)', () => {
    const withSaturdayBonus = [
      { date: '2026-10-17' }, // Saturday bonus climb
      ...weekdaySprintHistory
    ];
    // Sunday Oct 18, 2026
    const sunday = new Date('2026-10-18T12:00:00');
    const streak = calculateStreakFromHistory(withSaturdayBonus, monToFri, 4, sunday);
    expect(streak).toBe(6);
  });

  it('supports custom MWF schedule ([1, 3, 5])', () => {
    const mwfSchedule = [1, 3, 5];
    const mwfHistory = [
      { date: '2026-10-16' }, // Friday
      { date: '2026-10-14' }, // Wednesday
      { date: '2026-10-12' }  // Monday
    ];
    // Tuesday Oct 20: Monday was played, Tuesday is rest day
    const tuesday = new Date('2026-10-20T14:00:00');
    const streak = calculateStreakFromHistory([
      { date: '2026-10-19' }, // Mon
      ...mwfHistory
    ], mwfSchedule, 4, tuesday);
    expect(streak).toBe(4);
  });
});

describe('evaluateDailyStreakReminder - Push Notification Scheduling & Day Filtering', () => {
  it('does NOT alert on Saturday when Saturday is a rest day, even if streak > 0', () => {
    // Saturday at 5:00 PM Eastern Time: 2026-10-17T21:00:00Z
    const saturday5pmET = new Date('2026-10-17T21:00:00Z');

    const profile = {
      name: 'Maya',
      practiceDays: [1, 2, 3, 4, 5], // Mon-Fri
      dailyReminderEnabled: true,
      userData: {
        streak: 5,
        lastSprintDate: '2026-10-16', // Played Friday
        lastSprintTimestamp: '2026-10-16T20:00:00.000Z',
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: saturday5pmET });
    expect(result.shouldAlert).toBe(false);
    expect(result.reason).toBe('not_a_practice_day');
  });

  it('does NOT alert on Sunday when Sunday is a rest day', () => {
    // Sunday at 5:00 PM Eastern Time: 2026-10-18T21:00:00Z
    const sunday5pmET = new Date('2026-10-18T21:00:00Z');

    const profile = {
      name: 'Maya',
      practiceDays: [1, 2, 3, 4, 5],
      dailyReminderEnabled: true,
      userData: {
        streak: 5,
        lastSprintDate: '2026-10-16',
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: sunday5pmET });
    expect(result.shouldAlert).toBe(false);
    expect(result.reason).toBe('not_a_practice_day');
  });

  it('alerts on a scheduled practice day (e.g. Tuesday at 5pm ET) when child has not climbed today', () => {
    // Tuesday at 5:00 PM Eastern Time: 2026-10-20T21:00:00Z
    const tuesday5pmET = new Date('2026-10-20T21:00:00Z');

    const profile = {
      name: 'Maya',
      practiceDays: [1, 2, 3, 4, 5],
      dailyReminderEnabled: true,
      userData: {
        streak: 4,
        lastSprintDate: '2026-10-19', // Played Monday
        lastSprintTimestamp: '2026-10-19T20:00:00.000Z',
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: tuesday5pmET });
    expect(result.shouldAlert).toBe(true);
    expect(result.name).toBe('Maya');
    expect(result.currentStreak).toBe(4);
    expect(result.profileDateStr).toBe('2026-10-20');
  });

  it('does NOT alert on a practice day if child already climbed earlier today', () => {
    // Tuesday at 5:00 PM Eastern Time: 2026-10-20T21:00:00Z
    const tuesday5pmET = new Date('2026-10-20T21:00:00Z');

    const profile = {
      name: 'Maya',
      practiceDays: [1, 2, 3, 4, 5],
      dailyReminderEnabled: true,
      userData: {
        streak: 5,
        lastSprintDate: '2026-10-20', // Climbed today at 3pm!
        lastSprintTimestamp: '2026-10-20T19:00:00.000Z',
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: tuesday5pmET });
    expect(result.shouldAlert).toBe(false);
    expect(result.reason).toBe('already_climbed_today');
  });

  it('prevents UTC date bleed: evening climb at 8pm ET (00:00 UTC next day) does not suppress next day reminder', () => {
    // Child climbed Monday evening at 8:30 PM ET:
    // In UTC, this is 2026-10-20T00:30:00.000Z (Tuesday in UTC)!
    const mondayEveningUtcTimestamp = '2026-10-20T00:30:00.000Z';

    // Now it is Tuesday at 5:00 PM ET (child has NOT climbed on Tuesday yet):
    const tuesday5pmET = new Date('2026-10-20T21:00:00Z');

    const profile = {
      name: 'Liam',
      practiceDays: [1, 2, 3, 4, 5],
      dailyReminderEnabled: true,
      userData: {
        streak: 3,
        lastSprintDate: '2026-10-19', // Monday local date
        lastSprintTimestamp: mondayEveningUtcTimestamp,
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: tuesday5pmET });
    // Must alert on Tuesday because Liam hasn't climbed on Tuesday yet!
    expect(result.shouldAlert).toBe(true);
    expect(result.profileDateStr).toBe('2026-10-20');
  });

  it('does NOT alert when child profile has dailyReminderEnabled: false', () => {
    const monday5pmET = new Date('2026-10-19T21:00:00Z');

    const profile = {
      name: 'Maya',
      practiceDays: [1, 2, 3, 4, 5],
      dailyReminderEnabled: false,
      userData: {
        streak: 3,
        lastSprintDate: '2026-10-16',
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: monday5pmET });
    expect(result.shouldAlert).toBe(false);
    expect(result.reason).toBe('profile_reminders_disabled');
  });

  it('alerts on Saturday if Saturday IS configured in custom practiceDays', () => {
    // Saturday at 5:00 PM ET
    const saturday5pmET = new Date('2026-10-17T21:00:00Z');

    const profile = {
      name: 'Weekend Warrior',
      practiceDays: [0, 6], // Weekend only schedule (Saturday & Sunday)
      dailyReminderEnabled: true,
      userData: {
        streak: 2,
        lastSprintDate: '2026-10-11', // Previous Sunday
        lastSprintTimezone: 'America/New_York'
      }
    };

    const result = evaluateDailyStreakReminder(profile, { now: saturday5pmET });
    expect(result.shouldAlert).toBe(true);
    expect(result.profileDayOfWeek).toBe(6);
  });
});

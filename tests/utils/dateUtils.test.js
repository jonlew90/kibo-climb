import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentTimezone,
  getLogicalDate,
  formatDateStr,
  getTodayStr,
  getYesterdayStr,
  isWithinTravelGracePeriod,
  calculateStreakFromHistory,
  getDaysInMonth,
  getWeekStr
} from '../../src/utils/dateUtils.js';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('getCurrentTimezone returns valid string', () => {
    const tz = getCurrentTimezone();
    expect(typeof tz).toBe('string');
  });

  it('getLogicalDate subtracts cutoff hours', () => {
    const input = new Date('2023-10-10T03:00:00Z');
    const logical = getLogicalDate(input, 4);
    expect(logical.toISOString()).toBe(new Date('2023-10-09T23:00:00Z').toISOString());
  });

  it('formatDateStr formats correctly', () => {
    // Note: uses local time so we need to construct a date with local parts
    const d = new Date(2023, 9, 10); // Oct 10, 2023 local
    expect(formatDateStr(d)).toBe('2023-10-10');
  });

  it('getTodayStr and getYesterdayStr return correct logical dates', () => {
    // Set fixed time: 2023-10-10 12:00:00 local time
    const fixedDate = new Date(2023, 9, 10, 12, 0, 0);
    vi.setSystemTime(fixedDate);

    expect(getTodayStr(4)).toBe('2023-10-10');
    expect(getYesterdayStr(4)).toBe('2023-10-09');

    // Set fixed time before cutoff: 2023-10-10 03:00:00 local time
    const earlyDate = new Date(2023, 9, 10, 3, 0, 0);
    vi.setSystemTime(earlyDate);

    expect(getTodayStr(4)).toBe('2023-10-09');
    expect(getYesterdayStr(4)).toBe('2023-10-08');
  });

  it('isWithinTravelGracePeriod works', () => {
    const d1 = new Date('2023-10-10T10:00:00Z');
    const d2 = new Date('2023-10-11T10:00:00Z'); // 24 hours later
    const d3 = new Date('2023-10-12T10:00:00Z'); // 48 hours later

    expect(isWithinTravelGracePeriod(d1, d2, 36)).toBe(true);
    expect(isWithinTravelGracePeriod(d1, d3, 36)).toBe(false);
    expect(isWithinTravelGracePeriod(null, d2, 36)).toBe(false);
    expect(isWithinTravelGracePeriod('invalid', d2, 36)).toBe(false);
  });

  it('calculateStreakFromHistory correctly calculates streak', () => {
    const fixedDate = new Date(2023, 9, 10, 12, 0, 0); // Tuesday, Oct 10 2023
    vi.setSystemTime(fixedDate);

    // No history
    expect(calculateStreakFromHistory([])).toBe(0);

    // Only today
    expect(calculateStreakFromHistory([{ date: '2023-10-10' }])).toBe(1);

    // Today and yesterday
    expect(calculateStreakFromHistory([{ date: '2023-10-10' }, { date: '2023-10-09' }])).toBe(2);

    // Yesterday but not today (streak maintained)
    expect(calculateStreakFromHistory([{ date: '2023-10-09' }])).toBe(1);

    // Played yesterday and the day before yesterday
    expect(calculateStreakFromHistory([{ date: '2023-10-09' }, { date: '2023-10-08' }])).toBe(2);

    // Gap (missing Oct 8, which is Sunday)
    // Assuming practice days [1,2,3,4,5] (Mon-Fri)
    // Oct 10 is Tue(2), Oct 9 is Mon(1), Oct 8 is Sun(0), Oct 7 is Sat(6), Oct 6 is Fri(5)
    // If they played Oct 10, Oct 9, Oct 6
    expect(calculateStreakFromHistory([
      { date: '2023-10-10' }, // Tue
      { date: '2023-10-09' }, // Mon
      { date: '2023-10-06' }  // Fri
    ], [1, 2, 3, 4, 5])).toBe(3); // Streak jumps over weekend

    // Missing a scheduled practice day (Oct 9, Mon)
    expect(calculateStreakFromHistory([
      { date: '2023-10-10' }, // Tue
      { date: '2023-10-06' }  // Fri
    ], [1, 2, 3, 4, 5])).toBe(1);

    // Using timestamps instead of dates
    const timestampHistory = [
      { timestamp: new Date(2023, 9, 10, 12).toISOString() }
    ];
    expect(calculateStreakFromHistory(timestampHistory)).toBe(1);
  });

  it('getDaysInMonth returns correct days', () => {
    expect(getDaysInMonth(2023, 1)).toBe(28); // Feb 2023
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap year)
    expect(getDaysInMonth(2023, 9)).toBe(31); // Oct 2023
  });

  it('getWeekStr returns correct ISO week', () => {
    // 2023-01-01 was a Sunday, so first Thursday was Jan 5 (Week 1)
    vi.setSystemTime(new Date(Date.UTC(2023, 0, 5, 12, 0, 0)));
    expect(getWeekStr()).toBe('2023-W01');

    // 2023-12-31 was a Sunday, belongs to last week
    vi.setSystemTime(new Date(Date.UTC(2023, 11, 28, 12, 0, 0)));
    expect(getWeekStr()).toBe('2023-W52');
  });
});

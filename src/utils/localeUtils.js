/**
 * International Formatting Utilities for Kibo Climb
 * Leverages native Intl APIs for locale-sensitive numbers, percentages, dates, and times.
 */

import { getCurrentTimezone } from './dateUtils.js';

export function getDefaultLocale() {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

/**
 * Formats a number according to the target or user locale.
 * @param {number} num
 * @param {string} [locale]
 * @param {Intl.NumberFormatOptions} [options]
 */
export function formatNumber(num, locale = getDefaultLocale(), options = {}) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch {
    return String(num);
  }
}

/**
 * Formats a percentage value.
 * @param {number} decimal (e.g. 0.85 for 85%)
 * @param {string} [locale]
 * @param {number} [maxFractionDigits=0]
 */
export function formatPercent(decimal, locale = getDefaultLocale(), maxFractionDigits = 0) {
  if (typeof decimal !== 'number' || isNaN(decimal)) return '0%';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: maxFractionDigits,
    }).format(decimal);
  } catch {
    return `${Math.round(decimal * 100)}%`;
  }
}

/**
 * Formats a date using local timezone and conventions.
 * @param {Date|string|number} dateInput
 * @param {string} [locale]
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDate(dateInput, locale = getDefaultLocale(), options = {}) {
  try {
    const d = new Date(dateInput);
    const defaultOptions = {
      timeZone: getCurrentTimezone(),
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time (e.g. 5:30 PM or 17:30 depending on locale conventions)
 * @param {Date|string|number} dateInput
 * @param {string} [locale]
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatTime(dateInput, locale = getDefaultLocale(), options = {}) {
  try {
    const d = new Date(dateInput);
    const defaultOptions = {
      timeZone: getCurrentTimezone(),
      hour: 'numeric',
      minute: '2-digit',
      ...options,
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return String(dateInput);
  }
}

// US IANA timezones and territories
const US_TIMEZONES = new Set([
  'America/New_York',
  'America/Detroit',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Indiana/Indianapolis',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Vevay',
  'America/Indiana/Tell_City',
  'America/Indiana/Knox',
  'America/Chicago',
  'America/Menominee',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
  'America/Puerto_Rico',
  'Pacific/Guam',
  'Pacific/Saipan',
  'Pacific/Pago_Pago',
  'America/St_Thomas'
]);

/**
 * Determines whether the current client is detected to be within the US.
 * Supports explicit preference override ('enabled' | 'disabled' | 'auto').
 *
 * Detection heuristics:
 * 1. Explicit override ('enabled' -> true, 'disabled' -> false)
 * 2. Client timezone matches known US timezones
 * 3. Client locale indicates US (e.g. en-US, es-US)
 *
 * @param {'auto'|'enabled'|'disabled'|null} [overrideSetting]
 * @returns {boolean}
 */
export function isUSRegion(overrideSetting = 'auto') {
  if (overrideSetting === 'enabled') return true;
  if (overrideSetting === 'disabled') return false;

  try {
    const tz = getCurrentTimezone();
    if (tz && US_TIMEZONES.has(tz)) {
      return true;
    }

    // Secondary fallback: check navigator locale
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      if (/-US$/i.test(lang)) {
        // If language is en-US or es-US and timezone is not explicitly outside America
        if (!tz || tz.startsWith('America/') || tz === 'UTC') {
          return true;
        }
      }
    }
  } catch {
    // Default to true in case of detection error to avoid disrupting existing users
    return true;
  }

  return false;
}


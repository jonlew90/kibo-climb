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

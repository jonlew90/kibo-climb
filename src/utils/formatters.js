// Reusable Pluralization & String Formatting Utility for Kibo Math / Kibo Climb

/**
 * Formats singular vs. plural quantities cleanly.
 * @param {number} count - The numeric quantity
 * @param {string} singular - The singular word (e.g. "Day", "Spark", "Shield", "Problem")
 * @param {string|null} plural - Optional custom plural form (defaults to singular + "s")
 * @param {boolean} includeCount - Whether to include the numeric count in the output string (default: true)
 * @returns {string} - Formatted string (e.g. "1 Day", "4 Days", "1 Spark", "15 Sparks")
 */
export function pluralize(count, singular, plural = null, includeCount = true) {
  const num = typeof count === 'number' && !isNaN(count) ? count : 0;
  const word = num === 1 ? singular : (plural || `${singular}s`);
  return includeCount ? `${num} ${word}` : word;
}

/**
 * Normalizes time strings safely handling variations in formatting.
 * E.g. "230" or "0230" -> "2:30", "02:30" -> "2:30", "2:30 PM" -> "2:30"
 */
export function normalizeTimeAnswer(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();

  // Convert pure digit inputs like "230" or "0230" to "2:30"
  if (/^\d{3,4}$/.test(str)) {
    const mins = str.slice(-2);
    const hours = parseInt(str.slice(0, str.length - 2), 10);
    str = `${hours}:${mins}`;
  }

  // Strip leading zero on hour (e.g., "02:30" -> "2:30")
  str = str.replace(/^0(\d:)/, '$1');

  // Strip AM/PM suffix for pure clock time comparisons if present
  return str.replace(/\s*(am|pm)/gi, '').trim();
}

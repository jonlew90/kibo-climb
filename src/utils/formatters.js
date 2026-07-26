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

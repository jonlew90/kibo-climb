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

/**
 * Normalizes decimal and currency strings so ".45", "0.45", and "$0.45" evaluate identically.
 */
export function normalizeDecimal(val) {
  if (val === null || val === undefined) return '';
  let clean = String(val).replace('$', '').replace('¢', '').trim();
  if (clean.startsWith('.')) {
    clean = '0' + clean;
  }
  return clean;
}

/**
 * Evaluates a fraction or ratio string like "4/16", "1/4", "3/5", or "6:10" to its numeric float value.
 */
export function parseFractionValue(str) {
  if (!str || typeof str !== 'string') return null;
  const cleanStr = str.trim();
  const separator = cleanStr.includes('/') ? '/' : cleanStr.includes(':') ? ':' : null;
  if (!separator) return null;
  const parts = cleanStr.split(separator);
  if (parts.length === 2) {
    const n = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (!isNaN(n) && !isNaN(d) && d !== 0) {
      return n / d;
    }
  }
  return null;
}

/**
 * Normalizes arithmetic operators so "+", "-", "−", "*", "x", "×", "/", "÷" evaluate consistently.
 */
export function normalizeOperator(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str === '+' || str === '=') return '+';
  if (str === '-' || str === '−' || str === '–' || str === '—' || str === '_') return '−';
  if (str === '*' || str === 'x' || str === 'X' || str === '×' || str === '•') return '×';
  if (str === '/' || str === '÷') return '÷';
  return str;
}

/**
 * Formats seconds into human-readable time (e.g., "12m 30s", "45s", "1h 15m").
 * @param {number} totalSeconds - Total time in seconds
 * @returns {string} - Formatted string (e.g. "0m", "45s", "12m", "1h 5m")
 */
export function formatTime(totalSeconds) {
  const sec = typeof totalSeconds === 'number' && !isNaN(totalSeconds) ? Math.round(totalSeconds) : 0;
  if (sec <= 0) return '0m';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = sec % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${remainingSeconds}s`;
}



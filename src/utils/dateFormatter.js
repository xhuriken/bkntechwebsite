/**
 * Formats a YYYY-MM-DD date string to a localized short verbal date representation.
 * @param {string} dateStr The date string to format (e.g. "2026-07-28")
 * @param {string} lang The active language code ('fr' or 'en')
 * @returns {string} The localized date string (e.g. "28 juil. 2026" or "Jul 28, 2026")
 */
export function formatLocaleDate(dateStr, lang) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

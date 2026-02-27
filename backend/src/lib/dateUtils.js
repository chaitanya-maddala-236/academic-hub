/**
 * Extract a 4-digit year from a date string.
 * The Date_of_Publication field in journal/conference/bookchapter tables is stored
 * as DDMMYYYY (e.g. "01012023"). The function handles this format as well as
 * plain year strings.
 *
 * @param {string|null|undefined} dateStr
 * @returns {number|null}
 */
const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/[^0-9]/g, '');
  if (cleaned.length >= 8) return parseInt(cleaned.slice(-4));
  if (/^\d{4}/.test(dateStr)) return parseInt(dateStr.slice(0, 4));
  return null;
};

module.exports = { extractYear };

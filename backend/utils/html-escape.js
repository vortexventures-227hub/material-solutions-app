/**
 * HTML escape utility to prevent XSS in email templates
 * 
 * Usage:
 *   const { escapeHtml } = require('../utils/html-escape');
 *   const safeName = escapeHtml(unsafeName);
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Untrusted string to escape
 * @returns {string} - HTML-safe string
 */
function escapeHtml(str) {
  if (str == null) return '';
  if (typeof str !== 'string') str = String(str);
  return str.replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP[char]);
}

/**
 * Escape an object's string values (shallow)
 * @param {Object} obj - Object with potentially unsafe string values
 * @returns {Object} - New object with escaped values
 */
function escapeHtmlObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const escaped = {};
  for (const [key, value] of Object.entries(obj)) {
    escaped[key] = typeof value === 'string' ? escapeHtml(value) : value;
  }
  return escaped;
}

module.exports = {
  escapeHtml,
  escapeHtmlObject
};

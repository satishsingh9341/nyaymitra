/**
 * Request Validation & Input Sanitization Utilities
 */

/**
 * Validates and sanitizes text inputs (questions, queries).
 * Limits length and strips dangerous control characters.
 */
function sanitizeTextInput(input, maxLength = 2000) {
  if (typeof input !== 'string') return '';
  // Strip control characters except newline and tab
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Validates a document ID string to prevent injection.
 */
function isValidDocumentId(id) {
  if (typeof id !== 'string') return false;
  // Accepts standard alphanumeric and hyphenated UUIDs
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id.trim());
}

/**
 * Sanitizes a filename to protect against directory traversal attacks.
 */
function sanitizeFilename(rawName) {
  if (!rawName || typeof rawName !== 'string') return 'document.txt';
  // Strip directory separators and collapse traversal dots
  const nameOnly = rawName.replace(/[\/\\]/g, '').replace(/\.+/g, '.');
  // Strip leading dots/spaces to prevent hidden files or traversal prefixes
  const safeName = nameOnly.replace(/^[\s.]+/, '').replace(/[^a-zA-Z0-9._\-\s]/g, '').trim();
  return safeName.slice(0, 150) || 'document.txt';
}

module.exports = {
  sanitizeTextInput,
  isValidDocumentId,
  sanitizeFilename,
};

/**
 * utils/fileValidation.js
 *
 * Client-side file validation - runs immediately after a file is picked,
 * before it's ever added to upload state, so a rejected file never even
 * reaches the preview step. The server should validate again
 * independently once real endpoints exist (never trust client-side
 * validation alone) - this is a UX improvement (fail fast, clear
 * message), not a substitute for server-side enforcement.
 */

/**
 * @param {{ size: number, type: string, name: string }} file
 * @param {{ acceptedMimeTypes: string[], maxSizeBytes: number, acceptedExtensionsLabel: string }} typeMeta
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateFile(file, typeMeta) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!typeMeta.acceptedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Please choose a ${typeMeta.acceptedExtensionsLabel} file.`,
    };
  }

  if (file.size > typeMeta.maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum size is ${formatBytes(typeMeta.maxSizeBytes)}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'That file appears to be empty. Please choose another.' };
  }

  return { valid: true, error: null };
}

/**
 * @param {number} bytes
 * @returns {string} e.g. "2.4 MB", "512 KB"
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
/**
 * Pure validator functions. Each returns an error message string, or
 * null when the value is valid. Designed to compose: pass multiple to
 * a field's schema entry via `combine(...)`.
 */

export function required(message = 'This field is required') {
  return (value) => {
    if (value === undefined || value === null) return message;
    if (typeof value === 'string' && value.trim().length === 0) return message;
    return null;
  };
}

export function email(message = 'Enter a valid email address') {
  // ASSUMPTION: matches the pattern LoginScreen.js already uses for email
  // validation — confirm against the real file and swap this regex if it
  // differs, so both screens enforce the exact same rule.
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (value) => {
    if (!value) return null; // pair with required() separately if it's mandatory
    return EMAIL_PATTERN.test(value) ? null : message;
  };
}

export function minLength(n, message = `Must be at least ${n} characters`) {
  return (value) => {
    if (!value) return null;
    return value.length >= n ? null : message;
  };
}

export function pattern(regex, message = 'Invalid format') {
  return (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  };
}

// Pakistani CNIC — XXXXX-XXXXXXX-X, per the Add Intern spec.
export function cnic(message = 'Enter a valid CNIC (XXXXX-XXXXXXX-X)') {
  return pattern(/^\d{5}-\d{7}-\d{1}$/, message);
}

// Cross-field — e.g. confirm-password. `getOtherValue` is a function
// receiving the full values object, so this works before we know the
// other field's current value at schema-definition time.
export function matchField(otherFieldName, message = 'Fields do not match') {
  return (value, allValues) => {
    if (!value) return null;
    return value === allValues?.[otherFieldName] ? null : message;
  };
}

// Runs multiple validators in order, returns the first failure.
export function combine(...validators) {
  return (value, allValues) => {
    for (const validator of validators) {
      const result = validator(value, allValues);
      if (result) return result;
    }
    return null;
  };
}

// ASSUMPTION: LoginScreen.js's password rule is exactly "minimum 8
// characters" per the spec — if it also enforces complexity (a number,
// a symbol, etc.), add that here to match exactly rather than diverging.
export const passwordRule = minLength(8, 'Password must be at least 8 characters');
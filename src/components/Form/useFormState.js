import { useCallback, useState } from 'react';

/**
 * Generic form state hook. UI components (FormField, FormSelect, etc.)
 * stay thin — all state/validation logic lives here.
 *
 * @param {object} initialValues - e.g. { email: '', password: '' }
 * @param {object} validationSchema - { fieldName: (value, allValues) => string|null }
 *   Each validator returns an error message string, or null/undefined if valid.
 *   Receives the full values object as a second arg so cross-field rules
 *   (matchField, e.g. confirm-password) can compare against another field.
 */
export function useFormState(initialValues = {}, validationSchema = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value, allValues) => {
      const validator = validationSchema[name];
      if (!validator) return null;
      return validator(value, allValues) || null;
    },
    [validationSchema],
  );

  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: value };
        // Re-validate live once a field has been touched, so an error
        // clears the moment it's fixed rather than lingering until blur.
        setErrors((prevErrors) => {
          if (!touched[name]) return prevErrors;
          return {
            ...prevErrors,
            [name]: validateField(name, value, nextValues),
          };
        });
        return nextValues;
      });
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, values[name], values),
      }));
    },
    [validateField, values],
  );

  // Validates every field, marks all as touched (so errors actually render),
  // and returns whether the form as a whole is valid. Call this on submit.
  const validate = useCallback(() => {
    const nextErrors = {};
    const nextTouched = {};

    Object.keys(validationSchema).forEach((name) => {
      nextTouched[name] = true;
      nextErrors[name] = validateField(name, values[name], values);
    });

    setErrors(nextErrors);
    setTouched((prev) => ({ ...prev, ...nextTouched }));

    return Object.values(nextErrors).every((err) => !err);
  }, [validateField, validationSchema, values]);

  const reset = useCallback(
    (nextInitialValues = initialValues) => {
      setValues(nextInitialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues],
  );

  // A field is only "in error" for rendering purposes once it's been
  // touched — prevents every field showing red before the user's typed
  // anything, a common and annoying form UX mistake.
  const getFieldError = useCallback(
    (name) => (touched[name] ? errors[name] : null),
    [errors, touched],
  );

  const isValid = Object.keys(validationSchema).every(
    (name) => !validateField(name, values[name], values),
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    getFieldError,
    isValid,
  };
}

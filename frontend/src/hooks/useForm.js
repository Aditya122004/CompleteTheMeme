import { useState, useCallback } from "react";

/**
 * useForm
 *
 * Lightweight form helper. Handles field state, touched tracking,
 * inline validation, and submission.
 *
 * @param {object} initialValues   — { fieldName: defaultValue, ... }
 * @param {function} validate      — (values) => { fieldName: "error msg" } | {}
 * @param {function} onSubmit      — async (values) => void
 *
 * Returns:
 *   values, errors, touched, isSubmitting,
 *   handleChange, handleBlur, handleSubmit, setFieldError, resetForm
 */
export default function useForm(initialValues, validate, onSubmit) {
  const [values,      setValues]      = useState(initialValues);
  const [errors,      setErrors]      = useState({});
  const [touched,     setTouched]     = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change once the user starts fixing it
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validate) {
      const fieldErrors = validate(values);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    // Full validation pass
    const fieldErrors = validate ? validate(values) : {};
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  /** Set a single field error programmatically (e.g. from an API response) */
  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    resetForm,
  };
}
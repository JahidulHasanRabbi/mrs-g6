"use client";

import { useId } from "react";

const BASE_INPUT =
  "w-full px-4 py-2 bg-white/5 border rounded text-white placeholder-gray-500 " +
  "focus:outline-none focus:ring-2 transition-colors";

const stateClasses = (error) =>
  error
    ? "border-[#f04a4a] focus:ring-[#f04a4a]/60"
    : "border-white/10 focus:ring-[#e9af41] focus:border-[#e9af41]/50";

/**
 * Form-field wrapper: label + input + per-field error.
 *
 * Why: checklist #10 — inline validation (don't wait until submit) and
 *      #11 — proper label/id association for screen readers.
 *
 * Use the wrapper for plain text/email/url/number inputs. For selects,
 * textareas, or file inputs, use <FormField.Group> instead and pass your own
 * control as children — you still get the label, error rendering, and ID wiring.
 */
function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  hint,
  autoComplete,
  disabled = false,
  ...inputProps
}) {
  const id = useId();
  return (
    <FormField.Group label={label} id={id} required={required} error={error} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`${BASE_INPUT} ${stateClasses(error)} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        {...inputProps}
      />
    </FormField.Group>
  );
}

/**
 * Layout group for custom controls (select, textarea, file, datetime-local, etc.).
 * Provides the label, hint, and error slot so every field looks identical.
 */
FormField.Group = function FormFieldGroup({ label, id, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-[#f04a4a] ml-0.5" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={id ? `${id}-err` : undefined} className="mt-1.5 text-[12px] text-[#fb6b6b]">
          {error}
        </p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="mt-1.5 text-[12px] text-white/40">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
export { BASE_INPUT, stateClasses };

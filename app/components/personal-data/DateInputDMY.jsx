"use client";

// "2000-05-31" -> "31/05/2000". Split on the string, not new Date(), so timezones can't shift the day.
export function formatDmy(iso) {
  const [y, m, d] = String(iso || "").split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
}

/**
 * Date field that always reads dd/mm/yyyy. A native <input type="date"> draws in the browser's own
 * locale, so the visible text is a read-only input and the real date input sits invisibly over the
 * whole box; a click anywhere on it opens the picker. Renders two siblings and expects a
 * positioned parent, which the overlay fills.
 */
export default function DateInputDMY({ id, value, onChange, disabled = false, className = "", style }) {
  return (
    <>
      <input
        type="text"
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        value={formatDmy(value)}
        placeholder="dd/mm/yyyy"
        disabled={disabled}
        className={className}
        style={style}
      />
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => !disabled && e.currentTarget.showPicker?.()}
        disabled={disabled}
        className={`absolute inset-0 h-full w-full opacity-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      />
    </>
  );
}

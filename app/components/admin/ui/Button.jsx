"use client";

const VARIANT = {
  primary:
    "bg-[#e9af41] text-black hover:bg-[#d19a35] focus-visible:ring-[#e9af41]/60 disabled:hover:bg-[#e9af41]",
  secondary:
    "bg-white/5 text-white border border-white/15 hover:bg-white/10 hover:border-white/25 focus-visible:ring-white/40",
  destructive:
    "bg-transparent text-[#f04a4a] border border-[#f04a4a] hover:bg-[#f04a4a]/10 focus-visible:ring-[#f04a4a]/60",
  success:
    "bg-[#06b800] text-white hover:bg-[#05a000] focus-visible:ring-[#06b800]/60",
  ghost:
    "bg-transparent text-white/80 hover:text-white hover:bg-white/5 focus-visible:ring-white/30",
};

const SIZE = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-lg",
};

function Spinner({ size }) {
  const dim = size === "sm" ? 12 : size === "lg" ? 18 : 14;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      className="animate-spin shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Shared admin button. Use this everywhere instead of one-off styled <button>s.
 *
 * Variants: primary (gold CTA), secondary (outline), destructive (red), success (green), ghost.
 * Sizes:    sm | md (default) | lg — fixed heights on the 8px grid for visual consistency.
 *
 * Props:
 *   variant, size, loading, iconLeft, iconRight, fullWidth, as ("button" | "a"), ...rest
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const base =
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${base} ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={size} /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}

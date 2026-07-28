"use client";

/**
 * Shared gold-gradient section heading rendered OUTSIDE the framed panels
 * (Prize List / Winner / Terms). Gradient comes from the theme skin.
 */
export default function FramedHeading({ gradient, children, className = '' }) {
  return (
    <h2
      className={`text-center text-[19px] uppercase leading-none tracking-[2px] ${className}`}
      style={{
        fontFamily: 'var(--font-acme), sans-serif',
        background: gradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))',
      }}
    >
      {children}
    </h2>
  );
}

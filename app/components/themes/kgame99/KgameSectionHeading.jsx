"use client";

/**
 * Kgame99 section heading — gold-gradient text shown OUTSIDE the ornate panels
 * (Winning Record / Prize List / Winner / Terms). A navy drop-shadow keeps it
 * legible over the light celestial background.
 */
export default function KgameSectionHeading({ children, className = '' }) {
  return (
    <h2
      className={`text-center text-[19px] uppercase leading-none tracking-[2px] ${className}`}
      style={{
        fontFamily: 'var(--font-acme), sans-serif',
        background: 'linear-gradient(180deg, #fff3c4 0%, #f5c451 48%, #dc9d16 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 2px 3px rgba(4,20,48,0.6))',
      }}
    >
      {children}
    </h2>
  );
}

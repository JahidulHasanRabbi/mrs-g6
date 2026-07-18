"use client";

/**
 * Lv918 section heading — gold-gradient text shown OUTSIDE the ornate panels
 * (Winning Record / Prize List / Winner / Terms). Deep gold with a white
 * highlight + rose drop-shadow so it reads on the light-pink background (a
 * navy shadow is invisible there).
 */
export default function Lv918SectionHeading({ children, className = '' }) {
  return (
    <h2
      className={`text-center text-[19px] uppercase leading-none tracking-[2px] ${className}`}
      style={{
        fontFamily: 'var(--font-acme), sans-serif',
        background: 'linear-gradient(180deg, #f3c34e 0%, #d99a14 52%, #a56a0c 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.6)) drop-shadow(0 2px 2px rgba(92,26,58,0.5))',
      }}
    >
      {children}
    </h2>
  );
}

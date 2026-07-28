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
        color: '#3a0818',
        textShadow: '0 1px 0 rgba(255,255,255,0.5), 0 0 8px rgba(255,255,255,0.3)',
      }}
    >
      {children}
    </h2>
  );
}

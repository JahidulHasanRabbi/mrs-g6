"use client";

/**
 * Shared ornate framed panel — renders a theme's `spin.panel` art as the
 * background with a translucent dark scrim + scrolling content inside the
 * frame's safe area. Used behind Winning Record / List / Prize / Winner /
 * Terms on acebet77 / ubetclub / ep369 (the kgame99 / lv918 treatment).
 */
export default function FramedPanel({ skin, height = 300, children, className = '' }) {
  const { frame, insets, scrim, ring } = skin;
  return (
    <div
      className={`relative mx-auto w-full max-w-[360px] ${className}`}
      style={{ height, backgroundImage: `url(${frame})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
    >
      <div
        className="absolute overflow-hidden rounded-[12px]"
        style={{ left: insets.x, right: insets.x, top: insets.top, bottom: insets.bottom, boxShadow: `inset 0 0 0 1px ${ring}` }}
      >
        <div className="absolute inset-0" style={{ background: scrim, backdropFilter: 'blur(3px)' }} />
        <div className="relative h-full overflow-y-auto px-2.5 py-2 [scrollbar-width:thin]">{children}</div>
      </div>
    </div>
  );
}

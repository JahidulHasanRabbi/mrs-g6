"use client";

// Wraps a block whose interior is sized in absolute pixels (e.g. a frame
// composition with absolutely-positioned children at design coordinates).
// The outer caps at designWidth and aspect-ratio reserves the scaled-down
// height; the inner stays at the design pixel size and a CSS container-query
// scale transform shrinks it to fit narrower viewports without changing
// any child coordinates.
export default function FluidFrame({
  designWidth,
  designHeight,
  className = "",
  innerClassName = "",
  children,
}) {
  return (
    <div
      className={`relative mx-auto w-full ${className}`}
      style={{
        maxWidth: designWidth,
        aspectRatio: `${designWidth} / ${designHeight}`,
        containerType: "inline-size",
      }}
    >
      <div
        className={`absolute top-0 left-0 origin-top-left ${innerClassName}`}
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(min(1, calc(100cqi / ${designWidth}px)))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

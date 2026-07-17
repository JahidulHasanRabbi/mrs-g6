"use client";

import { memo } from "react";

function MenuIcon({ src, size = 24, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default memo(MenuIcon);

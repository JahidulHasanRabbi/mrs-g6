"use client";

export default function FullWidthWrapper({ children }) {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 w-[100vw]">
      {children}
    </div>
  );
}

"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Vendor tag ID. The script self-initialises on load — there is no inline
// bootstrap snippet to pair with it.
const CONTENTSQUARE_SRC = "https://t.contentsquare.net/uxa/eccd0597d2f66.js";

/**
 * Contentsquare UX analytics tag — member-facing pages only.
 *
 * Mounted once from the root layout so it covers every member route without
 * each page opting in. The admin panel is excluded: staff sessions aren't
 * member behaviour and would only dilute the data.
 *
 * The admin check mirrors LayoutShell — keep the two in sync.
 *
 * Next only honours the `beforeInteractive` strategy for scripts rendered
 * unconditionally in the root layout, so this uses the default
 * `afterInteractive`. The vendor snippet ships with `defer`, so it was never
 * intended to block first paint either way.
 */
export default function Contentsquare() {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");

  if (isAdminRoute) return null;
  // Dev sessions are not member behaviour — same reason admin is excluded.
  // Vercel previews are production builds, so they still report.
  if (process.env.NODE_ENV !== "production") return null;

  return <Script src={CONTENTSQUARE_SRC} strategy="afterInteractive" />;
}

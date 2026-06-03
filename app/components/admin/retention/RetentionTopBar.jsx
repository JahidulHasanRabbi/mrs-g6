"use client";

// Shared topbar for every /admin/retention/* page.
// The bell and avatar buttons open contextual dropdown panels:
//   • avatar  → Profile settings / Log out
//   • bell    → Notifications list
// Clicking outside or pressing Escape closes whichever panel is open.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogout } from "../../../api/adminApi";
import { tokenStorage } from "../../../api/tokenStorage";

// useLayoutEffect on the server warns; alias to useEffect during SSR.
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ASSETS = "/assets/admin/pic-dashboard";
const BELL_ICON = `${ASSETS}/notification-bell.svg`;
const AVATAR = `${ASSETS}/member-avatar.svg`;

// Hoisted gradient string — avoids re-allocating the literal each render.
const GRADIENT = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";

// ── Notification model ──────────────────────────────────────────────────
// No notification endpoint is defined in the CRM doc yet, so this stays empty.
const ALERT_ICON = "alert";
const USER_ICON = "user";

const NOTIFICATIONS = [];

// ── Visual primitives ───────────────────────────────────────────────────

// Round status dot — solid blue for new notifications, hollow gray for viewed.
function StatusDot({ unread }) {
  return (
    <span
      className={`block h-[10px] w-[10px] shrink-0 rounded-full ${
        unread ? "bg-[#4188ff]" : "border border-white bg-black/[0.08]"
      }`}
    />
  );
}

// Red circle with white exclamation — used for Player / PIC alerts.
function AlertCircleIcon() {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e74c3c] text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="8" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

// Gold-on-cream user silhouette — used for token / PIC info notifications.
function UserBadgeIcon() {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6dda6] text-[#4a4a4a]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" />
      </svg>
    </span>
  );
}

// Single notification row + a hairline divider beneath (except the last item).
function NotificationItem({ item, isLast }) {
  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-[12px]">
        {item.icon === ALERT_ICON ? <AlertCircleIcon /> : <UserBadgeIcon />}
        <div className="flex flex-1 min-w-0 flex-col">
          <div className="flex w-full items-start gap-4">
            <p className="flex-1 min-w-0 truncate text-[14px] font-semibold leading-[21px] tracking-[-1px] text-[#303030]">
              {item.title}
            </p>
            <span className="text-[10px] leading-[15px] text-[#606060] whitespace-nowrap">
              {item.date}
            </span>
            <StatusDot unread={item.unread} />
          </div>
          <p className="truncate text-[12px] font-medium leading-[18px] text-[#4a4a4a]">
            {item.body}
          </p>
        </div>
      </div>
      {!isLast && <div className="mx-3 h-px bg-[#d4d4d4]" />}
    </>
  );
}

// Cream popup card shared between the profile and notification dropdowns.
// `caretRight` controls where the upward-pointing caret sits along the top
// edge — measured in pixels from the right edge of the card.
function PopupCard({ width, caretRight, children }) {
  return (
    <div
      className="absolute right-0 top-[calc(100%+12px)] z-30"
      style={{ width }}
    >
      {/* Caret pointing up to the trigger */}
      <span
        className="absolute -top-[10px] block h-[10px] w-[16px]"
        style={{ right: caretRight }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 10" className="block h-full w-full">
          <polygon points="8,0 16,10 0,10" fill="#fbeed2" />
        </svg>
      </span>
      <div
        className="rounded-[16px] bg-[#fbeed2] p-3"
        style={{
          boxShadow:
            "0 8px 32px -8px rgba(0,0,0,0.16), 0 0 16px -4px rgba(0,0,0,0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Top bar ─────────────────────────────────────────────────────────────

export default function RetentionTopBar({ userName = "Admin", role = "PIC" }) {
  // null | "profile" | "notifications" — only one popup is open at a time.
  const [openMenu, setOpenMenu] = useState(null);
  const rootRef = useRef(null);
  const bellRef = useRef(null);
  const avatarRef = useRef(null);
  // Caret horizontal positions (in px, measured from the popup's right edge).
  // Re-measured whenever the topbar resizes so the arrow always lines up with
  // its trigger, regardless of the topbar's current width.
  const [bellCaretRight, setBellCaretRight] = useState(152);
  const [avatarCaretRight, setAvatarCaretRight] = useState(24);
  const router = useRouter();

  // Measure the bell/avatar centers relative to the topbar's right edge.
  // We subtract 8 (half the 16px caret width) so the caret's center aligns
  // with the trigger's center.
  useIsoLayoutEffect(() => {
    const recompute = () => {
      const root = rootRef.current;
      if (!root) return;
      const rootRight = root.getBoundingClientRect().right;
      if (bellRef.current) {
        const r = bellRef.current.getBoundingClientRect();
        setBellCaretRight(Math.max(8, rootRight - (r.left + r.right) / 2 - 8));
      }
      if (avatarRef.current) {
        const r = avatarRef.current.getBoundingClientRect();
        setAvatarCaretRight(Math.max(8, rootRight - (r.left + r.right) / 2 - 8));
      }
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  // Close the popup when the user clicks outside the topbar or hits Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const toggle = (menu) => () =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const handleLogout = async () => {
    const refreshToken = tokenStorage.getAdminRefreshToken();

    try {
      if (refreshToken) {
        await adminLogout(refreshToken);
      }
    } catch (err) {
      // Local logout should still complete if the server-side token is already expired.
      console.warn("Logout API warning:", err);
    } finally {
      tokenStorage.clearAdminTokens();
      router.push("/admin/login");
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative flex w-full items-center justify-end gap-6 rounded-[12px] pl-2 pr-4 py-2"
      style={{ backgroundImage: GRADIENT }}
    >
      {/* Notifications trigger */}
      <button
        ref={bellRef}
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={openMenu === "notifications"}
        onClick={toggle("notifications")}
        className={`relative flex items-center justify-center rounded-[12px] p-2 transition-colors ${
          openMenu === "notifications" ? "bg-white/5" : "hover:bg-white/5"
        }`}
      >
        <img src={BELL_ICON} alt="" className="h-5 w-4" />
      </button>

      <div className="flex items-center gap-3 border-l border-[#eaad2c] pl-[25px]">
        <div className="flex flex-col items-end text-right">
          <span className="b-4 text-[#eaad2c]">{userName}</span>
          <span className="b-6 text-white">{role}</span>
        </div>
        {/* Profile trigger */}
        <button
          ref={avatarRef}
          type="button"
          aria-label="Profile"
          aria-haspopup="menu"
          aria-expanded={openMenu === "profile"}
          onClick={toggle("profile")}
          className="block h-8 w-8 overflow-hidden rounded-[12px]"
        >
          <img src={AVATAR} alt="" className="h-full w-full object-cover" />
        </button>
      </div>

      {/* Profile dropdown — caret sits above the avatar */}
      {openMenu === "profile" && (
        <PopupCard width={232} caretRight={avatarCaretRight}>
          <ul className="flex flex-col" role="menu">
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpenMenu(null)}
                className="flex w-full items-center rounded-[12px] px-3 py-2 text-left text-[14px] font-semibold leading-[21px] tracking-[-1px] text-[#777] hover:bg-black/5"
              >
                Profile settings
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center rounded-[12px] px-3 py-2 text-left text-[14px] font-semibold leading-[21px] tracking-[-1px] text-[#e74c3c] hover:bg-black/5"
              >
                Log out
              </button>
            </li>
          </ul>
        </PopupCard>
      )}

      {/* Notifications dropdown — caret sits above the bell */}
      {openMenu === "notifications" && (
        <PopupCard width={392} caretRight={bellCaretRight}>
          <div className="flex flex-col gap-3">
            <h3 className="px-3 text-[16px] font-semibold uppercase leading-[24px] tracking-[-1px] text-[#303030]">
              Notifications
            </h3>
            <div className="flex flex-col">
              {NOTIFICATIONS.length === 0 ? (
                <p className="px-3 py-4 text-[12px] font-medium leading-[18px] text-[#4a4a4a]">
                  No notifications.
                </p>
              ) : NOTIFICATIONS.map((item, i) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  isLast={i === NOTIFICATIONS.length - 1}
                />
              ))}
            </div>
          </div>
        </PopupCard>
      )}
    </div>
  );
}

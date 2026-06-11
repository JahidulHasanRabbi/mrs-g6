"use client";

// Shared topbar for every /admin/retention/* page.
// The bell and avatar buttons open contextual dropdown panels:
//   • avatar  → Profile settings / Log out
//   • bell    → Notifications list
// Clicking outside or pressing Escape closes whichever panel is open.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogout } from "../../../api/adminApi";
import { getCrmNotifications, getCrmUserSingle, markCrmNotificationRead, updateCrmUser } from "../../../api/crmApi";
import { tokenStorage } from "../../../api/tokenStorage";

// useLayoutEffect on the server warns; alias to useEffect during SSR.
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ASSETS = "/assets/admin/pic-dashboard";
const BELL_ICON = `${ASSETS}/notification-bell.svg`;
const AVATAR = `${ASSETS}/member-avatar.svg`;

// Hoisted gradient string — avoids re-allocating the literal each render.
const GRADIENT = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";
const GRAD_GOLD = "linear-gradient(90deg, #f2cb7a 0%, #eaad2c 100%)";

// ── Notification model ──────────────────────────────────────────────────
// No notification endpoint is defined in the CRM doc yet, so this stays empty.
const ALERT_ICON = "alert";
const USER_ICON = "user";

function formatNotificationDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function normalizeNotifications(response) {
  const rows = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
  return rows.map((row) => {
    const count = row?.number_of_members ?? row?.count ?? 0;
    return {
      id: row?.uuid || row?.id,
      icon: USER_ICON,
      title: "Member Alert",
      body: `You have ${count} members to follow up today.`,
      date: formatNotificationDate(row?.created),
      unread: true,
    };
  }).filter((item) => item.id);
}

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
function NotificationItem({ item, isLast, onRead }) {
  return (
    <>
      <button
        type="button"
        onClick={() => onRead?.(item)}
        className="flex w-full items-center gap-3 rounded-[12px] p-3 text-left transition hover:bg-black/5"
      >
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
      </button>
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
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

  useEffect(() => {
    if (openMenu !== "notifications") return;
    let cancelled = false;
    setNotificationsLoading(true);
    setNotificationsError("");
    getCrmNotifications()
      .then((res) => {
        if (!cancelled) setNotifications(normalizeNotifications(res));
      })
      .catch((err) => {
        console.error("[retention-topbar] notifications failed", err);
        if (!cancelled) {
          setNotifications([]);
          setNotificationsError("Failed to load notifications.");
        }
      })
      .finally(() => {
        if (!cancelled) setNotificationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openMenu]);

  const handleNotificationRead = async (item) => {
    if (!item?.id) return;
    setNotifications((current) => current.filter((n) => n.id !== item.id));
    try {
      await markCrmNotificationRead(item.id);
    } catch (err) {
      console.error("[retention-topbar] mark notification read failed", err);
    }
  };

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

  const handleProfileSettings = () => {
    setOpenMenu(null);
    setProfileOpen(true);
  };

  return (
    <>
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
                onClick={handleProfileSettings}
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
              {notificationsLoading ? (
                <p className="px-3 py-4 text-[12px] font-medium leading-[18px] text-[#4a4a4a]">
                  Loading notifications...
                </p>
              ) : notificationsError ? (
                <p className="px-3 py-4 text-[12px] font-medium leading-[18px] text-[#e74c3c]">
                  {notificationsError}
                </p>
              ) : notifications.length === 0 ? (
                <p className="px-3 py-4 text-[12px] font-medium leading-[18px] text-[#4a4a4a]">
                  No notifications.
                </p>
              ) : notifications.map((item, i) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  isLast={i === notifications.length - 1}
                  onRead={handleNotificationRead}
                />
              ))}
            </div>
          </div>
        </PopupCard>
      )}
    </div>
    {profileOpen && (
      <ProfileSettingsModal
        fallbackUserName={userName}
        fallbackRole={role}
        onClose={() => setProfileOpen(false)}
      />
    )}
    </>
  );
}

function ProfileSettingsModal({ fallbackUserName, fallbackRole, onClose }) {
  const [profile, setProfile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const storedUuid = tokenStorage.getAdminUuid();
        if (!storedUuid) {
          throw new Error("Current admin id is not available. Please log in again.");
        }

        const user = await getCrmUserSingle(storedUuid);
        tokenStorage.setAdminIdentity({ uuid: user.uuid, username: user.username });
        if (!cancelled) setProfile(user);
      } catch (err) {
        if (!cancelled) setError(extractApiError(err, err?.message || "Failed to load profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profile?.uuid) {
      setError("Current admin id is missing. Please log in again.");
      return;
    }
    if (!password) {
      setError("Enter a new password before saving.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setSaving(true);
    try {
      await updateCrmUser(profile.uuid, {
        password,
        confirm_password: confirmPassword,
      });
      setPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (err) {
      setError(extractApiError(err, "Failed to update password."));
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.full_name || fallbackUserName;
  const displayUsername = profile?.username || tokenStorage.getAdminUsername() || "-";
  const displayRole = profile?.role || fallbackRole || "-";
  const displayStatus = profile?.status || "-";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[720px] rounded-[16px] bg-[#05060a] p-6 shadow-[0_0_3px_0_#dea220] md:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase leading-[18px] text-white/70">
              Profile settings
            </p>
            <h2
              className="bg-clip-text text-[28px] font-bold leading-[36px] text-transparent"
              style={{ backgroundImage: GRAD_GOLD, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
            >
              {displayName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#f2cb7a] text-[#fbeed2] hover:bg-white/5"
            aria-label="Close profile settings"
          >
            <CloseIcon />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f2cb7a]/30 border-t-[#f2cb7a]" />
          </div>
        ) : (
          <>
            <SectionTitle>User Information</SectionTitle>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReadOnlyField label="Username" value={displayUsername} />
              <ReadOnlyField label="Full Name" value={displayName} />
              <ReadOnlyField label="Role" value={displayRole} />
              <ReadOnlyField label="Status" value={displayStatus} />
            </div>

            <SectionTitle>Change Password</SectionTitle>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PasswordField
                label="New Password"
                value={password}
                onChange={setPassword}
                visible={showPassword}
                onToggleVisible={() => setShowPassword((value) => !value)}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                onToggleVisible={() => setShowConfirm((value) => !value)}
              />
            </div>

            {error && <p className="mt-4 text-right text-[13px] text-red-400">{error}</p>}
            {success && <p className="mt-4 text-right text-[13px] text-[#84ebb4]">{success}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110 disabled:opacity-60"
                style={{ backgroundImage: GRAD_GOLD }}
              >
                {saving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3
      className="mb-3 bg-clip-text text-[20px] font-bold leading-[28px] text-transparent"
      style={{ backgroundImage: GRAD_GOLD, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
    >
      {children}
    </h3>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-medium leading-[21px] text-[#f6dda6]">{label}</span>
      <div className="min-h-[44px] rounded-[8px] border border-[#fbeed2]/60 bg-white/[0.03] px-4 py-3 text-[12px] font-medium leading-[18px] text-white/70">
        {value || "-"}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, visible, onToggleVisible }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-medium leading-[21px] text-[#f6dda6]">{label}</label>
      <div className="relative flex min-h-[44px] items-center rounded-[8px] border border-[#fbeed2] px-4 py-3 focus-within:ring-1 focus-within:ring-[#eaad2c]">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-medium leading-[18px] text-white outline-none placeholder:text-white/30"
          placeholder="Enter password"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="ml-3 flex h-4 w-4 shrink-0 items-center justify-center text-[#fbeed2] hover:text-[#eaad2c]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function extractApiError(err, fallback) {
  const data = err?.data;
  if (!data) return fallback;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  if (data.details && typeof data.details === "object") {
    return Object.entries(data.details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join(" | ");
  }
  return fallback;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.4 19.4 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

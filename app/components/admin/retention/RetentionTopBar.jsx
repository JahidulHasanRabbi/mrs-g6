// Shared topbar for every /admin/retention/* page.
// Stateless and hook-free, so it never re-renders on parent state changes.

const ASSETS = "/assets/admin/pic-dashboard";
const BELL_ICON = `${ASSETS}/notification-bell.svg`;
const AVATAR = `${ASSETS}/topbar-avatar.jpg`;

// Hoisted gradient string — avoids re-allocating the literal each render.
const GRADIENT = "linear-gradient(178deg, #141828 0%, #333333 99.7%)";

export default function RetentionTopBar({ userName = "Sarah", role = "PIC" }) {
  return (
    <div
      className="flex w-full items-center justify-end gap-6 rounded-[12px] pl-2 pr-4 py-2"
      style={{ backgroundImage: GRADIENT }}
    >
      <button
        type="button"
        aria-label="Notifications"
        className="flex items-center justify-center rounded-[12px] p-2"
      >
        <img src={BELL_ICON} alt="" className="h-5 w-4" />
      </button>
      <div className="flex items-center gap-3 border-l border-[#eaad2c] pl-[25px]">
        <div className="flex flex-col items-end text-right">
          <span className="b-4 text-[#eaad2c]">{userName}</span>
          <span className="b-6 text-white">{role}</span>
        </div>
        <button
          type="button"
          aria-label="Profile"
          className="block h-8 w-8 overflow-hidden rounded-[12px]"
        >
          <img src={AVATAR} alt="" className="h-full w-full object-cover" />
        </button>
      </div>
    </div>
  );
}

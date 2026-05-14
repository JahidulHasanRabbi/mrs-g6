"use client";

import { useRouter, usePathname } from "next/navigation";
import { ADMIN_NAVIGATION } from "../../config/adminNavigation";

// Individual navigation item component
function NavItem({ label, path, enabled, active, onClick }) {
  return (
    <button
      className={`
        relative w-full text-left px-4 py-3 rounded-lg transition-all
        ${active ? 'bg-[#e8b558] text-white font-bold shadow-[3px_3px_48px_3px_rgba(231,196,87,0.5)]' : ''}
        ${!active && enabled ? 'text-white/70 hover:text-white hover:bg-white/5' : ''}
        ${!enabled ? 'text-white/30 cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      onClick={onClick}
      disabled={!enabled}
      title={!enabled ? 'Coming soon' : ''}
    >
      <span className="text-[18px] tracking-[-0.396px]">
        {label}
      </span>
      {!enabled && (
        <span className="ml-2 text-[12px] text-white/40 italic">
          (Coming soon)
        </span>
      )}
    </button>
  );
}

// Main navigation component
export default function AdminNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (item) => {
    if (item.enabled) {
      router.push(item.path);
    }
  };

  const isActive = (item) => {
    // Exact match for home/dashboard
    if (item.path === '/admin' && pathname === '/admin') {
      return true;
    }
    // For other paths, check if current path starts with item path
    if (item.path !== '/admin' && pathname.startsWith(item.path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="flex flex-col gap-2" role="navigation" aria-label="Admin navigation">
      {ADMIN_NAVIGATION.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          path={item.path}
          enabled={item.enabled}
          active={isActive(item)}
          onClick={() => handleNavigation(item)}
        />
      ))}
    </nav>
  );
}

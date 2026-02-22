import Image from "next/image";
import Link from "next/link";

const NAVIGATION_CARDS = [
  {
    id: "spin-items",
    title: "Spin Items Panel",
    icon: "/assets/admin/spin-items/spin-items.svg",
    href: "/admin/lucky-spin",
    isActive: true,
  },
  {
    id: "prize-settings",
    title: "Prize Settings",
    icon: "/assets/admin/spin-items/prize-settings.svg",
    href: "/admin/lucky-spin/prize-settings",
    isActive: false,
  },
  {
    id: "user-logs",
    title: "User Logs",
    icon: "/assets/admin/spin-items/user-logs.svg",
    href: "/admin/lucky-spin/user-logs",
    isActive: false,
  },
  {
    id: "daily-limits",
    title: "Daily Limits",
    icon: "/assets/admin/spin-items/daily-limits.svg",
    href: "/admin/lucky-spin/daily-limits",
    isActive: false,
  },
];


export default function NavigationCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {NAVIGATION_CARDS.map((card) => (
        <Link key={card.id} href={card.href}>
          <div
            className={`relative flex h-[162px] items-center justify-center gap-4 overflow-hidden rounded-[12px] px-6 transition-all hover:scale-[1.02] ${
              card.isActive
                ? "border border-[#ffff84] bg-gradient-to-br from-[rgba(242,195,107,0)] to-[#dd8f1f] shadow-[0_4px_24px_rgba(221,143,31,0.4)]"
                : "border border-[rgba(255,255,132,0.2)] bg-[rgba(255,255,255,0.1)]"
            }`}
          >
            <div className="relative shrink-0">
              <Image
                src={card.icon}
                alt=""
                width={card.id === "prize-settings" ? 70 : 60}
                height={card.id === "prize-settings" ? 70 : 60}
                className="object-contain"
              />
            </div>
            <h3
              className={`text-2xl font-bold leading-[1.5] font-['Times_New_Roman'] ${
                card.isActive ? "text-white" : "text-white"
              }`}
            >
              {card.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

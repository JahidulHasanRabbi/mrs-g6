"use client";

import { useEffect, useState } from "react";
import FramedPanel from "./FramedPanel";
import { getWinningList } from "@/app/api/memberApi";

function maskUsername(name) {
  if (!name) return "";
  if (name.includes("*")) return name;
  if (name.length <= 2) return `${name[0]}*`;
  if (name.length <= 4) return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
  return `${name.slice(0, 2)}${"*".repeat(name.length - 4)}${name.slice(-2)}`;
}

function formatDate(value) {
  return new Date(value || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Shared Lucky-Spin winning panel on the theme's ornate frame. `variant`
 * "record" self-polls the global winner feed; "list" shows the player's
 * session wins passed via `rows`.
 */
export default function FramedWinningPanel({ skin, variant = "record", rows = [] }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (variant !== "record") return undefined;
    let cancelled = false;
    const fetchWinnings = async () => {
      try {
        const data = await getWinningList();
        if (cancelled || !Array.isArray(data)) return;
        setRecords(data.map((it) => ({ date: formatDate(it.datetime_obtained), name: maskUsername(it.display_name), reward: it.prize_name })));
      } catch (error) {
        console.error("Failed to fetch winning list:", error);
      }
    };
    fetchWinnings();
    const interval = setInterval(fetchWinnings, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [variant]);

  const items = variant === "record" ? records : rows.map((r) => ({ date: r.date, reward: r.reward, name: null }));

  return (
    <FramedPanel skin={skin} height={320}>
      {items.length === 0 ? (
        <p className="pt-2 text-[13px]" style={{ color: skin.c.empty, fontFamily: "var(--font-rubik), sans-serif" }}>
          {variant === "record" ? "No winners yet." : "You haven't won anything yet — spin to play!"}
        </p>
      ) : (
        items.map((item, i) => (
          <div key={`${item.date}-${item.name}-${item.reward}-${i}`} className="border-l border-[rgba(255,215,120,0.5)] py-1.5 pl-3">
            <p className="text-[10px] leading-[15px]" style={{ color: skin.c.date, fontFamily: "var(--font-rubik), sans-serif" }}>{item.date}</p>
            {item.name != null && (
              <p className="text-[15px] leading-6" style={{ color: skin.c.name, fontFamily: "var(--font-acme), sans-serif" }}>{item.name}</p>
            )}
            <p className="truncate text-[15px] leading-6" style={{ color: skin.c.reward, fontFamily: "var(--font-acme), sans-serif" }}>{item.reward}</p>
          </div>
        ))
      )}
    </FramedPanel>
  );
}

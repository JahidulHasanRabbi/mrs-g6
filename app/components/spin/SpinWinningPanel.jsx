"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getWinningList } from "@/app/api/memberApi";

// Mask all but the first/last couple of characters — mirrors the default
// portal's WinningList masking (app/components/spin/WinningList.jsx) so the
// themed feed reads identically. Kept local because that component can't be
// reused here (it's baked onto a light parchment background).
function maskUsername(name) {
  if (!name) return "";
  if (name.includes("*")) return name; // Already masked by backend
  if (name.length <= 2) return `${name[0]}*`;
  if (name.length <= 4) return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
  return `${name.slice(0, 2)}${"*".repeat(name.length - 4)}${name.slice(-2)}`;
}

function formatDate(value) {
  const dt = new Date(value || Date.now());
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Row({ date, name, reward, index }) {
  return (
    <motion.div
      className="flex items-center justify-between gap-3 border-l border-[#c3a813] pl-[13px] pr-3 py-2.5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.3 }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-[15px] text-[#999077]" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {date}
        </p>
        {name != null && (
          <p className="text-[15px] leading-6 text-[#ffe16d]" style={{ fontFamily: "var(--font-acme), sans-serif" }}>
            {name}
          </p>
        )}
        <p className="truncate text-[15px] leading-6 text-[#ffb77d]" style={{ fontFamily: "var(--font-acme), sans-serif" }}>
          {reward}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Theme-agnostic dark-glass winning panel for the themed Lucky Spin pages.
 * Uses the same visual language as the Smash Egg WinnerList (translucent
 * `rgba(35,31,20,0.7)` glass + cream/gold text) so it reads on any of the
 * dark theme backgrounds, unlike the default portal's parchment-backed
 * WinningList / UserWinningList.
 *
 * - `variant="record"`: the global winner feed. Self-polls getWinningList()
 *   every 30s and shows date + masked name + reward.
 * - `variant="list"`: the player's own session winnings, fed via `rows`
 *   (`[{ date, reward }]`), date + reward only.
 */
export default function SpinWinningPanel({ variant = "record", rows = [], title }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (variant !== "record") return undefined;
    let cancelled = false;

    const fetchWinnings = async () => {
      try {
        const data = await getWinningList();
        if (cancelled || !Array.isArray(data)) return;
        setRecords(
          data.map((item) => ({
            date: formatDate(item.datetime_obtained),
            name: maskUsername(item.display_name),
            reward: item.prize_name,
          }))
        );
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

  const items =
    variant === "record"
      ? records
      : rows.map((r) => ({ date: r.date, reward: r.reward, name: null }));

  const heading = title || (variant === "record" ? "WINNING RECORD" : "WINNING LIST");

  return (
    <div
      className="relative mx-auto w-[358px] max-w-full overflow-hidden rounded-xl border border-[rgba(255,246,223,0.2)] p-6"
      style={{ boxShadow: "0 0 20px rgba(233,196,0,0.1), inset 0 0 15px rgba(233,196,0,0.05)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          backgroundColor: "rgba(35,31,20,0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <h2
          className="text-xl uppercase leading-[30px] tracking-[2px] text-[#fff6df]"
          style={{ fontFamily: "var(--font-acme), sans-serif" }}
        >
          {heading}
        </h2>

        <div className="scrollbar-smash-egg flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="text-sm text-[#d0c6ab]" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {variant === "record" ? "No winners yet." : "You haven't won anything yet — spin to play!"}
            </p>
          ) : (
            items.map((item, i) => (
              <Row key={`${item.date}-${item.name}-${item.reward}-${i}`} index={i} {...item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

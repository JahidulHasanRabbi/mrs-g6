"use client";

import { GoldText } from "./KrUi";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";

const DAYS = [1, 2, 3, 4, 5, 6, 7];

/** The meter shows one week; a longer streak reads as the week it's in. */
export function streakWeek(streak) {
  return {
    week: Math.floor(Math.max(streak - 1, 0) / 7) + 1,
    inWeek: streak === 0 ? 0 : ((streak - 1) % 7) + 1,
  };
}

/** Streak meter (Figma 891:9565 / 854:2867); the caller supplies the streak. */
export default function KrCheckinStreakMeter({ streak }) {
  const { week, inWeek } = streakWeek(streak);

  return (
    <div
      className="flex min-h-[120px] w-full flex-col gap-[14px] rounded-[16px] p-4"
      style={{
        background: "rgba(0,61,137,0.5)",
        border: "1.5px solid #fff066",
        boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
        fontFamily: KR_FONT,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-[rgba(255,174,0,0.14)] p-[6px] shadow-[0_0_8px_rgba(255,153,0,0.25)]">
            <img src={KR_ASSETS.ui.iconFlame} alt="" className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <p className="text-[18px] font-extrabold uppercase leading-[1.2] text-white">{streak} Day Streak</p>
            <p className="text-[11px] leading-[1.2] text-[rgba(165,196,255,0.7)]">
              {streak > 0 ? "Log in tomorrow to keep it burning!" : "Check in today to start your streak!"}
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center self-center rounded-[6px] border border-[#fff066] bg-[rgba(255,174,0,0.1)] px-2 py-1 leading-none">
          <GoldText className="text-[10px] font-bold uppercase">Week {week}</GoldText>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-[6px]">
          {DAYS.map((d) =>
            d <= inWeek ? (
              <span
                key={d}
                className="h-3 flex-1 rounded-[6px]"
                style={{
                  background: KR_GRADIENTS.gold,
                  boxShadow: "0 0 6px rgba(245,158,11,0.4), inset 0 1px 2px rgba(255,255,255,0.25)",
                }}
              />
            ) : (
              <span
                key={d}
                className="h-3 flex-1 rounded-[6px] border"
                style={
                  d === 7
                    ? { background: "rgba(255,174,0,0.3)", borderColor: "rgba(255,174,0,0.5)" }
                    : { background: "rgba(0,61,137,0.2)", borderColor: "rgba(249,208,99,0.75)" }
                }
              />
            )
          )}
        </div>
        <div className="flex gap-[6px]">
          {DAYS.map((d) => (
            <span
              key={d}
              className={`flex-1 whitespace-nowrap text-center text-[9px] uppercase ${d === inWeek ? "font-bold" : "font-medium"}`}
              style={{
                color: d === inWeek ? "#f59e0b" : d === 7 ? "rgba(249,208,99,0.85)" : "rgba(165,196,255,0.5)",
              }}
            >
              {d === 7 ? "★ Bonus" : `Day ${d}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

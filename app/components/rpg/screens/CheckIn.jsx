"use client";

// Daily Check-In screen (Figma 2026:3862): the 7-day week strip (checked /
// today / upcoming, day-3 double-BP badge, day-7 weekly prize card), the
// CHECK IN CTA, and the check-in record list.

import { useEffect, useState } from "react";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta, ProgressBar } from "../primitives";
import NoticeModal from "../NoticeModal";

// Project-wide date format: dd/mm/yyyy hh:mm AM|PM (en-GB).
function formatRecordDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB");
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
  return `${date} ${time}`;
}

function DayCard({ day, wide = false }) {
  const state = day.checked ? "checked" : day.isToday ? "today" : "future";
  const border =
    state === "checked" ? "rgba(47,230,200,0.65)" : state === "today" ? RPG_COLORS.gold : "rgba(139,92,246,0.3)";
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[6px] rounded-[14px] border px-[6px] py-[12px] ${wide ? "col-span-2" : ""}`}
      style={{
        borderColor: border,
        borderWidth: state === "today" ? 2 : 1,
        background: state === "today" ? "rgba(255,201,77,0.06)" : "rgba(8,12,24,0.55)",
        opacity: state === "future" && !day.weeklyPrize ? 0.62 : 1,
        boxShadow: state === "today" ? "0 0 18px rgba(255,201,77,0.25)" : "none",
      }}
    >
      <span className="text-[10px] font-bold tracking-[1.5px]" style={{ color: state === "today" ? RPG_COLORS.gold : RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
        {day.weeklyPrize ? `DAY ${day.day} · WEEKLY PRIZE` : state === "today" ? `DAY ${day.day} · TODAY` : `DAY ${day.day}`}
      </span>
      {day.weeklyPrize ? (
        <>
          <img src={RPG_IMAGES.chest} alt="" className="h-[26px] w-auto" />
          <span className="text-center text-[8px] font-bold tracking-[1px]" style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.display }}>
            MYSTERY BOX + {day.weeklyPrize.tokens} TOKENS
          </span>
        </>
      ) : day.checked ? (
        <>
          <span className="text-[22px] font-bold" style={{ color: RPG_COLORS.cyan }}>✓</span>
          <span className="text-[8px] tracking-[0.5px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            +{day.tokens} T · +{day.bp} BP
          </span>
        </>
      ) : (
        <>
          <span
            className="inline-block size-[22px] rounded-full"
            style={{
              background: state === "today" ? RPG_GRADIENTS.coin : "radial-gradient(circle at 35% 30%, #d8d2c0 0%, #a9a08a 70%)",
              opacity: state === "today" ? 1 : 0.55,
            }}
          />
          <span className="text-[8px] tracking-[0.5px]" style={{ color: state === "today" ? RPG_COLORS.gold : RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            {day.double && state === "today" ? "×2 BP BONUS" : `+${day.tokens} T · +${day.bp} BP`}
          </span>
        </>
      )}
    </div>
  );
}

export default function CheckIn({ onProfileUpdate, onNavigate }) {
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [showRecord, setShowRecord] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    rpgApi.getCheckInStatus().then(setData).catch(() => {});
  }, []);

  const handleCheckIn = async () => {
    if (busy || !data || data.todayChecked) return;
    setBusy(true);
    try {
      const result = await rpgApi.checkIn();
      setData(result);
      onProfileUpdate(result.profile);
      setNotice({
        title: "CHECKED IN!",
        message: `+${result.reward.tokens} Token${result.reward.tokens > 1 ? "s" : ""} · +${result.reward.bp} BP${result.reward.mysteryBox ? " · Weekly Mystery Box earned!" : ""}`,
        boxId: result.reward.mysteryBox,
      });
    } catch (err) {
      setNotice({ title: "OOPS", message: err?.message || "Could not check in." });
    } finally {
      setBusy(false);
    }
  };

  const days = data?.days || [];

  return (
    <div className="flex w-full flex-1 flex-col px-[18px]">
      <h2 className="pt-[22px] text-[26px] font-bold tracking-[5px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display, textShadow: "0 0 24px rgba(124,77,255,0.8)" }}>
        DAILY CHECK-IN
      </h2>
      <p className="mt-[2px] text-[13px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
        Check in 7 days in a row · Day 3 pays ×2 BP
      </p>

      <div className="mt-[16px] flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[2px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
          WEEK PROGRESS
        </span>
        <span className="text-[12px] font-bold" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.number }}>
          {data ? `${data.checkedCount} / 7` : ""}
        </span>
      </div>
      <div className="mt-[6px]">
        <ProgressBar pct={data ? (data.checkedCount / 7) * 100 : 0} gradient={RPG_GRADIENTS.cta} height={6} />
      </div>

      {/* Day grid: 4 cards, then 2 + the wide day-7 card */}
      <div className="mt-[14px] grid grid-cols-4 gap-[10px]">
        {days.slice(0, 4).map((d) => (
          <DayCard key={d.day} day={d} />
        ))}
        {days.slice(4, 6).map((d) => (
          <DayCard key={d.day} day={d} />
        ))}
        {days.slice(6, 7).map((d) => (
          <DayCard key={d.day} day={d} wide />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowRecord(true)}
        className="mt-[16px] text-center text-[13px] font-semibold underline underline-offset-4"
        style={{ color: RPG_COLORS.cyan, fontFamily: RPG_FONTS.display }}
      >
        View check-in record
      </button>

      <div className="mt-auto w-full pb-[6px] pt-[18px]">
        <GoldCta onClick={handleCheckIn} disabled={busy || !data || data.todayChecked}>
          {!data
            ? "..."
            : data.todayChecked
              ? "CHECKED IN TODAY ✓"
              : busy
                ? "CHECKING IN..."
                : `CHECK IN${data.todayDouble ? " — ×2 BP TODAY" : ""}`}
        </GoldCta>
      </div>

      {/* Record modal */}
      {showRecord && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm" onClick={() => setShowRecord(false)}>
          <div
            className="max-h-[70vh] w-full max-w-[340px] overflow-y-auto rounded-[18px] border p-[20px]"
            style={{ background: "rgba(10,14,24,0.97)", borderColor: RPG_COLORS.violetBorder }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pb-[12px] text-center text-[15px] font-bold tracking-[2px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
              CHECK-IN RECORD
            </p>
            {data?.history?.length ? (
              data.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between border-b py-[9px]" style={{ borderColor: "rgba(139,92,246,0.18)" }}>
                  <span className="text-[11px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
                    {formatRecordDate(h.date)}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.display }}>
                    +{h.tokens} T · +{h.bp} BP{h.mysteryBox ? " · BOX" : ""}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-[14px] text-center text-[12px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
                No check-ins yet — start your streak today!
              </p>
            )}
          </div>
        </div>
      )}

      <NoticeModal
        open={Boolean(notice)}
        title={notice?.title || ""}
        message={notice?.message}
        confirmLabel={notice?.boxId ? "OPEN MYSTERY BOX" : "OK"}
        onConfirm={notice?.boxId ? () => { const id = notice.boxId; setNotice(null); onNavigate("box", { box: id }); } : undefined}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}

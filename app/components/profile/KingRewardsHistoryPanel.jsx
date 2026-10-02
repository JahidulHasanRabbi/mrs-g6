"use client";

import { useMemo, useState } from "react";
import { GlassCard, GoldText, KrTabs, formatKrAmount } from "../themes/kingrewards/KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "../themes/kingrewards/assets";
import { createCoinsPointsHistory, formatHistoryDate, getHistoryPageNumbers, useHistoryPage } from "./historyData";

const TABS = [
  { id: "token", label: "KR Coins & Points History" },
  { id: "reward", label: "Reward History" },
];

const COLUMNS = {
  token: {
    grid: "64px minmax(0,1fr) minmax(0,1fr) 56px",
    cells: [
      { key: "created", label: "Date" },
      { key: "activity", label: "Activity" },
      { key: "pointType", label: "Point Type" },
      { key: "amount", label: "Amount", align: "right" },
    ],
  },
  reward: {
    grid: "64px 40px minmax(0,1fr) minmax(0,1fr)",
    cells: [
      { key: "created", label: "Date" },
      { key: "category", label: "Type", align: "center" },
      { key: "reward_details", label: "Details" },
      { key: "reward_name", label: "Reward", align: "right" },
    ],
  },
};

const ALIGN = { center: "text-center", right: "text-right" };

/** "+1,234" / "-50" — every amount carries its sign so the column reads at a glance. */
function signedAmount(value) {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return { text: "—", negative: false };
  if (n === 0) return { text: "0", negative: false };
  return { text: `${n > 0 ? "+" : "-"}${formatKrAmount(Math.abs(n))}`, negative: n < 0 };
}

function cellValue(row, key) {
  if (key === "created") return { text: formatHistoryDate(row.created) };
  if (key === "amount") return signedAmount(row.amount);
  const value = row[key];
  return { text: value === null || value === undefined || value === "" ? "—" : String(value) };
}

function StateLine({ children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-[12px]" style={{ color: KR_COLORS.sand }}>
      {children}
    </div>
  );
}

function PageArrow({ dir, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous history page" : "Next history page"}
      className="flex size-4 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-35"
    >
      <img src={KR_ASSETS.ui.iconArrowLeft} alt="" className="size-4" style={dir > 0 ? { transform: "rotate(180deg)" } : undefined} />
    </button>
  );
}

/** King Rewards profile history panel (Figma 664:1736): tabs, table card, pagination. */
export default function KingRewardsHistoryPanel() {
  const [type, setType] = useState("token");
  const fetchCoinsPoints = useMemo(() => createCoinsPointsHistory(), []);
  const { rows, loading, hasLoaded, error, retry, currentPage, totalPages, goToPage } = useHistoryPage(type, 10, fetchCoinsPoints);
  const config = COLUMNS[type];
  const title = TABS.find((t) => t.id === type).label;
  const showRows = hasLoaded && !loading && !error && rows.length > 0;

  let body;
  if (loading || !hasLoaded) {
    body = <StateLine>Loading history…</StateLine>;
  } else if (error) {
    body = (
      <StateLine>
        <span className="text-white">Could not load your history.</span>
        <button
          type="button"
          onClick={retry}
          className="cursor-pointer rounded-[48px] px-4 py-1 text-[12px] font-semibold"
          style={{ color: KR_COLORS.gold, border: `1.5px solid ${KR_COLORS.goldBright}` }}
        >
          Try again
        </button>
      </StateLine>
    );
  } else if (rows.length === 0) {
    body = <StateLine>No records yet.</StateLine>;
  } else {
    body = rows.map((row, i) => (
      <div
        key={row.id || row.uuid || i}
        className="grid items-center gap-2 border-t border-white/10 pt-2 text-[11px] leading-[1.3] text-white first:border-t-0 first:pt-0"
        style={{ gridTemplateColumns: config.grid }}
      >
        {config.cells.map((c) => {
          const { text, negative } = cellValue(row, c.key);
          return (
            <span
              key={c.key}
              className={`break-words tabular-nums ${c.key === "created" ? "whitespace-nowrap" : ""} ${c.key === "amount" ? "font-semibold" : ""} ${ALIGN[c.align] || ""}`}
              style={c.key === "amount" && negative ? { color: "#ffb0a0" } : undefined}
            >
              {text}
            </span>
          );
        })}
      </div>
    ));
  }

  return (
    <GlassCard radius={12} className="flex w-full flex-col gap-2 p-1">
      <KrTabs tabs={TABS} active={type} onChange={setType} size={12} />

      <div
        className="flex flex-col gap-4 rounded-[8px] p-2"
        style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${KR_COLORS.goldBright}` }}
      >
        <GoldText as="h3" className="block text-[14px] font-bold uppercase">
          {title}
        </GoldText>

        <div className="flex flex-col gap-2" style={{ fontFamily: KR_FONT }}>
          <div
            className="grid gap-2 text-[12px] font-semibold leading-[1.3]"
            style={{ gridTemplateColumns: config.grid, color: "#f5c154" }}
          >
            {config.cells.map((c) => (
              <span key={c.key} className={`${ALIGN[c.align] || ""}`}>
                {c.label}
              </span>
            ))}
          </div>
          {body}
        </div>
      </div>

      {showRows && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pb-1" style={{ fontFamily: KR_FONT }}>
          <PageArrow dir={-1} disabled={currentPage === 1} onClick={() => goToPage(Math.max(1, currentPage - 1))} />
          {getHistoryPageNumbers(currentPage, totalPages).map((item, idx) =>
            typeof item === "string" ? (
              <span key={`${item}-${idx}`} className="text-[11px] font-medium leading-[15px] tracking-[1px] text-white">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={`min-w-6 cursor-pointer py-1 text-center text-[11px] font-medium leading-[15px] tracking-[1px] ${item === currentPage ? "underline" : ""}`}
                style={{ color: item === currentPage ? KR_COLORS.gold : "#fff" }}
              >
                {item}
              </button>
            )
          )}
          <PageArrow dir={1} disabled={currentPage === totalPages} onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} />
        </div>
      )}
    </GlassCard>
  );
}

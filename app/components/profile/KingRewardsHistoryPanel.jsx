"use client";

import { useState } from "react";
import { GlassCard, GoldText, KrTabs } from "../themes/kingrewards/KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "../themes/kingrewards/assets";
import { formatHistoryDate, getHistoryPageNumbers, useHistoryPage } from "./historyData";

const TABS = [
  { id: "token", label: "KR Coin History" },
  { id: "reward", label: "Reward History" },
];

const COLUMNS = {
  token: {
    grid: "60px 52px minmax(0,1fr) 60px",
    cells: [
      { key: "created", label: "Date/time" },
      { key: "category", label: "Category", align: "center" },
      { key: "token_details", label: "Details" },
      { key: "amount", label: "Amount", align: "right" },
    ],
  },
  reward: {
    grid: "60px 44px minmax(0,1fr) minmax(0,1fr)",
    cells: [
      { key: "created", label: "Date/time" },
      { key: "category", label: "Type", align: "center" },
      { key: "reward_details", label: "Details" },
      { key: "reward_name", label: "Reward", align: "right" },
    ],
  },
};

const ALIGN = { center: "text-center", right: "text-right" };

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
  const { rows, loading, currentPage, totalPages, goToPage } = useHistoryPage(type, 10);
  const config = COLUMNS[type];
  const title = TABS.find((t) => t.id === type).label;

  return (
    <GlassCard radius={12} className="flex w-full flex-col gap-2 p-1">
      <KrTabs tabs={TABS} active={type} onChange={setType} size={10} />

      <div
        className="flex flex-col gap-4 rounded-[8px] p-2"
        style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${KR_COLORS.goldBright}` }}
      >
        <GoldText as="h3" className="block text-[14px] font-bold uppercase">
          {title}
        </GoldText>

        <div className="flex flex-col gap-3" style={{ fontFamily: KR_FONT }}>
          <div
            className="grid gap-2 text-[12px] font-light leading-[1.3]"
            style={{ gridTemplateColumns: config.grid, color: "#f5c154" }}
          >
            {config.cells.map((c) => (
              <span key={c.key} className={`whitespace-nowrap ${ALIGN[c.align] || ""}`}>
                {c.label}
              </span>
            ))}
          </div>

          {loading ? (
            <p className="py-6 text-center text-[11px]" style={{ color: KR_COLORS.sand }}>Loading...</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-[11px]" style={{ color: KR_COLORS.sand }}>No records found.</p>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.id || row.uuid || i}
                className="grid items-center gap-2 text-[10px] leading-[1.3] text-white"
                style={{ gridTemplateColumns: config.grid }}
              >
                {config.cells.map((c) => {
                  let value = row[c.key];
                  if (c.key === "created") value = formatHistoryDate(value);
                  if (value === null || value === undefined || value === "") value = "—";
                  return (
                    <span
                      key={c.key}
                      className={`truncate tabular-nums ${ALIGN[c.align] || ""}`}
                      title={typeof value === "string" ? value : undefined}
                    >
                      {value}
                    </span>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pb-1" style={{ fontFamily: KR_FONT }}>
        <PageArrow dir={-1} disabled={currentPage === 1} onClick={() => goToPage(Math.max(1, currentPage - 1))} />
        {getHistoryPageNumbers(currentPage, totalPages).map((item, idx) =>
          typeof item === "string" ? (
            <span key={`${item}-${idx}`} className="text-[10px] font-medium leading-[15px] tracking-[1px] text-white">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={`min-w-4 cursor-pointer text-center text-[10px] font-medium leading-[15px] tracking-[1px] ${item === currentPage ? "underline" : ""}`}
              style={{ color: item === currentPage ? KR_COLORS.gold : "#fff" }}
            >
              {item}
            </button>
          )
        )}
        <PageArrow dir={1} disabled={currentPage === totalPages} onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} />
      </div>
    </GlassCard>
  );
}

"use client";

// Attack history (Figma 2623:1471): TIME / BOSS / DAMAGE / CRIT / AP table.

import { useEffect, useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import { StateLine, WarButton, WarCard, WarTitle } from "../primitives";

// Project rule: dd/mm/yyyy HH:MM AM|PM (en-GB). The table is narrow, so the
// date and time stack on two lines.
function fmtTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
  };
}

const COLS = "grid-cols-[1.3fr_1.3fr_1fr_0.6fr_0.4fr]";

export default function History({ onNavigate }) {
  const skin = useRpgSkin();
  const ink = skin.war.ink;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    warApi
      .getHistory({ limit: 50 })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err?.message || "Could not load history."));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>History</WarTitle>
      <div className="flex flex-col gap-[12px] px-[2px] pt-[8px]">
        <WarCard className="flex min-h-[420px] flex-col !px-[18px] !py-[18px]">
          <div className={`grid ${COLS} gap-[4px] border-b pb-[6px] text-[8px] tracking-[1px]`} style={{ color: ink.meta, borderColor: skin.c.rule, fontFamily: skin.war.font }}>
            <span>TIME</span>
            <span>BOSS</span>
            <span className="text-right">DAMAGE</span>
            <span className="text-center">CRIT</span>
            <span className="text-right">AP</span>
          </div>
          {error ? <StateLine>{error}</StateLine> : null}
          {!data && !error ? <StateLine>LOADING...</StateLine> : null}
          {data && !data.rows.length ? <StateLine>No attacks yet.</StateLine> : null}
          {(data?.rows || []).map((r) => {
            const t = fmtTime(r.time);
            return (
              <div key={r.id} className={`grid ${COLS} items-center gap-[4px] border-b py-[8px] text-[9px]`} style={{ borderColor: skin.c.rule, fontFamily: skin.war.font, color: ink.text }}>
                <span className="flex flex-col leading-[11px]">
                  <span>{t.time}</span>
                  <span style={{ color: ink.meta }}>{t.date}</span>
                </span>
                <span className="truncate">{r.bossName}</span>
                <span className="text-right font-bold" style={{ color: ink.value }}>{fmt(r.damage)}</span>
                <span className="text-center font-bold" style={{ color: r.critical ? ink.crit : ink.meta }}>{r.critical ? "Yes" : "No"}</span>
                <span className="text-right">{r.ap}</span>
              </div>
            );
          })}
        </WarCard>
        <WarButton className="mx-auto w-[190px]" onClick={() => onNavigate(WAR_VIEWS.REWARDS)}>View Rewards</WarButton>
      </div>
    </div>
  );
}

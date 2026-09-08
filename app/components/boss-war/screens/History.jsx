"use client";

// Attack history (Figma 2623:1471): TIME / BOSS / DAMAGE / CRIT / AP table.

import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import { useFrameInk, useWarResource, WarButton, WarCard, WarScreen, WarState } from "../primitives";

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

const COLS = "grid-cols-[58px_minmax(0,1fr)_54px_30px_18px]";

export default function History({ onNavigate }) {
  const skin = useRpgSkin();
  const ink = useFrameInk(skin.war.table || skin.war.card);
  const { data, error } = useWarResource(() => warApi.getHistory({ limit: 50 }), [], "Could not load history.");
  const [padL, padR] = skin.war.tablePad || [6, 6];

  return (
    <WarScreen title="History">
        <WarCard
          spec={skin.war.table || skin.war.card}
          className="flex h-[440px] min-w-0 flex-col"
          style={{ paddingLeft: `${padL}%`, paddingRight: `${padR}%` }}
        >
          <div className={`grid ${COLS} gap-[4px] border-b pb-[6px] pr-[12px] text-[9px] tracking-[0.6px]`} style={{ color: ink.text, borderColor: skin.c.rule, fontFamily: skin.war.font }}>
            <span>TIME</span>
            <span className="min-w-0 truncate">BOSS</span>
            <span className="text-right">DAMAGE</span>
            <span className="text-center">CRIT</span>
            <span className="text-right">AP</span>
          </div>
          {/* Fixed height + inner scroll: the frame art was being stretched
              taller and taller as attacks accumulated. */}
          <div className="scrollbar-theme min-h-0 flex-1 overflow-y-auto pr-[12px]">
          <WarState data={data} error={error} empty={data && !data.rows.length ? "No attacks yet." : null} />
          {(data?.rows || []).map((r) => {
            const t = fmtTime(r.time);
            return (
              <div key={r.id} className={`grid ${COLS} items-center gap-[4px] border-b py-[8px] text-[10px]`} style={{ borderColor: skin.c.rule, fontFamily: skin.war.font, color: ink.text }}>
                <span className="flex flex-col leading-[11px]">
                  <span>{t.time}</span>
                  <span style={{ color: ink.meta }}>{t.date}</span>
                </span>
                <span className="min-w-0 truncate">{r.bossName}</span>
                <span className="text-right font-bold" style={{ color: ink.value }}>{fmt(r.damage)}</span>
                <span className="text-center font-bold" style={{ color: r.critical ? ink.crit : ink.meta }}>{r.critical ? "Yes" : "No"}</span>
                <span className="text-right">{r.ap}</span>
              </div>
            );
          })}
          </div>
        </WarCard>
        <WarButton className="mx-auto w-[190px]" onClick={() => onNavigate(WAR_VIEWS.REWARDS)}>View Rewards</WarButton>
    </WarScreen>
  );
}

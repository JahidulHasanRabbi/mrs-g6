"use client";

// Boss War landing (Figma 2623:545): boss-type tabs, one card per boss, and
// the "How to Earn Attack Points" plaque.

import { useEffect, useState } from "react";
import { BOSS_TYPE_TABS, HOW_TO_EARN_NOTE, WAR_VIEWS, fmtWhen } from "../constants";
import * as warApi from "../bossWarApi";
import BossCard from "../BossCard";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { useWarResource, GoldText, InfoPlaque, WarCard, WarScreen, WarState, WarTabs, useFrameInk } from "../primitives";

const EMPTY_COPY = "No boss in this category right now.";

// The soonest upcoming boss anywhere in the list — the only schedule the API gives.
function nextUpcoming(bosses) {
  return bosses
    .filter((b) => b.status === "upcoming" && b.startsAt)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0] || null;
}

function EmptyBossCard({ icon, next }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  return (
    <WarCard className="flex flex-col items-center gap-[12px] py-[28px] text-center">
      {icon ? <img src={icon} alt="" aria-hidden className="size-[72px] object-contain" draggable={false} /> : null}
      <p className="text-[14px] font-semibold leading-[20px]" style={{ color: ink.text, fontFamily: skin.war.font }}>
        {EMPTY_COPY}
      </p>
      {next ? (
        <div className="flex flex-col gap-[2px]">
          <GoldText solid className="text-[12px] font-bold uppercase">Next: {next.name}</GoldText>
          <span className="text-[11px] leading-[14px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
            {next.typeLabel} · starts {fmtWhen(next.startsAt)}
          </span>
        </div>
      ) : null}
    </WarCard>
  );
}

export default function BossList({ onNavigate, onApUpdate, onNotice }) {
  const skin = useRpgSkin();
  const emptyCard = skin.war.emptyState;
  const [tab, setTab] = useState(BOSS_TYPE_TABS[0].id);
  const { data, error } = useWarResource(warApi.getBossList, [], "Could not load bosses.");

  useEffect(() => {
    if (!data) return;
    onApUpdate?.(data.ap);
    // Land on the first tab that actually has a boss.
    const first = BOSS_TYPE_TABS.find((t) => data.bosses.some((b) => b.type === t.id));
    if (first) setTab(first.id);
  }, [data, onApUpdate]);

  const bosses = (data?.bosses || []).filter((b) => b.type === tab);

  const open = (boss) => {
    if (boss.status === "defeated") onNavigate(WAR_VIEWS.RESULTS, { boss: boss.id });
    else if (boss.status === "active") onNavigate(WAR_VIEWS.BATTLE, { boss: boss.id });
    else onNotice?.("NOT YET", "This boss room is not open yet.");
  };

  return (
    <WarScreen title="Boss War">
      <WarTabs tabs={BOSS_TYPE_TABS} active={tab} onChange={setTab} />
      <WarState
        data={data}
        error={error}
        empty={data && !bosses.length && !emptyCard ? EMPTY_COPY : null}
      />
      {emptyCard && data && !error && !bosses.length ? <EmptyBossCard icon={emptyCard.icon} next={nextUpcoming(data.bosses)} /> : null}
      {bosses.map((boss) => (
        <BossCard key={boss.id} boss={boss} onAttack={open} />
      ))}
      <InfoPlaque title={skin.war.scheduleTitle || "How to Earn Attack Points"} lines={HOW_TO_EARN_NOTE} className="mt-[6px]" />
    </WarScreen>
  );
}

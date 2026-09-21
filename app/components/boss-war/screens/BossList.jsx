"use client";

// Boss War landing (Figma 2623:545): boss-type tabs, one card per boss, and
// the "How to Earn Attack Points" plaque.

import { useEffect, useState } from "react";
import { BOSS_TYPE_TABS, HOW_TO_EARN_NOTE, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import BossCard from "../BossCard";
import { useWarResource, InfoPlaque, WarScreen, WarState, WarTabs } from "../primitives";

export default function BossList({ onNavigate, onApUpdate, onNotice }) {
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
        empty={data && !bosses.length ? "No boss in this category right now." : null}
      />
      {bosses.map((boss) => (
        <BossCard key={boss.id} boss={boss} onAttack={open} />
      ))}
      <InfoPlaque title="How to Earn Attack Points" lines={HOW_TO_EARN_NOTE} className="mt-[6px]" />
    </WarScreen>
  );
}

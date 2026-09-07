"use client";

// Boss War landing (Figma 2623:545): boss-type tabs, one card per boss, and
// the "How to Earn Attack Points" plaque.

import { useEffect, useState } from "react";
import { BOSS_TYPE_TABS, HOW_TO_EARN_NOTE, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import BossCard from "../BossCard";
import { InfoPlaque, StateLine, WarTabs, WarTitle } from "../primitives";

export default function BossList({ onNavigate, onApUpdate, onNotice }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(BOSS_TYPE_TABS[0].id);

  useEffect(() => {
    let cancelled = false;
    warApi
      .getBossList()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        onApUpdate?.(d.ap);
        // Land on the first tab that actually has a boss.
        const first = BOSS_TYPE_TABS.find((t) => d.bosses.some((b) => b.type === t.id));
        if (first) setTab(first.id);
      })
      .catch((err) => !cancelled && setError(err?.message || "Could not load bosses."));
    return () => {
      cancelled = true;
    };
  }, [onApUpdate]);

  const bosses = (data?.bosses || []).filter((b) => b.type === tab);

  const open = (boss) => {
    if (boss.status === "defeated") onNavigate(WAR_VIEWS.RESULTS, { boss: boss.id });
    else if (boss.status === "active") onNavigate(WAR_VIEWS.BATTLE, { boss: boss.id });
    else onNotice?.("NOT YET", "This boss room is not open yet.");
  };

  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>Boss War</WarTitle>
      <div className="flex flex-col gap-[12px] px-[2px] pt-[8px]">
        <WarTabs tabs={BOSS_TYPE_TABS} active={tab} onChange={setTab} />

        {error ? <StateLine>{error}</StateLine> : null}
        {!data && !error ? <StateLine>LOADING...</StateLine> : null}
        {data && !bosses.length ? <StateLine>No boss in this category right now.</StateLine> : null}

        {bosses.map((boss) => (
          <BossCard key={boss.id} boss={boss} onAttack={open} />
        ))}

        <InfoPlaque title="How to Earn Attack Points" lines={HOW_TO_EARN_NOTE} className="mt-[6px]" />
      </div>
    </div>
  );
}

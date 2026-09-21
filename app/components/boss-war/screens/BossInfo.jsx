"use client";

// Boss Info (Figma 2623:831): rule sections + "How to Earn Rewards".
//
// The boss's own numbers (damage range, crit rate and multiplier, duration) and
// the VIP combat table are all configured in admin, so with a boss in context
// this screen reads them from the API rather than repeating the spec's example
// values. Without a boss — or if either call fails — it falls back to the
// static copy, which is what the standalone Info entry shows.

import * as warApi from "../bossWarApi";
import { BOSS_INFO_SECTIONS, HOW_TO_EARN_NOTE } from "../constants";
import { InfoPlaque, SectionCard, WarScreen, useWarResource } from "../primitives";

const pct = (v) => `${Number(v)}%`;
const mult = (v) => `${Number(v)}×`;

// "24 hours" / "7 days" — derived from the boss's own window rather than
// assumed from its type, since admin sets both independently.
function duration(startsAt, endsAt) {
  const ms = new Date(endsAt) - new Date(startsAt);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const hours = Math.round(ms / 3600000);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.round(hours / 24)} days`;
}

function liveSections(boss, vip) {
  if (!boss) return null;
  const window = duration(boss.starts_at, boss.ends_at);
  const sections = [
    {
      id: "type",
      label: "BOSS TYPE",
      title: `${boss.boss_type} Boss`,
      body: window ? `${window} battle • Reward pool resets with the event` : "Reward pool resets with the event",
    },
    {
      id: "attack",
      label: "ATTACK",
      title: "1 AP = 1 Attack",
      body: `Base damage ${boss.min_damage}–${boss.max_damage} • ${pct(boss.base_critical_rate)} base critical rate • Criticals deal ${mult(boss.critical_multiplier)} damage`,
    },
  ];

  // The VIP table is global, not per boss; each row is a tier's crit rate and
  // damage multiplier.
  if (vip?.length) {
    sections.push({
      id: "vip",
      label: "VIP BONUS",
      title: "VIP Combat Advantage",
      body: vip
        .map((v) => `${v.member_tier_name}: ${pct(v.critical_rate)} crit • ${mult(v.damage_bonus)} damage`)
        .join("\n"),
    });
  } else {
    sections.push(BOSS_INFO_SECTIONS.find((s) => s.id === "vip"));
  }

  sections.push(
    BOSS_INFO_SECTIONS.find((s) => s.id === "ranking"),
    BOSS_INFO_SECTIONS.find((s) => s.id === "rewards"),
  );
  return sections.filter(Boolean);
}

export default function BossInfo({ bossId }) {
  const { data } = useWarResource(() => warApi.getBossInfo(bossId), [bossId], "Could not load boss info.");

  // Static copy until the live payload lands, so the screen never blanks.
  const sections = liveSections(data?.boss, data?.vip) || BOSS_INFO_SECTIONS;

  return (
    <WarScreen title="Boss Info">
      {sections.map((s) => (
        <SectionCard key={s.id} label={s.label} title={s.title}>
          {/* VIP rows are newline-joined; keep the breaks the API implies. */}
          <span className="whitespace-pre-line">{s.body}</span>
        </SectionCard>
      ))}
      <InfoPlaque title="How to Earn Rewards" lines={HOW_TO_EARN_NOTE} className="mt-[14px]" />
    </WarScreen>
  );
}

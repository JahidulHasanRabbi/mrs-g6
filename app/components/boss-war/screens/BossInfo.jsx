"use client";

// Boss Info (Figma 2623:831): static rule sections + "How to Earn Rewards".

import { BOSS_INFO_SECTIONS, HOW_TO_EARN_NOTE } from "../constants";
import { InfoPlaque, SectionCard, WarScreen } from "../primitives";

export default function BossInfo() {
  return (
    <WarScreen title="Boss Info">
      {BOSS_INFO_SECTIONS.map((s) => (
        <SectionCard key={s.id} label={s.label} title={s.title}>
          {s.body}
        </SectionCard>
      ))}
      <InfoPlaque title="How to Earn Rewards" lines={HOW_TO_EARN_NOTE} className="mt-[14px]" />
    </WarScreen>
  );
}

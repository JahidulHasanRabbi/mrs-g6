"use client";

// Boss Info (Figma 2623:831): static rule sections + "How to Earn Rewards".

import { BOSS_INFO_SECTIONS, HOW_TO_EARN_NOTE } from "../constants";
import { InfoPlaque, SectionCard, WarTitle } from "../primitives";

export default function BossInfo() {
  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>Boss Info</WarTitle>
      <div className="flex flex-col gap-[12px] px-[2px] pt-[8px]">
        {BOSS_INFO_SECTIONS.map((s) => (
          <SectionCard key={s.id} label={s.label} title={s.title}>
            {s.body}
          </SectionCard>
        ))}
        <InfoPlaque title="How to Earn Rewards" lines={HOW_TO_EARN_NOTE} className="mt-[14px]" />
      </div>
    </div>
  );
}

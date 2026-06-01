"use client";

import { useState } from "react";
import { LB_COLORS } from "./constants";
import { GlowCard, Flag, HeroButton } from "./primitives";
import { COUNTRIES_BY_TIER } from "./mockApi";

const TIER_COLOR = {
  "Tier 1 · Global Giants": LB_COLORS.gold,
  "Tier 2 · Contenders": LB_COLORS.blueTier,
  "Tier 3 · Challengers": LB_COLORS.challengerTier,
};

function CountryTile({ country, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-[12px] p-[14px]"
      style={{
        background: "#282A2B",
        border: selected ? `1px solid ${LB_COLORS.primary}` : "1px solid rgba(255,255,255,0.05)",
        boxShadow: selected
          ? "0 4px 0 rgba(0,0,0,0.3), 0 0 12px 0 rgba(84,233,138,0.5)"
          : "0 4px 0 rgba(0,0,0,0.3)",
      }}
    >
      <Flag code={country.code} />
      <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
        {country.name}
      </span>
    </button>
  );
}

export default function NationSelect({ onConfirm }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="flex justify-center px-4 pb-8 pt-2">
      <GlowCard>
        <div className="flex flex-col items-center gap-4">
          <h2
            className="text-center uppercase"
            style={{
              color: LB_COLORS.primary,
              fontFamily: "'Anybody','Lexend',sans-serif",
              fontWeight: 700,
              fontSize: 28,
              lineHeight: "34px",
            }}
          >
            CHOOSE YOUR<br />NATION
          </h2>
          <p className="text-center" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif", fontSize: 14 }}>
            Join a country to start earning XP and climbing the ranks!
          </p>

          <div className="flex w-full flex-col gap-5 pt-2">
            {Object.entries(COUNTRIES_BY_TIER).map(([tier, items]) => (
              <div key={tier} className="flex flex-col gap-3">
                <div className="pl-3" style={{ borderLeft: `4px solid ${TIER_COLOR[tier]}` }}>
                  <div className="text-[14px] uppercase" style={{ color: TIER_COLOR[tier], fontFamily: "'Lexend',sans-serif" }}>
                    {tier}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((c) => (
                    <CountryTile
                      key={c.code}
                      country={c}
                      selected={selected?.code === c.code}
                      onClick={() => setSelected(c)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full pt-3">
            <HeroButton onClick={() => selected && onConfirm(selected)}>
              CONFIRM SELECTION
            </HeroButton>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

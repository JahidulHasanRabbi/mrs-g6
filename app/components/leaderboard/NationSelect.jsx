"use client";

import { useEffect, useState } from "react";
import { LB_COLORS } from "./constants";
import { GlowCard, Flag, HeroButton } from "./primitives";
import { getCountriesByTier } from "./worldcupApi";

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
      <Flag code={country.code} src={country.flag} />
      <span className="text-[12px]" style={{ color: LB_COLORS.textPrimary, fontFamily: "'Lexend',sans-serif" }}>
        {country.name}
      </span>
    </button>
  );
}

export default function NationSelect({ onConfirm, error }) {
  const [selected, setSelected] = useState(null);
  const [countriesByTier, setCountriesByTier] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getCountriesByTier()
      .then((data) => { setCountriesByTier(data); setLoading(false); })
      .catch((err) => { setLoadError(err?.message || "Failed to load countries"); setLoading(false); });
  }, []);

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
            {loading && (
              <p className="text-center text-[13px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
                Loading countries...
              </p>
            )}
            {loadError && (
              <p className="text-center text-[13px]" style={{ color: "#ff6b6b", fontFamily: "'Lexend',sans-serif" }}>
                {loadError}
              </p>
            )}
            {!loading && !loadError && Object.keys(countriesByTier).length === 0 && (
              <p className="text-center text-[13px]" style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}>
                No countries available yet.
              </p>
            )}
            {Object.entries(countriesByTier).map(([tier, items]) => {
              const tierColor = TIER_COLOR[tier] ?? LB_COLORS.primary;
              return (
                <div key={tier} className="flex flex-col gap-3">
                  <div className="pl-3" style={{ borderLeft: `4px solid ${tierColor}` }}>
                    <div className="text-[14px] uppercase" style={{ color: tierColor, fontFamily: "'Lexend',sans-serif" }}>
                      {tier}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((c) => (
                      <CountryTile
                        key={c.uuid ?? c.code}
                        country={c}
                        selected={selected?.uuid === c.uuid}
                        onClick={() => setSelected(c)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="w-full text-center text-[13px]" style={{ color: "#ff6b6b", fontFamily: "'Lexend',sans-serif" }}>
              {error}
            </p>
          )}
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

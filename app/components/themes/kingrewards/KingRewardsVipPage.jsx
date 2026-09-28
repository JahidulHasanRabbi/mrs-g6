"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LoadingState from "../../ui/LoadingState";
import ErrorDisplay from "../../ui/ErrorDisplay";
import { GlassCard, CardTitle, GoldText, KrArrowPill, formatKrAmount } from "./KrUi";
import { KrOutlineButton } from "./KingRewardsProfileParts";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_SURFACES } from "./assets";
import { getVipTiers } from "../../../api/memberApi";
import { mapVipTiers } from "../../../api/responseMappers";

// Badges follow the API's tier order (tier-1..9, Bronze → Amethyst); matching
// by name gave two tiers the same badge when admins rename tiers.
function tierArt(tier, index) {
  if (index < KR_ASSETS.vip.tiers.length) return KR_ASSETS.vip.tiers[index];
  return tier?.level_icon || tier?.rank_icon || KR_ASSETS.vip.tiers[KR_ASSETS.vip.tiers.length - 1];
}


/** Tier selection bar (Figma 683:1246): the selected tier glows and scrolls to centre. */
function TierRail({ tiers, selected, onSelect }) {
  const viewportRef = useRef(null);
  const tileRefs = useRef([]);
  const index = Math.max(0, tiers.findIndex((t) => t.name === selected));

  useEffect(() => {
    const vp = viewportRef.current;
    const tile = tileRefs.current[index];
    if (!vp || !tile) return;
    vp.scrollTo({ left: tile.offsetLeft - (vp.clientWidth - tile.offsetWidth) / 2, behavior: "smooth" });
  }, [index, tiers.length]);

  return (
    <div
      className="relative flex w-full items-center gap-[10px] overflow-hidden rounded-[48px] px-1 py-2"
      style={{ border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: "inset 0 8px 8px 4px rgba(195,218,255,0.25)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(ellipse at center, #003d89 8%, #052e68 54%, #091f46 100%)" }}
      />
      <div className="relative">
        <KrArrowPill className="size-6" label="Previous tier" dir={-1} disabled={index === 0} onClick={() => onSelect(tiers[index - 1].name)} />
      </div>
      <div
        ref={viewportRef}
        className="scrollbar-hide relative flex min-w-0 flex-1 gap-4 overflow-x-auto py-2"
      >
        {tiers.map((tier, i) => {
          const on = i === index;
          return (
            <button
              key={tier.name || i}
              ref={(el) => { tileRefs.current[i] = el; }}
              type="button"
              onClick={() => onSelect(tier.name)}
              aria-pressed={on}
              className="flex w-[calc((100%-32px)/3)] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-full p-1"
            >
              <img
                src={tierArt(tier, i)}
                alt=""
                draggable={false}
                className="aspect-square w-full max-w-[80px] select-none object-contain"
                style={on ? { filter: "drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 20px rgba(255,215,0,0.5))" } : undefined}
              />
              <span
                className="max-w-full truncate text-center text-[12px] font-bold leading-4 tracking-[1.2px]"
                style={{
                  fontFamily: KR_FONT,
                  color: "#ffd700",
                  textShadow: on ? "0 0 20px rgba(242,186,51,0.35), 0 0 10px rgba(242,186,51,0.8)" : undefined,
                }}
              >
                {tier.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative">
        <KrArrowPill className="size-6" label="Next tier" dir={1} disabled={index >= tiers.length - 1} onClick={() => onSelect(tiers[index + 1].name)} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="w-full rounded-[8px] p-2" style={KR_SURFACES.inner}>
      <div
        className="flex w-full items-center gap-[10px] rounded-[6px] px-2 py-1"
        style={{ border: `1.5px solid ${KR_COLORS.goldBright}` }}
      >
        <img src={icon} alt="" draggable={false} className="size-8 shrink-0 object-contain" />
        <div className="flex min-w-0 flex-col gap-1" style={{ fontFamily: KR_FONT }}>
          <span className="text-[12px] font-semibold leading-[1.2] text-white">{label}</span>
          <GoldText className="truncate text-[16px] font-bold">{value}</GoldText>
        </div>
      </div>
    </div>
  );
}

/** King Rewards VIP details (Figma 683:714). */
export default function KingRewardsVipPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("Bronze");
  const [vipTiers, setVipTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTiers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mappedTiers = mapVipTiers(await getVipTiers());
      setVipTiers(mappedTiers);
      if (mappedTiers.length > 0) setSelectedLevel(mappedTiers[0].name);
    } catch (err) {
      console.error("Failed to fetch VIP tiers:", err);
      setError(err.message || "Failed to load VIP tier information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const tier = useMemo(() => vipTiers.find((t) => t.name === selectedLevel) || null, [vipTiers, selectedLevel]);

  const stats = [
    {
      icon: KR_ASSETS.vip.iconLifetimeDeposit,
      label: "Lifetime Deposit",
      value: tier?.lifetime_deposit_required != null ? `RM ${formatKrAmount(tier.lifetime_deposit_required)}` : "—",
    },
    {
      icon: KR_ASSETS.vip.iconMonthlyDeposit,
      label: "Monthly Deposit",
      value: tier?.monthly_deposit != null ? `RM ${formatKrAmount(tier.monthly_deposit)}` : "—",
    },
    {
      icon: KR_ASSETS.vip.iconCheckinToken,
      label: "Check-in KR Coins",
      value: tier?.check_in_token != null ? formatKrAmount(tier.check_in_token) : "—",
    },
    {
      icon: KR_ASSETS.vip.iconUpgradeGift,
      label: "Upgrade (Free KR Coins)",
      value: tier?.upgrade_free_token != null ? formatKrAmount(tier.upgrade_free_token) : "—",
    },
  ];

  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/profile"));

  return (
    <div className="flex w-full flex-col items-center px-4 pb-4 pt-8">
      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <GlassCard className="flex w-full flex-col gap-6 px-2 py-4">
          <CardTitle align="center">VIP Details</CardTitle>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorDisplay message={error} onRetry={loadTiers} />
          ) : (
            <div className="flex flex-col gap-4 overflow-hidden">
              {vipTiers.length > 0 && (
                <TierRail tiers={vipTiers} selected={selectedLevel} onSelect={setSelectedLevel} />
              )}
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <KrOutlineButton style={{ paddingInline: 32 }} onClick={goBack}>
              Back
            </KrOutlineButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

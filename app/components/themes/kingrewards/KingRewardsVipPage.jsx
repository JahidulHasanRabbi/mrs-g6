"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LoadingState from "../../ui/LoadingState";
import ErrorDisplay from "../../ui/ErrorDisplay";
import { GlassCard, GoldText, KrArrowPill, PageTitle, formatKrAmount } from "./KrUi";
import { KrOutlineButton } from "./KingRewardsProfileParts";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_GRADIENTS, KR_SURFACES } from "./assets";
import { getVipTiers } from "../../../api/memberApi";
import { mapVipTiers } from "../../../api/responseMappers";
import { formatKrCoins } from "../../../api/apiOptions";
import { useUser } from "../../../contexts/UserContext";

// Badges follow the API's tier order (tier-1..9, Bronze → Amethyst); matching
// by name gave two tiers the same badge when admins rename tiers.
function tierArt(tier, index) {
  if (index < KR_ASSETS.vip.tiers.length) return KR_ASSETS.vip.tiers[index];
  return tier?.level_icon || tier?.rank_icon || KR_ASSETS.vip.tiers[KR_ASSETS.vip.tiers.length - 1];
}


const sameTier = (a, b) => !!a && !!b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

/**
 * Tier selection bar (Figma 683:1246). The viewed tier is outlined and scrolls
 * to centre; the member's own tier carries a CURRENT tag; the rest sit quieter.
 */
function TierRail({ tiers, selected, currentLevel, onSelect }) {
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
      className="relative flex w-full items-center gap-[6px] overflow-hidden rounded-[48px] px-1 py-2"
      style={{ border: `1px solid ${KR_COLORS.goldBright}`, boxShadow: "inset 0 8px 8px 4px rgba(195,218,255,0.25)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(ellipse at center, #003d89 8%, #052e68 54%, #091f46 100%)" }}
      />
      <div className="relative">
        <KrArrowPill className="size-7" label="Previous tier" dir={-1} disabled={index === 0} onClick={() => onSelect(tiers[index - 1].name)} />
      </div>
      <div ref={viewportRef} className="scrollbar-hide relative flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 pt-3">
        {tiers.map((tier, i) => {
          const viewed = i === index;
          const isCurrent = sameTier(tier.name, currentLevel);
          return (
            <button
              key={tier.name || i}
              ref={(el) => { tileRefs.current[i] = el; }}
              type="button"
              onClick={() => onSelect(tier.name)}
              aria-pressed={viewed}
              aria-label={`${tier.name}${isCurrent ? " (your current level)" : ""}`}
              className="relative flex w-[calc((100%-24px)/3)] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-[12px] px-1 pb-1 pt-2 transition-opacity"
              style={{
                opacity: viewed || isCurrent ? 1 : 0.55,
                background: viewed ? "rgba(255,255,255,0.12)" : "transparent",
                boxShadow: viewed ? `inset 0 0 0 1.5px ${KR_COLORS.goldBright}` : "none",
              }}
            >
              {isCurrent && (
                <span
                  className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-[1px] text-[9px] font-extrabold uppercase leading-[1.3] tracking-[0.8px]"
                  style={{ fontFamily: KR_FONT, color: KR_COLORS.onGold, background: KR_GRADIENTS.gold }}
                >
                  Current
                </span>
              )}
              <img
                src={tierArt(tier, i)}
                alt=""
                draggable={false}
                className="aspect-square w-full max-w-[72px] select-none object-contain"
                style={{
                  filter: viewed
                    ? "drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 20px rgba(255,215,0,0.5))"
                    : isCurrent
                      ? undefined
                      : "saturate(0.6)",
                }}
              />
              <span
                className="max-w-full truncate text-center text-[12px] font-bold leading-4 tracking-[1.2px]"
                style={{
                  fontFamily: KR_FONT,
                  color: viewed ? "#ffd700" : "#fff2d4",
                  textShadow: viewed ? "0 0 20px rgba(242,186,51,0.35), 0 0 10px rgba(242,186,51,0.8)" : undefined,
                }}
              >
                {tier.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative">
        <KrArrowPill className="size-7" label="Next tier" dir={1} disabled={index >= tiers.length - 1} onClick={() => onSelect(tiers[index + 1].name)} />
      </div>
    </div>
  );
}

/** One line under the rail so the viewed tier is never mistaken for the member's own. */
function ViewingLine({ viewed, currentLevel }) {
  if (!viewed) return null;
  const isOwn = sameTier(viewed, currentLevel);
  return (
    <p className="text-center text-[12px] leading-[1.3] text-white" style={{ fontFamily: KR_FONT }}>
      Viewing <span className="font-bold" style={{ color: KR_COLORS.goldText }}>{viewed}</span>
      {isOwn ? (
        <span style={{ color: KR_COLORS.sand }}> · your current level</span>
      ) : currentLevel ? (
        <span style={{ color: KR_COLORS.sand }}>
          {" · your level: "}
          <span className="font-semibold text-white">{currentLevel}</span>
        </span>
      ) : null}
    </p>
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
  const { userData } = useUser();
  const currentLevel = userData?.currentLevel || "";
  const [selectedLevel, setSelectedLevel] = useState("");
  const [vipTiers, setVipTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTiers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mappedTiers = mapVipTiers(await getVipTiers());
      setVipTiers(mappedTiers);
      if (mappedTiers.length > 0) setSelectedLevel((prev) => prev || mappedTiers[0].name);
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

  // Open on the member's own tier once both it and the tier list are known.
  const openedOnCurrent = useRef(false);
  useEffect(() => {
    if (openedOnCurrent.current || !currentLevel || vipTiers.length === 0) return;
    const own = vipTiers.find((t) => sameTier(t.name, currentLevel));
    if (own) setSelectedLevel(own.name);
    openedOnCurrent.current = true;
  }, [currentLevel, vipTiers]);

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
      value: tier?.check_in_token != null ? formatKrCoins(formatKrAmount(tier.check_in_token)) : "—",
    },
    {
      icon: KR_ASSETS.vip.iconUpgradeGift,
      label: "Upgrade Reward",
      value: tier?.upgrade_free_token != null ? formatKrCoins(formatKrAmount(tier.upgrade_free_token)) : "—",
    },
  ];

  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/profile"));

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pb-4 pt-8">
      <PageTitle>VIP Details</PageTitle>

      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <GlassCard className="flex w-full flex-col gap-6 px-2 py-4">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorDisplay message={error} onRetry={loadTiers} />
          ) : vipTiers.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ fontFamily: KR_FONT, color: KR_COLORS.sand }}>
              No VIP levels are available right now.
            </p>
          ) : (
            <div className="flex flex-col gap-3 overflow-hidden">
              <TierRail tiers={vipTiers} selected={selectedLevel} currentLevel={currentLevel} onSelect={setSelectedLevel} />
              <ViewingLine viewed={tier?.name} currentLevel={currentLevel} />
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

"use client";

import { ASSETS, GRAD_CARD, GRAD_DARK, GRAD_GOLD } from "../retention/constants";

// KPI tiles for the Redeem Links dashboard.
// Card visuals are deliberately identical to the retention PIC dashboard
// (same gradients, icon chip, gold clipped value) so the two surfaces read as
// one system — see app/admin/retention/pic-dashboard/page.jsx.
//
// Every metric from /redemption/dashboard/kpi/ is a plain count, so unlike the
// retention grid there is no currency/percent formatting: total_credit_given is
// a count of free-credit rewards handed out, not a ringgit amount.

export const REDEEM_KPI_META = [
  { id: "tokens", label: "Total Tokens Given", key: "total_tokens_given", icon: `${ASSETS}/kpi-sales.svg` },
  { id: "battle-points", label: "Total Battle Points Given", key: "total_battle_points_given", icon: `${ASSETS}/kpi-winlose.svg` },
  { id: "credit", label: "Total Credit Given", key: "total_credit_given", icon: `${ASSETS}/kpi-sales.svg` },
  { id: "redemptions", label: "Total Redemptions", key: "total_redemptions", icon: `${ASSETS}/kpi-members.svg` },
  { id: "unique-users", label: "Unique Users Redeemed", key: "unique_users_redeemed", icon: `${ASSETS}/kpi-members.svg` },
  { id: "active-links", label: "Active Links", key: "active_links", icon: `${ASSETS}/kpi-active.svg` },
];

function formatCount(value) {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-US");
}

export default function RedeemLinkKpiGrid({ kpi, loading }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {REDEEM_KPI_META.map((meta) =>
        loading ? (
          <KpiCardSkeleton key={meta.id} />
        ) : (
          <KpiCard key={meta.id} meta={meta} value={formatCount(kpi?.[meta.key])} />
        )
      )}
    </div>
  );
}

// Non-interactive by design: unlike the retention KPIs there is no per-brand
// breakdown endpoint for redeem links, so a click target would lead nowhere.
function KpiCard({ meta, value }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[16px] border-2 border-[#05060a] p-4"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] drop-shadow-[0_0_3px_rgba(222,162,32,0.5)]"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <img src={meta.icon} alt="" className="h-5 w-5" style={{ maxWidth: 20, maxHeight: 20 }} />
        </div>
        <p
          className="min-w-0 flex-1 text-[12px] font-semibold uppercase leading-[15px] text-[#f6dda6]"
          style={{ letterSpacing: "-0.3px" }}
        >
          {meta.label}
        </p>
      </div>
      <p
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap bg-clip-text font-bold text-transparent tabular-nums"
        style={{
          backgroundImage: GRAD_GOLD,
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          fontSize: "clamp(20px, 1.7vw, 30px)",
          lineHeight: "1.2",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-[16px] border-2 border-[#05060a] p-4"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-center gap-2.5">
        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-[6px]" />
        <SkeletonBlock className="h-[15px] w-[72%]" />
      </div>
      <SkeletonBlock className="h-[30px] w-[58%]" />
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-white/10 ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(242,203,122,0.08)" }}
    />
  );
}

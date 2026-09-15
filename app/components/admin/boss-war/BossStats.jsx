"use client";

// Per-boss statistics. There is no stats endpoint — these are aggregated from
// the attack report filtered by boss, so the page pulls enough rows to count
// against and reports the totals the report itself provides.

const CARD =
  "flex flex-col gap-1 rounded-[12px] border border-white/5 bg-white/[0.03] px-5 py-4";

function Stat({ label, value, hint }) {
  return (
    <div className={CARD}>
      <span className="text-[12px] font-medium text-white/50">{label}</span>
      <span className="text-[22px] font-bold text-white">{value}</span>
      {hint ? <span className="text-[11px] text-white/40">{hint}</span> : null}
    </div>
  );
}

export default function BossStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="rounded-[12px] border border-white/5 px-6 py-10 text-center text-[13px] text-white/50">
        Loading statistics...
      </div>
    );
  }

  const pct = stats.hpMax > 0 ? Math.round((1 - stats.hpRemaining / stats.hpMax) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <Stat label="Total Attacks" value={stats.totalAttacks.toLocaleString("en-US")} />
      <Stat label="Players" value={stats.players.toLocaleString("en-US")} hint="unique attackers" />
      <Stat
        label="Damage Dealt"
        value={(stats.hpMax - stats.hpRemaining).toLocaleString("en-US")}
        hint={`${pct}% of ${stats.hpMax.toLocaleString("en-US")} HP`}
      />
      <Stat
        label="Critical Hits"
        value={stats.criticals.toLocaleString("en-US")}
        hint={stats.totalAttacks > 0 ? `${Math.round((stats.criticals / stats.totalAttacks) * 100)}% crit rate` : "—"}
      />
      <Stat label="AP Spent" value={stats.apSpent.toLocaleString("en-US")} />
      <Stat label="Rewards Paid" value={stats.rewardsPaid.toLocaleString("en-US")} />
    </div>
  );
}

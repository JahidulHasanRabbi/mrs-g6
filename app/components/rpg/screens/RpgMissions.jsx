"use client";

// RPG Missions screen (Figma 2026:3643): category tabs and mission cards with
// progress + GO / CLAIM / CLAIMED actions. Backed by
// /avatar/avatar-missions/my-missions/ — its own module, deliberately NOT the
// site-wide platform missions API.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, MISSION_TABS } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta, Panel, ProgressBar } from "../primitives";
import { useRpgSkin } from "../rpgSkin";
import NoticeModal from "../NoticeModal";

// The API's four categories (1 Daily, 2 Weekly, 3 Monthly, 4 Achievement).
const TAB_LABELS = { daily: "DAILY", weekly: "WEEKLY", monthly: "MONTHLY", achievement: "ACHIEVEMENT" };

function MissionIcon({ mission }) {
  if (mission.metric === "deposit") {
    return <img src={RPG_IMAGES.icons.token} alt="" className="size-[22px] object-contain" />;
  }
  return <img src={RPG_IMAGES.icons.bpGem} alt="" className="size-[22px]" />;
}

function rewardText(reward) {
  const parts = [];
  if (reward.bp) parts.push(`${Number(reward.bp).toLocaleString("en-GB")} BP`);
  if (reward.tokens) parts.push(`${reward.tokens} KR Coin${reward.tokens > 1 ? "s" : ""}`);
  return parts.join(" · ") || "No reward";
}

export default function RpgMissions({ onProfileUpdate, onNavigate }) {
  const skin = useRpgSkin();
  const pc = skin.cOnPanel;
  const [tab, setTab] = useState("daily");
  const [missions, setMissions] = useState([]);
  const [claimed, setClaimed] = useState(null); // reward notice
  const [busyId, setBusyId] = useState(null);

  const [loading, setLoading] = useState(true);

  const load = () => {
    rpgApi
      .getRpgMissions()
      .then((d) => setMissions(d.missions))
      .catch((err) => setClaimed({ title: "OOPS", message: err?.message || "Could not load missions." }))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleClaim = async (mission) => {
    if (busyId) return;
    setBusyId(mission.id);
    try {
      const result = await rpgApi.claimRpgMission(mission.id);
      onProfileUpdate(result.profile);
      setClaimed({ title: "REWARD CLAIMED", message: `${mission.title} — ${rewardText(result.reward)} added.` });
      load();
    } catch (err) {
      setClaimed({ title: "OOPS", message: err?.message || "Could not claim." });
    } finally {
      setBusyId(null);
    }
  };

  const visible = missions.filter((m) => m.tab === tab);

  return (
    <div className="flex w-full flex-1 flex-col px-[18px]">
      <h2 className="pt-[22px] text-[26px] font-bold tracking-[6px]" style={{ color: skin.c.title, fontFamily: RPG_FONTS.display, textShadow: skin.c.titleShadow }}>
        MISSIONS
      </h2>
      <p className="mt-[2px] text-[13px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
        Complete tasks to earn KR Coins & Battle Points
      </p>

      {/* Tabs */}
      <div
        className="mt-[16px] flex w-full items-stretch rounded-[14px] border p-[4px]"
        style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}
      >
        {MISSION_TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              // 4 categories share the strip, so the label is tighter than
              // the 3-tab design to keep every tab on one line.
              className="relative min-w-0 flex-1 rounded-[10px] px-[2px] py-[10px] text-[11px] font-bold tracking-[1px]"
              style={{ color: active ? skin.c.accentSoft : skin.c.labelMuted, fontFamily: RPG_FONTS.display }}
            >
              {active && (
                <motion.span
                  layoutId="rpgMissionTab"
                  className="absolute inset-0 rounded-[10px] border"
                  style={{ background: skin.hud.badgeBg, borderColor: skin.hud.badgeBorder }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{TAB_LABELS[t]}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="mt-[14px] flex flex-col gap-[14px] pb-[10px]">
        {!loading && visible.length === 0 ? (
          <p
            className="py-[28px] text-center text-[12px]"
            style={{ color: skin.c.slotEmpty, fontFamily: RPG_FONTS.display }}
          >
            No {TAB_LABELS[tab].toLowerCase()} missions running right now.
          </p>
        ) : null}
        {visible.map((m) => {
          const pct = Math.min(100, (m.progress / m.target) * 100);
          return (
            <Panel
              key={m.id}
              className="flex flex-col gap-[10px]"
              tone="dark"
            >
              <div className="flex items-start gap-[12px]">
                <div
                  className="grid size-[44px] shrink-0 place-items-center rounded-[12px] border"
                  style={
                    { background: skin.hud.badgeBg, borderColor: pc.edgeSoft }
                  }
                >
                  <MissionIcon mission={m} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-bold" style={{ color: pc.text, fontFamily: RPG_FONTS.display }}>
                    {m.title}
                  </span>
                  <span className="text-[11px]" style={{ color: pc.value, fontFamily: RPG_FONTS.display }}>
                    Reward: {rewardText(m.reward)}
                  </span>
                </div>
                <span
                  className="rounded-full border px-[10px] py-[3px] text-[9px] font-bold tracking-[1px]"
                  style={{ borderColor: pc.edge, color: pc.accent, fontFamily: RPG_FONTS.display }}
                >
                  {TAB_LABELS[m.tab]}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]" style={{ color: pc.textDim, fontFamily: RPG_FONTS.display }}>
                <span>Progress</span>
                <span style={{ fontFamily: RPG_FONTS.number }}>
                  {m.progress} / {m.target}
                </span>
              </div>
              <ProgressBar pct={pct} gradient={m.claimable || m.claimed ? RPG_GRADIENTS.cta : undefined} />

              {m.claimed ? (
                <div
                  className="w-full rounded-[12px] border py-[12px] text-center text-[13px] font-bold tracking-[3px]"
                  style={{ borderColor: pc.edge, color: pc.accentSoft, fontFamily: RPG_FONTS.display }}
                >
                  CLAIMED
                </div>
              ) : m.claimable ? (
                <GoldCta onClick={() => handleClaim(m)} disabled={busyId === m.id} glow={false} size="sm">
                  {busyId === m.id ? "CLAIMING..." : "CLAIM"}
                </GoldCta>
              ) : (
                <GoldCta
                  onClick={m.go ? () => onNavigate(m.go) : undefined}
                  disabled={!m.go}
                  glow={false}
                  size="sm"
                >
                  GO
                </GoldCta>
              )}
            </Panel>
          );
        })}
      </div>

      <NoticeModal
        open={Boolean(claimed)}
        title={claimed?.title || ""}
        message={claimed?.message}
        confirmLabel="OK"
        onClose={() => setClaimed(null)}
      />
    </div>
  );
}

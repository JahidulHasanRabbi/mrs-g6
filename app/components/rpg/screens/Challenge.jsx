"use client";

// Universe / Challenge screen (Figma 2026:3323): pick a planet boss, see the
// power gate, start a battle. The planet spheres are pure CSS radial
// gradients lifted from the design's vectors.

import { useEffect, useState } from "react";
import { RPG_COLORS, RPG_FONTS, EXTRA_ATTEMPT_COST } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta } from "../primitives";
import NoticeModal from "../NoticeModal";

const fmt = (n) => Number(n).toLocaleString("en-GB");

function Planet({ boss, locked }) {
  return (
    <div
      className="relative size-[58px] shrink-0 rounded-full"
      style={{
        background: locked ? "rgba(255,255,255,0.02)" : boss.planetGradient,
        boxShadow: boss.planetGlow,
        opacity: locked ? 0.9 : 1,
      }}
    >
      {boss.id === "starlight" && !locked ? (
        <span className="absolute -right-[2px] -top-[2px] text-[13px]" style={{ color: "#eafbff" }}>
          ✦
        </span>
      ) : null}
      {boss.id === "comet" && !locked ? (
        <div
          className="absolute -left-[13px] -top-[2px] h-[4px] w-[34px] -rotate-[24deg] rounded-[2px]"
          style={{ background: "linear-gradient(90deg, rgba(155,231,255,0) 0%, #9be7ff 100%)" }}
        />
      ) : null}
    </div>
  );
}

export default function Challenge({ onBattleStart }) {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    rpgApi
      .getBosses()
      .then((d) => {
        setData(d);
        setSelectedId((prev) => {
          if (prev && d.bosses.some((b) => b.id === prev && !b.locked)) return prev;
          const unlocked = d.bosses.filter((b) => !b.locked);
          return unlocked.length ? unlocked[unlocked.length - 1].id : null;
        });
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const selected = data?.bosses?.find((b) => b.id === selectedId) || null;

  const beginBattle = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const script = await rpgApi.startBattle(selected.id);
      onBattleStart(script);
    } catch (err) {
      setNotice({ title: "CANNOT CHALLENGE", message: err?.message || "Try again later." });
    } finally {
      setBusy(false);
      setConfirmPaid(false);
    }
  };

  const handleChallenge = () => {
    if (!selected) return;
    if (data && !data.freeAttemptAvailable) {
      setConfirmPaid(true);
      return;
    }
    beginBattle();
  };

  return (
    <div className="flex w-full flex-1 flex-col px-[18px]">
      <h2
        className="pt-[20px] text-center text-[24px] font-bold tracking-[6px]"
        style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display, textShadow: "0 0 24px rgba(124,77,255,0.8)" }}
      >
        UNIVERSE
      </h2>
      <p className="mt-[4px] pb-[2px] text-center text-[12px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
        Choose a planet boss to challenge
      </p>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {(data?.bosses || []).map((boss) => {
          const isSelected = boss.id === selectedId && !boss.locked;
          return (
            <button
              key={boss.id}
              type="button"
              disabled={boss.locked}
              onClick={() => setSelectedId(boss.id)}
              className="flex w-full items-center gap-[12px] rounded-[16px] border p-[13px] text-left transition-transform active:scale-[0.99]"
              style={
                boss.locked
                  ? { background: "rgba(255,255,255,0.02)", borderColor: "rgba(139,92,246,0.3)", opacity: 0.62 }
                  : {
                      background: isSelected ? "rgba(47,230,200,0.09)" : "rgba(47,230,200,0.05)",
                      borderColor: isSelected ? RPG_COLORS.cyan : "rgba(47,230,200,0.45)",
                      boxShadow: isSelected ? "0 0 16px rgba(47,230,200,0.18)" : "none",
                    }
              }
            >
              <Planet boss={boss} locked={boss.locked} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-[6px] text-[15px] font-bold" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
                  {boss.name}
                  {boss.locked ? <span className="text-[12px]">🔒</span> : null}
                </span>
                <span className="pt-[2px] text-[9px] font-semibold tracking-[1px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
                  POWER REQUIRED
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ color: boss.locked ? "#ff8faf" : RPG_COLORS.cyan, fontFamily: RPG_FONTS.number }}
                >
                  {boss.locked ? `${fmt(boss.requiredPower)} — need ${fmt(boss.deficit)} more` : fmt(boss.requiredPower)}
                </span>
              </div>
              <div
                className="flex flex-col items-center gap-[4px] rounded-[12px] border px-[11px] py-[9px]"
                style={{ background: "rgba(124,77,255,0.1)", borderColor: "rgba(139,92,246,0.4)" }}
              >
                <img src={RPG_IMAGES.equipment[boss.rewardSlot]} alt="" className="size-[20px]" />
                <span className="text-[9px] font-bold uppercase tracking-[1px]" style={{ color: "#b9a4ff", fontFamily: RPG_FONTS.display }}>
                  {boss.rewardSlot}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="pt-[14px] text-center text-[11px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
        1 free attempt daily · extra attempt {EXTRA_ATTEMPT_COST} Tokens · reward 1 Mystery Box
      </p>

      <div className="px-[6px] pb-[6px] pt-[14px]">
        <GoldCta onClick={handleChallenge} disabled={!selected || busy}>
          {busy ? "ENTERING..." : "CHALLENGE"}
        </GoldCta>
      </div>

      <NoticeModal
        open={confirmPaid}
        title="EXTRA ATTEMPT"
        message={`Your free attempt is used for today. Challenge again for ${EXTRA_ATTEMPT_COST} Tokens?`}
        confirmLabel={`PAY ${EXTRA_ATTEMPT_COST} TOKENS`}
        cancelLabel="NOT NOW"
        busy={busy}
        onConfirm={beginBattle}
        onClose={() => setConfirmPaid(false)}
      />
      <NoticeModal
        open={Boolean(notice)}
        title={notice?.title || ""}
        message={notice?.message}
        confirmLabel="OK"
        onClose={() => {
          setNotice(null);
          load();
        }}
      />
    </div>
  );
}

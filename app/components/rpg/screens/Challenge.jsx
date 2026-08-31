"use client";

// Universe / Challenge screen (Figma 2026:3323): pick a planet boss, see the
// power gate, start a battle. The planet spheres are pure CSS radial
// gradients lifted from the design's vectors; the boss's own character art
// sits on the sphere so each row shows the boss it actually fights.
//
// Every stat (power required, HP, unlock state, reward slot) comes from
// /avatar/member-challenge/status/ — the art is the only local part.

import { useEffect, useState } from "react";
import { RPG_COLORS, RPG_FONTS } from "../constants";
import { RPG_IMAGES, bossArtFor } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta } from "../primitives";
import { useRpgSkin } from "../rpgSkin";
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
      {/* The boss standing on its planet — the same sprite the battle uses, so
          the row previews exactly who you're about to fight. */}
      <img
        src={bossArtFor(boss.id)}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-[16px] left-1/2 h-[52px] w-auto -translate-x-1/2 object-contain"
        style={{
          filter: locked
            ? "grayscale(1) brightness(0.5) drop-shadow(0 3px 5px rgba(0,0,0,0.6))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,0.55))",
          opacity: locked ? 0.55 : 1,
        }}
      />
    </div>
  );
}

export default function Challenge({ onBattleStart }) {
  const skin = useRpgSkin();
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
          // Default to the strongest boss the player can actually beat.
          const unlocked = d.bosses.filter((b) => !b.locked);
          return unlocked.length ? unlocked[unlocked.length - 1].id : null;
        });
      })
      .catch((err) => setNotice({ title: "CANNOT LOAD", message: err?.message || "Try again later." }));
  };

  useEffect(load, []);

  const selected = data?.bosses?.find((b) => b.id === selectedId) || null;
  const extraCost = data?.extraAttemptCost ?? 10;
  const freeLeft = data?.freeAttemptsRemaining ?? 0;

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
        style={{ color: skin.c.title, fontFamily: RPG_FONTS.display, textShadow: skin.c.titleShadow }}
      >
        UNIVERSE
      </h2>
      <p className="mt-[4px] pb-[2px] text-center text-[12px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
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
                  ? {
                      background: skin.c.rowLocked,
                      borderColor: skin.c.edgeSoft,
                      opacity: 0.62,
                    }
                  : {
                      background: isSelected ? skin.c.rowActive : skin.c.rowIdle,
                      borderColor: isSelected ? skin.hud.badgeBorder : skin.c.edgeSoft,
                      boxShadow: isSelected ? `0 0 14px ${skin.hud.badgeBorder}59` : "none",
                    }
              }
            >
              <Planet boss={boss} locked={boss.locked} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-[6px] text-[15px] font-bold" style={{ color: skin.c.text, fontFamily: RPG_FONTS.display }}>
                  {boss.name}
                  {boss.locked ? <span className="text-[12px]">🔒</span> : null}
                </span>
                <span className="pt-[2px] text-[9px] font-semibold tracking-[1px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
                  POWER REQUIRED
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ color: boss.locked ? "#ff8faf" : skin.c.accent, fontFamily: RPG_FONTS.number }}
                >
                  {boss.locked ? `${fmt(boss.requiredPower)} — need ${fmt(boss.deficit)} more` : fmt(boss.requiredPower)}
                </span>
              </div>
              <div
                className="flex flex-col items-center gap-[4px] rounded-[12px] border px-[11px] py-[9px]"
                style={
                  { background: skin.hud.badgeBg, borderColor: skin.c.edgeSoft }
                }
              >
                <img src={RPG_IMAGES.equipment[boss.rewardSlot]} alt="" className="size-[20px]" />
                <span className="text-[9px] font-bold uppercase tracking-[1px]" style={{ color: skin.c.slotLabel, fontFamily: RPG_FONTS.display }}>
                  {boss.rewardSlot}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="pt-[14px] text-center text-[11px]" style={{ color: skin.c.slotEmpty, fontFamily: RPG_FONTS.display }}>
        {freeLeft > 0
          ? `${freeLeft} free attempt${freeLeft > 1 ? "s" : ""} left today`
          : "No free attempts left today"}{" "}
        · extra attempt {extraCost} Tokens · reward 1 Mystery Box
      </p>
      {data?.unopenedBoxes > 0 ? (
        <p className="pt-[4px] text-center text-[11px] font-bold" style={{ color: skin.c.value, fontFamily: RPG_FONTS.display }}>
          You have {data.unopenedBoxes} unopened Mystery Box{data.unopenedBoxes > 1 ? "es" : ""}
        </p>
      ) : null}

      <div className="px-[6px] pb-[6px] pt-[14px]">
        <GoldCta onClick={handleChallenge} disabled={!selected || busy}>
          {busy ? "ENTERING..." : "CHALLENGE"}
        </GoldCta>
      </div>

      <NoticeModal
        open={confirmPaid}
        title="EXTRA ATTEMPT"
        message={`Your free attempts are used for today. Challenge again for ${extraCost} Tokens? You have ${fmt(data?.tokens ?? 0)}.`}
        confirmLabel={`PAY ${extraCost} TOKENS`}
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

"use client";

// How-to-play modal opened from the top bar info icon. Also hosts the
// "reset progress" action — useful while the game runs on the mock service.

import { useState } from "react";
import { RPG_COLORS, RPG_FONTS, EXTRA_ATTEMPT_COST, DISCARD_COST } from "./constants";
import { GoldCta } from "./primitives";
import * as rpgApi from "./rpgApi";
import NoticeModal from "./NoticeModal";

const RULES = [
  ["LEVEL UP", "Spend Battle Points (BP) to level your avatar — BP cost = current level × 100. Each level grants +500 Power."],
  ["EQUIP GEAR", "Weapons, helmets, armor and boots each add +1,000 Power. Spare gear lives in your backpack (100 slots)."],
  ["CHALLENGE BOSSES", `Each planet boss needs a minimum Power. Roll the dice — every pip is an attack. One free attempt daily; extras cost ${EXTRA_ATTEMPT_COST} Tokens.`],
  ["MYSTERY BOXES", "Every boss kill drops a Mystery Box with Tokens, BP, free credit, rare gear or instant level-ups."],
  ["EARN MORE", `Missions and the daily check-in pay Tokens and BP. Discarding gear costs ${DISCARD_COST} Tokens per item.`],
];

export default function InfoModal({ open, onClose, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleReset = async () => {
    setBusy(true);
    try {
      const profile = await rpgApi.resetRpgState();
      onReset(profile);
    } finally {
      setBusy(false);
      setConfirmReset(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[78vh] w-full max-w-[350px] overflow-y-auto rounded-[18px] border p-[22px]"
        style={{
          background: "rgba(10,14,24,0.97)",
          borderColor: RPG_COLORS.violetBorder,
          boxShadow: "0 16px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124,77,255,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[18px] font-bold tracking-[3px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
          HOW TO PLAY
        </p>
        <div className="mt-[14px] flex flex-col gap-[12px]">
          {RULES.map(([title, body]) => (
            <div key={title}>
              <p className="text-[11px] font-bold tracking-[2px]" style={{ color: RPG_COLORS.cyan, fontFamily: RPG_FONTS.display }}>
                {title}
              </p>
              <p className="mt-[3px] text-[12px] leading-[17px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
                {body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-[18px]">
          <GoldCta onClick={onClose} glow={false} className="!p-[12px] !text-[13px]">
            GOT IT
          </GoldCta>
        </div>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="mt-[12px] w-full text-center text-[10px] tracking-[1px] underline underline-offset-2"
          style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}
        >
          Reset game progress
        </button>
      </div>

      <NoticeModal
        open={confirmReset}
        title="RESET PROGRESS?"
        message="Your hero, level, equipment, tokens and BP will be wiped. This cannot be undone."
        confirmLabel="RESET EVERYTHING"
        cancelLabel="KEEP PLAYING"
        busy={busy}
        onConfirm={handleReset}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}

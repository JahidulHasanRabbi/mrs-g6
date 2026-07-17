"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SMASH_EGG_ASSETS } from "./smashEggAssets";

/**
 * Themed "You Won" result modal for the skinned Smash Egg pages.
 *
 * Same content + actions as the default portal's SmashEggResultModal (title,
 * prize summary, "Return to website (Claim)" + "Close" — no Download Now), but
 * dressed in the active theme's ornate popup frame (public/assets/<theme>-popup.png)
 * instead of the flat dark-glass panel. The frame renders at its native aspect
 * (no stretch); the celebratory content sits centred in its interior and the
 * action buttons sit BELOW the frame — the same composition the themed Figma
 * dialogs use, so the crown/flourish art is never overlapped.
 */
function RewardImage({ image, name }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className="h-[26px] w-[26px] rounded object-cover" />;
  }
  return (
    <img
      src={SMASH_EGG_ASSETS.coinsIcon}
      alt=""
      className="h-[26px] w-[26px] shrink-0 object-contain"
      draggable={false}
    />
  );
}

function ThemedPrize({ prize }) {
  if (!prize) return null;
  const items = Array.isArray(prize.items) ? prize.items : [];

  if (items.length > 0) {
    return (
      <div className="flex max-h-[150px] w-full flex-col gap-2 overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div
            key={`${item.uuid || item.name}-${index}`}
            className="grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[rgba(242,203,122,0.45)] bg-black/40 px-3 py-[9px]"
          >
            <RewardImage image={item.image} name={item.name} />
            <p
              className="min-w-0 truncate text-[12px] leading-[16px] text-[#f6e6c2]"
              style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
              title={item.name}
            >
              {item.name}
            </p>
            <p
              className="text-[12px] leading-[16px] text-[#ffe16d]"
              style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif" }}
            >
              x{item.count}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(242,203,122,0.45)] bg-black/40 px-[17px] py-[9px]">
      <RewardImage name={prize.label} />
      <p
        className="max-w-full break-words text-center text-[13px] leading-[18px] text-[#f6e6c2]"
        style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif" }}
      >
        {prize.label}
      </p>
    </div>
  );
}

export default function ThemedResultModal({
  isOpen,
  onClose,
  onReturn,
  prize,
  frameBg,
  insets = { x: "10%", top: "18%", bottom: "13%" },
  titleColor = "#fff6df",
  // Optional themed button component (e.g. KgameButton). When provided the
  // actions render as the skin's ornate buttons instead of the default plain
  // gold/dark pills, so the popup matches the active theme.
  Button = null,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          <motion.div
            className="relative z-10 flex w-full max-w-[360px] flex-col items-center gap-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Ornate themed frame (native aspect) holding the celebratory
                heading + prize. */}
            <div className="relative w-full">
              <img
                src={frameBg}
                alt=""
                aria-hidden="true"
                className="block w-full select-none pointer-events-none"
                draggable={false}
              />
              <div
                className="absolute flex flex-col items-center justify-center gap-3"
                style={{ left: insets.x, right: insets.x, top: insets.top, bottom: insets.bottom }}
              >
                <h2
                  className="text-center text-xl uppercase leading-[30px] tracking-[2px]"
                  style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif", color: titleColor }}
                >
                  You Won
                </h2>
                <ThemedPrize prize={prize} />
              </div>
            </div>

            {/* Actions below the frame (Figma composition — never overlaps the
                frame art). Same actions as the default portal. */}
            <div className="flex w-full max-w-[320px] flex-col items-center gap-3">
              {Button ? (
                <>
                  {onReturn && (
                    <Button variant="gold" textSize={14} onClick={onReturn}>
                      Return to website (Claim)
                    </Button>
                  )}
                  <Button variant="dark" textSize={17} onClick={onClose}>
                    Close
                  </Button>
                </>
              ) : (
                <>
                  {onReturn && (
                    <button
                      onClick={onReturn}
                      className="w-full cursor-pointer rounded-xl border-b-4 border-[#3a3000] py-4 text-base leading-4 text-[#3a3000]"
                      style={{
                        fontFamily: "var(--font-acme), 'Acme', sans-serif",
                        background: "linear-gradient(to bottom, #ffd700, #544600)",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                      }}
                    >
                      Return to website (Claim)
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full cursor-pointer rounded-xl border border-[#fff6df]/30 py-4 text-base leading-4 text-[#fff6df]"
                    style={{
                      fontFamily: "var(--font-acme), 'Acme', sans-serif",
                      background: "rgba(0,0,0,0.45)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                    }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

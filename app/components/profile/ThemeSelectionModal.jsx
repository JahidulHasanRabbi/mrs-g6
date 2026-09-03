"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../../contexts/ThemeContext";
import { getMemberModalStyles } from "../../config/memberThemeStyles";
import {
  SELECTABLE_THEMES,
  getThemeLabel,
  readPinnedThemeId,
  readStationThemeId,
} from "../../config/themes";

/**
 * Station-theme picker, twin of <FrameSelectionModal> — same shell, same
 * palette pack. Picking applies immediately and is remembered across stations;
 * the reset row hands the skin back to whichever station the member enters from.
 */
export default function ThemeSelectionModal({ isOpen, onClose }) {
  const { themeId, setTheme, resetTheme } = useTheme();
  const { bg: modalBg, muted, checkBg, checkStroke } = getMemberModalStyles(themeId);

  // Closed, this renders nothing, so these storage reads never hit SSR.
  const isPinned = isOpen && !!readPinnedThemeId();
  const stationLabel = isOpen ? getThemeLabel(readStationThemeId()) : "";

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Choose theme"
            className="relative w-full max-w-[440px] rounded-2xl border-2 border-[#e9af41] shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            style={{ background: modalBg }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4">
              <h2 className="text-[#e9af41] text-[18px] font-bold font-['Times_New_Roman']">
                Choose Theme
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-[#e9af41] text-2xl leading-none hover:opacity-80"
              >
                ×
              </button>
            </div>

            <p className="px-5 pt-1 text-[11px] font-['Times_New_Roman']" style={{ color: muted }}>
              Pick any brand look you like. Your choice is remembered no matter
              which station you enter from.
            </p>

            <div className="grid grid-cols-3 gap-3 px-5 py-4 max-h-[60vh] overflow-y-auto">
              {SELECTABLE_THEMES.map((theme) => {
                const isActive = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setTheme(theme.id);
                      onClose();
                    }}
                    className={`group relative flex flex-col items-center rounded-xl p-2 transition-colors ${
                      isActive
                        ? "bg-[#e9af41]/20 ring-2 ring-[#e9af41]"
                        : "bg-black/30 hover:bg-[#e9af41]/10"
                    }`}
                  >
                    {/* next/image, not <img>: the crests are full-size hero art
                        (up to 1.5MB) and this cell is 62px tall. */}
                    <span className="relative h-[62px] w-full overflow-hidden">
                      <Image
                        src={theme.crest}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-contain"
                      />
                    </span>
                    <span className="mt-1 text-[11px] font-bold text-[#e9af41] font-['Times_New_Roman'] text-center leading-tight">
                      {theme.label}
                    </span>
                    {isActive && (
                      <span
                        className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ backgroundColor: checkBg }}
                      >
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6.2 L4.9 8.6 L9.5 3.6"
                            stroke={checkStroke}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isPinned && (
              <div className="px-5 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    resetTheme();
                    onClose();
                  }}
                  className="w-full rounded-lg border border-[#e9af41]/40 py-2 text-[11px] font-['Times_New_Roman'] hover:bg-[#e9af41]/10 transition-colors"
                  style={{ color: muted }}
                >
                  Use my station&apos;s theme ({stationLabel})
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

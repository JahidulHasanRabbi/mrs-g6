"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import ProfileFrame from "./ProfileFrame";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function FrameSelectionModal({
  isOpen,
  onClose,
  currentFrameId,
  onSelect,
  profilePicture,
}) {
  const { availableFrames, isLoadingFrames } = useUser();
  const { isAcebet77, isUbetclub, isEp369, isKgame99 } = useTheme();

  let modalBg, subtitleColor, tierColor, checkBg, checkStroke;
  if (isAcebet77) {
    modalBg = "linear-gradient(to bottom, #0a0805 0%, #17130c 100%)";
    subtitleColor = "#d0c6ab";
    tierColor = "#d0c6ab";
    checkBg = "#e9af41";
    checkStroke = "#171006";
  } else if (isUbetclub) {
    modalBg = "linear-gradient(to bottom, #18080a 0%, #3d0d10 100%)";
    subtitleColor = "#d8c9a0";
    tierColor = "#d8c9a0";
    checkBg = "#f2c36b";
    checkStroke = "#280506";
  } else if (isEp369) {
    modalBg = "linear-gradient(to bottom, #001002 0%, #0d3d1c 100%)";
    subtitleColor = "#bcd0a8";
    tierColor = "#bcd0a8";
    checkBg = "#e9af41";
    checkStroke = "#04140a";
  } else if (isKgame99) {
    modalBg = "linear-gradient(to bottom, #061527 0%, #0f2a4a 100%)";
    subtitleColor = "#a7c3e2";
    tierColor = "#a7c3e2";
    checkBg = "#e2b24a";
    checkStroke = "#0a1a2f";
  } else {
    modalBg = "linear-gradient(to bottom, #0a1a0a 0%, #102810 100%)";
    subtitleColor = "#a8c08a";
    tierColor = "#a8c08a";
    checkBg = "#3a8a2a";
    checkStroke = "#fff";
  }

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
            aria-label="Choose profile frame"
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
                Choose Profile Frame
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

            <p className="px-5 pt-1 text-[11px] font-['Times_New_Roman']" style={{ color: subtitleColor }}>
              Pick a frame to display around your photo. More frames will unlock
              with tournaments, events &amp; festivals.
            </p>

            {isLoadingFrames ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[#e9af41] text-sm">Loading frames...</div>
              </div>
            ) : availableFrames.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[#a8c08a] text-sm">No frames available</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 px-5 py-4 max-h-[60vh] overflow-y-auto">
                {availableFrames.map((frame) => {
                  const isActive = frame.id === currentFrameId || frame.uuid === currentFrameId;
                  return (
                    <button
                      key={frame.id || frame.uuid}
                      type="button"
                      onClick={() => {
                        onSelect(frame.id || frame.uuid);
                        onClose();
                      }}
                      className={`group relative flex flex-col items-center rounded-xl p-2 transition-colors ${
                        isActive
                          ? "bg-[#e9af41]/20 ring-2 ring-[#e9af41]"
                          : "bg-black/30 hover:bg-[#e9af41]/10"
                      }`}
                    >
                      <ProfileFrame
                        frameId={frame.id || frame.uuid}
                        src={profilePicture}
                        size={96}
                        animate={isActive}
                      />
                      <span className="mt-1 text-[11px] font-bold text-[#e9af41] font-['Times_New_Roman'] text-center leading-tight">
                        {frame.name}
                      </span>
                      {frame.vip_tier && (
                        <span className="text-[9px] font-['Times_New_Roman'] text-center" style={{ color: tierColor }}>
                          {frame.vip_tier}
                        </span>
                      )}
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

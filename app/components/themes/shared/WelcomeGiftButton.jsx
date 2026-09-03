"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMemberInfo, claimWelcomeGift } from "@/app/api/memberApi";
import { tokenStorage } from "@/app/api/tokenStorage";
import { handleApiError, formatErrorMessage } from "@/app/api/errorHandler";
import SuccessModal from "@/app/components/ui/SuccessModal";
import ThemedActionButton from "./ThemedActionButton";
import { useUser } from "@/app/contexts/UserContext";

// Renders the "Claim Welcome Gift" CTA beneath the themed profile card — only
// when the member's welcome_flag is false (unclaimed). Self-contained: fetches
// its own flag off member-info since UserContext doesn't track it.
export default function WelcomeGiftButton() {
  const { refreshUserData } = useUser();
  const [welcomeFlag, setWelcomeFlag] = useState(null); // null = loading, true = claimed, false = unclaimed
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claimError, setClaimError] = useState(null);

  useEffect(() => {
    fetchFlag();
  }, []);

  const fetchFlag = async () => {
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) return;

      const response = await getMemberInfo(memberUuid);
      if (response.welcome_flag !== undefined) {
        setWelcomeFlag(response.welcome_flag);
      }
    } catch (err) {
      console.error("WelcomeGiftButton: Error fetching welcome flag:", err);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimError(null);

    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        throw new Error("Member UUID not found");
      }

      await claimWelcomeGift(memberUuid);
      setWelcomeFlag(true);
      await refreshUserData();
      setShowSuccessModal(true);
    } catch (err) {
      const errorInfo = handleApiError(err, "WelcomeGiftButton.handleClaim");
      setClaimError(formatErrorMessage(errorInfo));
    } finally {
      setIsClaiming(false);
    }
  };

  if (welcomeFlag !== false) return null;

  return (
    <>
      <motion.div
        className="w-full max-w-[360px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex w-full justify-center">
          <ThemedActionButton
            textSize={16}
            disabled={isClaiming}
            onClick={handleClaim}
            fallback={
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#e9af41] to-[#d19a35] text-[#51340c] font-bold font-['Times_New_Roman'] text-[16px] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClaiming ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <span>🎁</span>
                    <span>Claim Welcome Gift</span>
                  </>
                )}
              </button>
            }
          >
            {isClaiming ? "Claiming..." : "Claim Welcome Gift"}
          </ThemedActionButton>
        </div>

        {claimError && (
          <p className="mt-2 text-red-500 text-sm text-center font-['Times_New_Roman']">
            {claimError}
          </p>
        )}
      </motion.div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎁 Welcome Gift Claimed!"
        message="Congratulations! Your welcome KR Coins have been added to your account."
        backgroundColor="rgba(96, 128, 60, 1)"
      />
    </>
  );
}

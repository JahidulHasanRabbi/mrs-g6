"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SmashEggHeader from "../components/smash-egg/SmashEggHeader";
import EggAnimation from "../components/smash-egg/EggAnimation";
import TokenBalance from "../components/smash-egg/TokenBalance";
import DrawButtons from "../components/smash-egg/DrawButtons";
import PrizeList from "../components/smash-egg/PrizeList";
import WinnerList from "../components/smash-egg/WinnerList";
import SmashEggTerms from "../components/smash-egg/SmashEggTerms";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { SMASH_EGG_ASSETS } from "../components/smash-egg/smashEggAssets";
import { useUser } from "../contexts/UserContext";
import SuccessModal from "../components/ui/SuccessModal";

export default function SmashEggPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalBgColor, setModalBgColor] = useState("rgba(96, 128, 60, 1)");
  const { userData } = useUser();

  const tokenBalance = userData?.balance ?? 0;

  const handleEggTap = useCallback(() => {
    if (isProcessing) return;
    setIsCracked((prev) => !prev);
  }, [isProcessing]);

  const handleDraw = useCallback(async (draws) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      setIsCracked(true);

      setTimeout(() => {
        setModalTitle("Smash Egg");
        setModalMessage(`${draws}x draw completed! Stay tuned for API integration.`);
        setModalBgColor("rgba(96, 128, 60, 1)");
        setIsModalOpen(true);
        setIsProcessing(false);
        setIsCracked(false);
      }, 1200);
    } catch {
      setIsProcessing(false);
      setIsCracked(false);
    }
  }, [isProcessing]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Page Background - covers entire scrollable area */}
      <div
        className="absolute inset-0 z-0 min-h-full"
        style={{
          background: "radial-gradient(ellipse at center top, #3b0202 0%, #3c0202 50%, #1a0a00 100%)",
        }}
      />

      {/* Header */}
      <SmashEggHeader onMenuClick={() => setIsMenuOpen(true)} />

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center gap-6 pt-20 pb-32">
        {/* Background Animation Layer */}
        <div className="absolute top-16 left-0 w-full h-[699px] overflow-hidden pointer-events-none">
          <Image
            src={SMASH_EGG_ASSETS.bgRays}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute -left-[81px] top-[71px] w-[552px] h-[556px]">
            <Image
              src={SMASH_EGG_ASSETS.bgGlow}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Token Balance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TokenBalance balance={tokenBalance} tokensPerRound={10} />
        </motion.div>

        {/* Egg Animation */}
        <motion.div
          className="relative z-10 mt-[-10px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <EggAnimation isCracked={isCracked} onTap={handleEggTap} />
        </motion.div>

        {/* Draw Buttons */}
        <motion.div
          className="w-full max-w-[390px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <DrawButtons onDraw={handleDraw} disabled={isProcessing} />
        </motion.div>

        {/* Prize List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <PrizeList />
        </motion.div>

        {/* Winner List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <WinnerList />
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <SmashEggTerms />
        </motion.div>
      </main>

      {/* Footer Nav */}
      <FooterNav />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        backgroundColor={modalBgColor}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import LuckySpinGrid from "../components/spin/LuckySpinGrid";
import SpinButtonsContainer from "../components/spin/SpinButtonsContainer";
import RewardsList from "../components/spin/RewardsList";
import WinningList from "../components/spin/WinningList";
import TermsConditions from "../components/spin/TermsConditions";
import SuccessModal from "../components/ui/SuccessModal";
import { oneSpin, tenSpin, fiftySpin, getMemberInfo } from "../api/memberApi";
import { mapSpinResults } from "../api/responseMappers";
import { tokenStorage } from "../api/tokenStorage";
import { useUser } from "../contexts/UserContext";

export default function SpinPage() {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalBgColor, setModalBgColor] = useState("rgba(96, 128, 60, 1)");
  const [isSpinning, setIsSpinning] = useState(false);
  const { updateBalance } = useUser();

  const memberUuid = tokenStorage.getMemberUuid();

  const refreshMemberInfo = async () => {
    if (!memberUuid) return;
    
    try {
      const memberInfo = await getMemberInfo(memberUuid);
      updateBalance(parseFloat(memberInfo.current_tokens).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    } catch (error) {
      console.error('Error refreshing member info:', error);
    }
  };

  const spinResultsRef = useRef(null);
  const spinErrorRef = useRef(null);

  const handleSpinComplete = () => {
    setIsSpinning(false);
    
    // Show modal after animation completes
    setTimeout(() => {
      if (spinErrorRef.current) {
        setModalTitle("❌ Spin Failed");
        setModalMessage(spinErrorRef.current);
        setModalBgColor("rgba(180, 60, 60, 1)");
        setIsModalOpen(true);
        spinErrorRef.current = null;
      } else if (spinResultsRef.current) {
        const results = spinResultsRef.current;
        if (results.length > 0) {
          const rewardsList = results.map(r => r.reward_name).join(", ");
          setModalTitle("🎉 Congratulations!");
          setModalMessage(`You won: ${rewardsList}`);
          setModalBgColor("rgba(96, 128, 60, 1)");
        } else {
          setModalTitle("✅ Spin Complete");
          setModalMessage("Spin completed successfully!");
          setModalBgColor("rgba(96, 128, 60, 1)");
        }
        setIsModalOpen(true);
        spinResultsRef.current = null;
      }
    }, 100);
  };

  const handleSpinAction = async (spinFunction, spinType) => {
    if (!memberUuid) {
      setModalTitle("❌ Error");
      setModalMessage("Please log in to spin.");
      setModalBgColor("rgba(180, 60, 60, 1)");
      setIsModalOpen(true);
      return;
    }

    if (isSpinning) return;

    try {
      setIsSpinning(true);
      spinResultsRef.current = null;
      spinErrorRef.current = null;
      
      const response = await spinFunction(memberUuid);
      const results = mapSpinResults(response);
      spinResultsRef.current = results;
      
      // Refresh token balance
      await refreshMemberInfo();
    } catch (error) {
      console.error(`Error during ${spinType}:`, error);
      spinErrorRef.current = error.message || "An error occurred. Please try again.";
    }
  };

  const handleCenterButtonClick = () => {
    handleSpinAction(oneSpin, "one spin");
  };

  const handleButtonClick = (buttonData) => {
    if (buttonData.spins === "10 Spins") {
      handleSpinAction(tenSpin, "ten spins");
    } else if (buttonData.spins === "50 Spins") {
      handleSpinAction(fiftySpin, "fifty spins");
    } else {
      console.log(`Button clicked: ${buttonData.spins}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <AnimatedSection title="" imageSrc='/assets/lucky-spin/lucky-spin.png' imageAlt="lucky spin" />

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.1} viewportAmount={0.3}>
          <div className="flex justify-center items-center py-8">
            <LuckySpinGrid onSpinClick={handleCenterButtonClick} isSpinning={isSpinning} disabled={isSpinning} onSpinComplete={handleSpinComplete} />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.15} viewportAmount={0.3}>
          <div className="flex justify-center px-4 py-4">
            <SpinButtonsContainer
              buttons={[
                { spins: "10 Spins", tokens: "100", className: "w-[140px] h-[60px]" },
                { spins: "50 Spins", tokens: "500", className: "w-[140px] h-[60px]" },
              ]}
              onButtonClick={handleButtonClick}
              disabled={isSpinning}
            />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.2} viewportAmount={0.3}>
          <div className="flex justify-center py-8">
            <RewardsList />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.25} viewportAmount={0.3}>
          <div className="flex sm: flex-wrap justify-center px-8 py-4">
            <SpinButtonsContainer
              buttons={[
                {
                  spins: "Winning Record",
                  image: "/assets/lucky-spin/buttons/winning.png",
                  className: "w-[200px] h-[80px]",
                },
                {
                  spins: "Winning List",
                  image: "/assets/lucky-spin/buttons/winning.png",
                  className: "w-[200px] h-[80px]",
                },
              ]}
              onButtonClick={handleButtonClick}
            />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.3} viewportAmount={0.3}>
          <div className="flex justify-center py-8">
            <WinningList />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.35} viewportAmount={0.3}>
          <div className="flex justify-center py-8 px-4">
            <TermsConditions />
          </div>
      </AnimatedSectionWrapper>

      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        backgroundColor={modalBgColor}
      />
    </>
  );
}

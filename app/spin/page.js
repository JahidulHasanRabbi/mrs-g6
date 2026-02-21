"use client";

import { useState } from "react";
import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import LuckySpinGrid from "../components/spin/LuckySpinGrid";
import SpinButtonsContainer from "../components/spin/SpinButtonsContainer";
import RewardsList from "../components/spin/RewardsList";
import WinningList from "../components/spin/WinningList";
import TermsConditions from "../components/spin/TermsConditions";

export default function SpinPage() {
  const [imageError, setImageError] = useState(false);

  const handleButtonClick = (buttonData) => {
    console.log(
      `Button clicked: ${buttonData.spins} spins for ${buttonData.tokens} tokens`,
    );
    // Add your button click logic here
  };

  return (
    <>
      <AnimatedSection title="" imageSrc='/assets/lucky-spin/lucky-spin.png' imageAlt="lucky spin" />

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.1} viewportAmount={0.3}>
          <div className="flex justify-center items-center py-8">
            <LuckySpinGrid />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.15} viewportAmount={0.3}>
          <div className="flex justify-center px-8 py-4">
            <SpinButtonsContainer
              buttons={[
                { spins: "10 Spins", tokens: "100" },
                { spins: "50 Spins", tokens: "500" },
              ]}
              onButtonClick={handleButtonClick}
            />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.2} viewportAmount={0.3}>
          <div className="flex justify-center py-8">
            <RewardsList />
          </div>
        </AnimatedSectionWrapper>

        <AnimatedSectionWrapper animation="fadeInUp" delay={0.25} viewportAmount={0.3}>
          <div className="flex justify-center px-8 py-4">
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
          <div className="flex justify-center py-8">
            <TermsConditions />
          </div>
      </AnimatedSectionWrapper>
    </>
  );
}

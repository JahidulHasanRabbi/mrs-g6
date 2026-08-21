"use client";

import { motion } from "framer-motion";
import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import FancyTermsConditions from "../components/spin/FancyTermsConditions";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import ThemedPageShell from "../components/themes/shared/ThemedPageShell";
import { ACEBET_ASSETS } from "../components/themes/acebet77/assets";
import { UBET_ASSETS } from "../components/themes/ubetclub/assets";
import { EP369_ASSETS } from "../components/themes/ep369/assets";
import { KGAME99_ASSETS } from "../components/themes/kgame99/assets";
import { LV918_ASSETS } from "../components/themes/lv918/assets";
import { N1GANG_ASSETS } from "../components/themes/n1gang/assets";

// Every skin draws the same body — heading text swapped for the theme's
// "Terms & Condition" plaque — so only the plaque differs per theme.
const TITLE_PLAQUE = {
  [THEME_IDS.ACEBET77]: ACEBET_ASSETS.terms.title,
  [THEME_IDS.UBETCLUB]: UBET_ASSETS.terms.title,
  [THEME_IDS.EP369]: EP369_ASSETS.terms.title,
  [THEME_IDS.KGAME99]: KGAME99_ASSETS.terms.title,
  [THEME_IDS.LV918]: LV918_ASSETS.terms.title,
  [THEME_IDS.N1GANG]: N1GANG_ASSETS.terms.title,
};

export default function TermsAndConditionsPage() {
  const { themeId } = useTheme();
  const plaque = TITLE_PLAQUE[themeId];

  if (plaque) {
    return (
      <ThemedPageShell>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={plaque}
            alt="Terms & Conditions"
            draggable={false}
            className="mt-5 mb-4 h-auto w-[340px] max-w-[92%] select-none object-contain"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          />
          <div className="w-full max-w-[500px]">
            <FancyTermsConditions />
          </div>
        </div>
      </ThemedPageShell>
    );
  }

  return (
    <>
      <AnimatedSection title="" imageSrc="/assets/terms-condition/terms-and-condition.png" imageAlt="terms and conditions" />
      <AnimatedSectionWrapper animation="fadeInUp" delay={0.14} viewportAmount={0.2}>
        <div className="mb-20 flex justify-center px-4 py-4">
          <FancyTermsConditions />
        </div>
      </AnimatedSectionWrapper>
    </>
  );
}

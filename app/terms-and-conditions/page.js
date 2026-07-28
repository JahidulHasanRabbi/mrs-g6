"use client";

import { motion } from "framer-motion";
import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import FancyTermsConditions from "../components/spin/FancyTermsConditions";
import { useTheme } from "../contexts/ThemeContext";
import AcebetShell from "../components/themes/acebet77/AcebetShell";
import UbetclubShell from "../components/themes/ubetclub/UbetclubShell";
import Ep369Shell from "../components/themes/ep369/Ep369Shell";
import KgameShell from "../components/themes/kgame99/KgameShell";
import Lv918Shell from "../components/themes/lv918/Lv918Shell";
import { ACEBET_ASSETS, ACEBET_COLORS } from "../components/themes/acebet77/assets";
import { UBET_ASSETS, UBET_COLORS } from "../components/themes/ubetclub/assets";
import { EP369_ASSETS, EP369_COLORS } from "../components/themes/ep369/assets";
import { KGAME99_ASSETS, KGAME99_COLORS } from "../components/themes/kgame99/assets";
import { LV918_ASSETS, LV918_COLORS } from "../components/themes/lv918/assets";
import N1gangShell from "../components/themes/n1gang/N1gangShell";
import { N1GANG_ASSETS, N1GANG_COLORS } from "../components/themes/n1gang/assets";

function ThemedTermsContent({ accent, muted }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 pb-8">
      <motion.div
        className="pb-6 pt-5 text-center"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 190, damping: 18 }}
      >
        <p
          className="text-[11px] uppercase tracking-[4px]"
          style={{ color: muted, fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Member Information
        </p>
        <h1
          className="mt-2 text-[28px] uppercase tracking-[2px]"
          style={{
            color: accent,
            fontFamily: "var(--font-acme), sans-serif",
            textShadow: `0 0 18px ${accent}55`,
          }}
        >
          Terms &amp; Conditions
        </h1>
      </motion.div>

      <div className="w-full pb-4">
        <FancyTermsConditions />
      </div>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918, isN1gang } = useTheme();

  // Same content structure as ThemedTermsContent (heading + FancyTermsConditions),
  // but the heading text is swapped for the acebet77 "Terms & Condition" plaque
  // image, and the terms body is wrapped in the ornate crown frame — assets
  // only, FancyTermsConditions and its data are unchanged.
  if (isAcebet77) {
    return (
      <AcebetShell bg={ACEBET_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={ACEBET_ASSETS.terms.title}
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
      </AcebetShell>
    );
  }

  // Same asset-swap treatment as acebet77 — heading text → plaque image,
  // FancyTermsConditions body wrapped inside the red crown ornate frame.
  // Same asset-swap treatment as acebet77 — heading text → plaque image,
  // FancyTermsConditions body wrapped inside the red crown ornate frame.
  // The ubetclub crown frame has wider side ornaments and a taller crown
  // than acebet77's, so use deeper padding here than the acebet77 branch.
  if (isUbetclub) {
    return (
      <UbetclubShell bg={UBET_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={UBET_ASSETS.terms.title}
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
      </UbetclubShell>
    );
  }

  if (isEp369) {
    return (
      <Ep369Shell bg={EP369_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={EP369_ASSETS.terms.title}
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
      </Ep369Shell>
    );
  }

  if (isKgame99) {
    return (
      <KgameShell bg={KGAME99_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={KGAME99_ASSETS.terms.title}
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
      </KgameShell>
    );
  }

  if (isLv918) {
    return (
      <Lv918Shell bg={LV918_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={LV918_ASSETS.terms.title}
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
      </Lv918Shell>
    );
  }

  if (isN1gang) {
    return (
      <N1gangShell bg={N1GANG_ASSETS.spin.bg}>
        <div className="flex min-h-screen flex-col items-center px-4 pb-8">
          <motion.img
            src={N1GANG_ASSETS.terms.title}
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
      </N1gangShell>
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

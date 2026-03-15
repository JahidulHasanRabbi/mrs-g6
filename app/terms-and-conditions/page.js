"use client";

import AnimatedSection from "../components/ui/AnimatedSection";
import AnimatedSectionWrapper from "../components/ui/AnimatedSectionWrapper";
import FancyTermsConditions from "../components/spin/FancyTermsConditions";

export default function TermsAndConditionsPage() {
  return (
    <>
      <AnimatedSection title="" imageSrc='/assets/terms-condition/terms & condition.png' imageAlt="lucky spin" />
      <AnimatedSectionWrapper animation="fadeInUp" delay={0.14} viewportAmount={0.2}>
        <div className="flex justify-center px-4 py-4 mb-20">
          <FancyTermsConditions />
        </div>
      </AnimatedSectionWrapper>
    </>
  );
}

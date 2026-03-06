"use client";

import { memo } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { HOME_ASSETS } from "./homeAssets";

const HomeHero = memo(function HomeHero() {
  return (
    <AnimatedSection
      title="HOMEPAGE"
      imageSrc={HOME_ASSETS.heroTitleCheckin}
      imageAlt="Check in"
    />
  );
});

export default HomeHero;

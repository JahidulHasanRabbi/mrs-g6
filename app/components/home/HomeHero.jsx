"use client";

import AnimatedSection from "../ui/AnimatedSection";
import { HOME_ASSETS } from "./homeAssets";

export default function HomeHero() {
  return (
    <AnimatedSection
      title="HOMEPAGE"
      imageSrc={HOME_ASSETS.heroTitleCheckin}
      imageAlt="Check in"
    />
  );
}

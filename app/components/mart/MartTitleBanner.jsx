"use client";

import AnimatedSection from "../ui/AnimatedSection";
import { MART_ASSETS } from "./martAssets";

export default function MartTitleBanner() {
  return (
     <AnimatedSection
         title=""
         imageSrc={MART_ASSETS.titleBanner}
         imageAlt="Check in"
       />
  );
}

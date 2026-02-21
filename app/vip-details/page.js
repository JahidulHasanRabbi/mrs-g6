"use client";
import AnimatedSection from "../components/ui/AnimatedSection";
import VipLevelChain from "../components/vip-details/VipLevelChain";
import PrivilegesCard from "../components/vip-details/PrivilegesCard";

export default function VipDetailsPage() {
  return (
    <>
      <AnimatedSection
        title=""
        imageSrc="/assets/vip-details/vip-details-title.png"
        imageAlt="VIP Details"
      />

      <main className="w-full px-4">
        {/* VIP Level Chain */}
        <div className="mt-8">
          <VipLevelChain />
        </div>

        {/* Privileges Card */}
        <div className="mt-12 mb-8">
          <PrivilegesCard level="Bronze" />
        </div>
      </main>
    </>
  );
}

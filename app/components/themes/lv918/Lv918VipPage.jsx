"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import VipLevelChain from "../../vip-details/VipLevelChain";
import PrivilegesCarousel from "../../vip-details/PrivilegesCarousel";
import LoadingState from "../../ui/LoadingState";
import ErrorDisplay from "../../ui/ErrorDisplay";
import { LV918_ASSETS } from "./assets";
import { getVipTiers } from "../../../api/memberApi";
import { mapVipTiers } from "../../../api/responseMappers";

export default function Lv918VipPage() {
  const [selectedLevel, setSelectedLevel] = useState("Bronze");
  const [vipTiers, setVipTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVipTiers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getVipTiers();
        const mappedTiers = mapVipTiers(response);
        setVipTiers(mappedTiers);
        if (mappedTiers.length > 0) setSelectedLevel(mappedTiers[0].name);
      } catch (err) {
        console.error("Failed to fetch VIP tiers:", err);
        setError(err.message || "Failed to load VIP tier information");
      } finally {
        setIsLoading(false);
      }
    }
    fetchVipTiers();
  }, []);

  const displayTiers = useMemo(() => vipTiers, [vipTiers]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    getVipTiers()
      .then((response) => {
        const mappedTiers = mapVipTiers(response);
        setVipTiers(mappedTiers);
        if (mappedTiers.length > 0) setSelectedLevel(mappedTiers[0].name);
      })
      .catch((err) => {
        console.error("Failed to fetch VIP tiers:", err);
        setError(err.message || "Failed to load VIP tier information");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <div className="flex w-full justify-center pt-2">
        <motion.img
          src={LV918_ASSETS.vip.title}
          alt="VIP Details"
          draggable={false}
          className="h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />
      </div>

      <main className="relative w-full px-4">
        {isLoading ? (
          <div className="mt-8">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="mt-8">
            <ErrorDisplay message={error} onRetry={handleRetry} />
          </div>
        ) : (
          <>
            <div className="relative mt-2 -mx-4">
              <VipLevelChain
                selectedLevel={selectedLevel}
                onLevelSelect={setSelectedLevel}
                vipTiers={displayTiers}
              />
            </div>
            <div className="relative mt-2 mb-8 -mx-4">
              <PrivilegesCarousel
                tiers={displayTiers}
                activeName={selectedLevel}
                onSelect={setSelectedLevel}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

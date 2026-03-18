"use client";
import { useState, useEffect } from "react";
import AnimatedSection from "../components/ui/AnimatedSection";
import VipLevelChain from "../components/vip-details/VipLevelChain";
import PrivilegesCard from "../components/vip-details/PrivilegesCard";
import LoadingState from "../components/ui/LoadingState";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { getVipTiers } from "../api/memberApi";
import { mapVipTiers } from "../api/responseMappers";

export default function VipDetailsPage() {
  const [selectedLevel, setSelectedLevel] = useState(null);
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
        
        // Set first tier as default selected level
        if (mappedTiers.length > 0) {
          setSelectedLevel(mappedTiers[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch VIP tiers:', err);
        setError(err.message || 'Failed to load VIP tier information');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVipTiers();
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    getVipTiers()
      .then(response => {
        const mappedTiers = mapVipTiers(response);
        setVipTiers(mappedTiers);
        if (mappedTiers.length > 0) {
          setSelectedLevel(mappedTiers[0].name);
        }
      })
      .catch(err => {
        console.error('Failed to fetch VIP tiers:', err);
        setError(err.message || 'Failed to load VIP tier information');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const selectedTierIndex = vipTiers.findIndex(tier => tier.name === selectedLevel);
  const selectedTierData = vipTiers[Math.max(0, selectedTierIndex)];

  return (
    <>
      <AnimatedSection
        title=""
        imageSrc="/assets/vip-details/vip-details-title.png"
        imageAlt="VIP Details"
      />

      <main className="w-full px-4">
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
            {/* VIP Level Chain */}
            <div className="mt-8">
              <VipLevelChain 
                selectedLevel={selectedLevel} 
                onLevelSelect={setSelectedLevel}
                vipTiers={vipTiers}
              />
            </div>

            {/* Privileges Card */}
            <div className="mt-12 mb-8">
              <PrivilegesCard 
                level={selectedLevel}
                tierData={selectedTierData}
                tierIndex={Math.max(0, selectedTierIndex)}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

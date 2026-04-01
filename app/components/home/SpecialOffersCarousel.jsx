"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicBanners } from "@/app/api/memberApi";

/**
 * SpecialOffersCarousel Component
 * Auto-rotating carousel for special offers and promotions
 */
const SpecialOffersCarousel = memo(function SpecialOffersCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await getPublicBanners();
        console.log("Fetched banners:", data);
        
        // Filter active banners (active_until is in the future)
        const now = new Date();
        const activeBanners = data.filter(banner => {
          const activeUntil = new Date(banner.active_until);
          return activeUntil > now;
        });
        
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Keep empty array on error
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((current) => (current + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((current) => (current - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const handleBannerClick = useCallback((slug) => {
    if (slug) {
      window.open(slug, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, banners.length]);

  // Don't render if no banners
  if (loading) {
    return (
      <motion.section
        className="w-full px-4 py-6"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.16 }}
      >
        <h3
          className="text-3xl font-bold mb-4"
          style={{
            fontFamily: '"Times New Roman", serif',
            color: "#e9af41",
          }}
        >
          #Special For You
        </h3>
        <div className="relative overflow-hidden rounded-2xl" style={{ height: "270px" }}>
          <div className="flex items-center justify-center h-full text-[#e9af41]">
            Loading banners...
          </div>
        </div>
      </motion.section>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show section if no banners
  }

  return (
    <motion.section
      className="w-full px-4 py-6"
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.16 }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Section Title */}
      <h3
        className="text-3xl font-bold mb-4"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: "#e9af41",
        }}
      >
        #Special For You
      </h3>

      {/* Carousel Container */}
      <div className="relative">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            height: "270px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => handleBannerClick(banners[currentSlide]?.slug)}
            >
              <img
                src={banners[currentSlide]?.image}
                alt={banners[currentSlide]?.name || "Banner"}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Only show if more than 1 banner */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                aria-label="Next slide"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-[#e9af41] w-6"
                    : "bg-[#e9af41]/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
});

export default SpecialOffersCarousel;

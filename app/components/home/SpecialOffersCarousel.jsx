"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SpecialOffersCarousel Component
 * Auto-rotating carousel for special offers and promotions
 */
export default function SpecialOffersCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/assets/home/special_for_you/free_share_bonus.png",
    },
    {
      id: 2,
      image: "/assets/home/special_for_you/free_share_bonus.png",
    },
    {
      id: 3,
      image: "/assets/home/special_for_you/free_share_bonus.png",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="w-full px-4 py-6">
      {/* Section Title */}
      <h3
        className="text-lg font-bold mb-4"
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
            // border: "3px solid #e9af41",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={slides[currentSlide].image}
                alt="Special offer"
                fill
                className="object-contain"
                sizes="(max-width: 475px) 100vw, 475px"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: currentSlide === index ? "#e9af41" : "#4a4a4a",
                transform: currentSlide === index ? "scale(1.2)" : "scale(1)",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

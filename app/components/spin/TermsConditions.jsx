"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";
import { getPublicTermsAndConditions } from "@/app/api/memberApi";

const TermItem = ({ text, index }) => (
  <motion.div 
    className="flex items-start gap-3 mb-4"
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.15,
      ease: "easeOut"
    }}
    whileHover={{ x: 5 }}
  >
    <motion.div 
      className="relative w-[18px] h-[18px] shrink-0 mt-1"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.15 + 0.1,
        ease: "easeOut"
      }}
    >
      <Image
        alt="Bullet"
        src={SPIN_ASSETS.bulletIcon}
        fill
        className="object-contain"
        sizes="12px"
      />
    </motion.div>
    <p className="text-white text-[11px] font-semibold leading-[1.4]">{text}</p>
  </motion.div>
);

export default function TermsConditions() {
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      // Category 1 = Lucky Spin
      const response = await getPublicTermsAndConditions(1);
      
      if (response?.terms_and_conditions) {
        // Split by newlines and filter out empty lines
        const termsArray = response.terms_and_conditions
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        setTerms(termsArray);
      } else {
        setTerms([]);
      }
    } catch (err) {
      console.error('Failed to load terms and conditions:', err);
      setTerms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no terms available
  if (!isLoading && terms.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="relative w-full max-w-[450px] mx-auto rounded-[6px] p-5"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        boxShadow: "0px 0px 10px 0px rgba(233, 175, 65, 0.3)"
      }}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div 
        className="bg-[#e9af41] rounded-[6px] px-4 py-2 inline-block mb-5"
        style={{ boxShadow: "1px 4px 11px 0px rgba(0, 0, 0, 0.1)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
      >
        <p className="text-white text-[12px] font-semibold text-center">Terms & Condition</p>
      </motion.div>
      
      {isLoading ? (
        <div className="text-center text-white/60 text-sm py-4">
          Loading terms...
        </div>
      ) : (
        <div className="space-y-2">
          {terms.map((term, index) => (
            <TermItem key={index} index={index} text={term} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

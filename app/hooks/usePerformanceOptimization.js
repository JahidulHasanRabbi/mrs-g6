"use client";

import { useEffect, useState } from 'react';

export const usePerformanceOptimization = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isMidEnd, setIsMidEnd] = useState(false);

  useEffect(() => {
    // Detect device performance
    const checkPerformance = () => {
      // Check hardware concurrency (CPU cores)
      const cpuCores = navigator.hardwareConcurrency || 4;
      
      // Check device memory (if available)
      const deviceMemory = navigator.deviceMemory || 4;
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Simple performance test
      const start = performance.now();
      let iterations = 1000000;
      for (let i = 0; i < iterations; i++) {
        Math.random();
      }
      const end = performance.now();
      const computeTime = end - start;
      
      // Determine device tier
      const isLowEndDevice = 
        cpuCores <= 4 || 
        deviceMemory <= 2 || 
        computeTime > 10 ||
        prefersReducedMotion;
      
      const isMidEndDevice = 
        !isLowEndDevice && 
        (cpuCores <= 6 || 
         deviceMemory <= 6 || 
         computeTime > 5);
      
      setIsLowEnd(isLowEndDevice);
      setIsMidEnd(isMidEndDevice);
    };

    checkPerformance();
  }, []);

  return { isLowEnd, isMidEnd };
};

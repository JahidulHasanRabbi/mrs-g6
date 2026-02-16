"use client";

import { useEffect, useCallback } from 'react';

/**
 * Custom hook for hamburger menu behavior
 * Handles accessibility, keyboard navigation, and body scroll lock
 */
export function useHamburgerMenu(isOpen, onClose) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  return { handleEscape };
}

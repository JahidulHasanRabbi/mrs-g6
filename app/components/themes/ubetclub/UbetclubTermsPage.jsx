"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UbetclubShell from "./UbetclubShell";
import { UBET_ASSETS, UBET_COLORS } from "./assets";
import { getPublicTermsAndConditions } from "../../../api/memberApi";

/**
 * Ubetclub Terms & Conditions (Figma 289:2298). Mirrors the acebet77 terms
 * page — title plaque + red crown ornate frame around the terms body — with
 * the ubetclub palette. Fetches the same public terms endpoint (category 1);
 * no data or logic changes.
 */
export default function UbetclubTermsPage() {
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchTerms() {
      try {
        const response = await getPublicTermsAndConditions(1);
        if (!cancelled) setTermsText(response?.terms_and_conditions ?? "");
      } catch (error) {
        console.error("Failed to load terms:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTerms();
    return () => {
      cancelled = true;
    };
  }, []);

  const terms = String(termsText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <UbetclubShell bg={UBET_ASSETS.spin.bg}>
      <div className="flex flex-col items-center gap-6 px-4">
        <motion.img
          src={UBET_ASSETS.terms.title}
          alt="Terms & Conditions"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <motion.div
          className="relative w-full max-w-[380px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
        >
          <div className="relative aspect-[1448/1086] w-full">
            <img
              src={UBET_ASSETS.frames.crown}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
            />
            <div className="absolute inset-x-[14%] top-[26%] bottom-[13%] overflow-y-auto pr-1 scrollbar-ubet">
              {loading ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: UBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Loading terms…
                </p>
              ) : terms.length === 0 ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: UBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  No terms and conditions available.
                </p>
              ) : (
                <ul className="space-y-2">
                  {terms.map((line, i) => (
                    <li
                      key={i}
                      className="text-[12.5px] leading-[1.5]"
                      style={{ color: UBET_COLORS.cream, fontFamily: "var(--font-rubik), sans-serif" }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </UbetclubShell>
  );
}

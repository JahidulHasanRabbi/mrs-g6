"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AcebetShell from "./AcebetShell";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";
import { getPublicTermsAndConditions } from "../../../api/memberApi";

/**
 * Acebet77 Terms & Conditions (Figma 289:2399). Ornate crown frame containing
 * the terms text fetched from the public terms endpoint (category 1, same as
 * the Lucky Spin terms). Follows the shell/spin-bg pattern used by the other
 * themed acebet77 pages.
 */
export default function Acebet77TermsPage() {
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
    <AcebetShell bg={ACEBET_ASSETS.spin.bg}>
      <div className="flex flex-col items-center gap-6 px-4">
        {/* "Terms & Condition" title plaque */}
        <motion.img
          src={ACEBET_ASSETS.terms.title}
          alt="Terms & Conditions"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        {/* Ornate crown frame — the terms body lives inside its dark interior.
            The source art has ~14% of gold rail around the edges, so pad the
            content by that much and let the frame size follow the text. */}
        <motion.div
          className="relative w-full max-w-[380px]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
        >
          <div className="relative aspect-[1448/1086] w-full">
            <img
              src={ACEBET_ASSETS.frames.crown}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
            />
            {/* Text well: sits inside the dark interior. The crown ornament
                takes up the top ~22%, the flourish under it another ~3%, so
                start the copy at ~26% and pad ~14% from each side to clear
                the gold rails. */}
            <div className="absolute inset-x-[14%] top-[26%] bottom-[13%] overflow-y-auto pr-1 [scrollbar-color:rgba(233,175,65,0.5)_transparent] [scrollbar-width:thin]">
              {loading ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: ACEBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Loading terms…
                </p>
              ) : terms.length === 0 ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: ACEBET_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  No terms and conditions available.
                </p>
              ) : (
                <ul className="space-y-2">
                  {terms.map((line, i) => (
                    <li
                      key={i}
                      className="text-[12.5px] leading-[1.5]"
                      style={{ color: ACEBET_COLORS.cream, fontFamily: "var(--font-rubik), sans-serif" }}
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
    </AcebetShell>
  );
}

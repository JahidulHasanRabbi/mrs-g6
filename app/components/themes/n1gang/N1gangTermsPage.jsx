"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import N1gangShell from "./N1gangShell";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";
import { getPublicTermsAndConditions } from "../../../api/memberApi";

export default function N1gangTermsPage() {
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
    <N1gangShell bg={N1GANG_ASSETS.spin.bg}>
      <div className="flex flex-col items-center gap-6 px-4">
        <motion.img
          src={N1GANG_ASSETS.terms.title}
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
              src={N1GANG_ASSETS.frames.panel}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-fill"
            />
            {/* The page already renders its own TERMS title above the panel, so
                the plate carries no header — content can start near the top. */}
            <div className="absolute inset-x-[13%] top-[14%] bottom-[13%] overflow-y-auto pr-1 scrollbar-n1gang">
              {loading ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: N1GANG_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Loading terms…
                </p>
              ) : terms.length === 0 ? (
                <p
                  className="pt-4 text-center text-[13px]"
                  style={{ color: N1GANG_COLORS.sand, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  No terms and conditions available.
                </p>
              ) : (
                <ul className="space-y-2">
                  {terms.map((line, i) => (
                    <li
                      key={i}
                      className="text-[12.5px] leading-[1.5]"
                      style={{ color: N1GANG_COLORS.cream, fontFamily: "var(--font-rubik), sans-serif" }}
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
    </N1gangShell>
  );
}

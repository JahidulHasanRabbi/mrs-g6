"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicTermsAndConditions } from "../../api/memberApi";
import { useTheme } from "../../contexts/ThemeContext";
import { getMemberThemeStyles } from "../../config/memberThemeStyles";

// Parse "title: X\ndescription: Y" format into sections array
function parseTextToSections(text) {
  if (!text || !text.trim()) return [];
  const sections = [];
  const blocks = text.split(/\n(?=title:)/i);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const titleMatch = trimmed.match(/^title:\s*(.+?)(?:\n|$)/i);
    const descMatch = trimmed.match(/description:\s*([\s\S]*?)$/i);
    if (titleMatch || descMatch) {
      sections.push({
        title: titleMatch ? titleMatch[1].trim() : "",
        description: descMatch ? descMatch[1].trim() : ""
      });
    }
  }
  return sections;
}

const CollapsibleTermItem = ({ number, title, description, index, appearance }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="mb-3 last:mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08 + 0.3,
        type: "spring",
        stiffness: 120,
      }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group cursor-pointer relative overflow-hidden rounded-[12px] p-5"
        style={{
          background: isExpanded ? appearance.itemExpanded : appearance.item,
          border: `1px solid ${isExpanded ? appearance.borderExpanded : appearance.border}`,
          boxShadow: isExpanded
            ? `0px 4px 20px ${appearance.glow}, inset 0px 1px 0px rgba(255,255,255,0.1)`
            : "0px 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
        }}
        whileHover={{
          scale: 1.01,
          boxShadow: `0px 6px 24px ${appearance.glow}, inset 0px 1px 0px rgba(255,255,255,0.15)`
        }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full shrink-0"
            style={{
              background: appearance.number,
              boxShadow: `0px 4px 12px ${appearance.glow}, inset 0px 1px 2px rgba(255,255,255,0.3)`,
            }}
          >
            <span
              className="text-[18px] font-extrabold"
              style={{ color: appearance.numberText, textShadow: "0px 1px 1px rgba(255,255,255,0.3)" }}
            >
              {number}
            </span>
          </div>
          <div className="flex-1">
            <h4
              className="text-[17px] font-bold leading-tight group-hover:text-[#fcd064] transition-colors"
              style={{
                color: isExpanded ? appearance.accentBright : appearance.accent,
                textShadow: "0px 2px 6px rgba(0,0,0,0.8)"
              }}
            >
              {title}
            </h4>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="text-[16px] font-bold shrink-0"
            style={{ color: appearance.accent, textShadow: "0px 2px 4px rgba(0,0,0,0.6)" }}
          >
            ▼
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="pl-[52px] pr-2">
                <p
                  className="text-[15px] font-medium leading-relaxed whitespace-pre-line"
                  style={{ color: appearance.text, textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export default function FancyTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { themeId, isAcebet77, isUbetclub } = useTheme();
  const appearance = getMemberThemeStyles(themeId).terms;
  // Themes that wrap this component inside their own ornate crown frame don't
  // want the extra corner brackets + ambient glow drawing a second container
  // inside the frame. terms.card is already set transparent for them; drop
  // the decorative chrome too so only the accordion items show.
  const isWrappedByThemeFrame = isAcebet77 || isUbetclub;

  useEffect(() => {
    async function fetchTerms() {
      try {
        // Category 8 = Main Page
        const data = await getPublicTermsAndConditions(8);
        const text = data?.terms_and_conditions || "";
        const parsed = parseTextToSections(text);
        setTerms(parsed);
      } catch (err) {
        console.error("Failed to load terms:", err);
        setTerms([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTerms();
  }, []);

  return (
    <motion.div
      className="relative w-full max-w-[500px] mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      {/* Main Card Container. On themes that wrap this in their own ornate
          frame (acebet77 / ubetclub) we drop the card shadow + outline ring
          so nothing paints a "second panel" inside the frame. */}
      <div
        className={`relative rounded-[24px] overflow-hidden ${isWrappedByThemeFrame ? "p-0" : "p-8 sm:p-10"}`}
        style={{
          background: appearance.card,
          boxShadow: isWrappedByThemeFrame
            ? "none"
            : `0px 20px 60px -10px rgba(0,0,0,0.8), 0px 0px 0px 1px ${appearance.borderExpanded}`,
          backdropFilter: isWrappedByThemeFrame ? "none" : "blur(20px)",
        }}
      >
        {/* Corner accents + ambient glow — only for the default card look.
            The theme frame's own crown/rails provide the border chrome. */}
        {!isWrappedByThemeFrame && (
          <>
            <div className="absolute top-0 left-0 w-16 h-16 border-t-[3px] border-l-[3px] rounded-tl-[24px] opacity-40" style={{ borderColor: appearance.accent }} />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-[3px] border-r-[3px] rounded-tr-[24px] opacity-40" style={{ borderColor: appearance.accent }} />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[3px] border-l-[3px] rounded-bl-[24px] opacity-40" style={{ borderColor: appearance.accent }} />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[3px] border-r-[3px] rounded-br-[24px] opacity-40" style={{ borderColor: appearance.accent }} />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[200px] rounded-full blur-[120px] opacity-[0.12] pointer-events-none"
              style={{ backgroundColor: appearance.accent }}
            />
          </>
        )}

        {/* Terms List */}
        <div className="space-y-3 relative">
          {isLoading ? (
            /* Loading skeleton */
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[12px] p-5 animate-pulse"
                style={{
                  background: appearance.item,
                  border: `1px solid ${appearance.border}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-[36px] h-[36px] rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 h-4 bg-white/10 rounded" />
                </div>
              </div>
            ))
          ) : terms.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: appearance.muted }}>
              No terms and conditions available.
            </div>
          ) : (
            terms.map((term, index) => (
              <CollapsibleTermItem
                key={index}
                number={index + 1}
                index={index}
                title={term.title}
                description={term.description}
                appearance={appearance}
              />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

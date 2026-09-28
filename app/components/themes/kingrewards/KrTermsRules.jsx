"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard, GoldText, OutlinePill } from "./KrUi";
import { KR_COLORS, KR_FONT } from "./assets";

const ACME = "var(--font-acme), cursive";
const RUBIK = "var(--font-rubik), sans-serif";

function Divider() {
  return <div className="h-px w-full" style={{ background: KR_COLORS.goldBright }} />;
}

function RuleItem({ number, title, description }) {
  const [open, setOpen] = useState(false);
  const heading = title || description;
  const body = title ? description : "";

  return (
    <button
      type="button"
      onClick={() => body && setOpen((v) => !v)}
      className={`flex w-full flex-col gap-1 rounded-r-[8px] p-3 text-left ${body ? "cursor-pointer" : "cursor-default"}`}
      aria-expanded={body ? open : undefined}
    >
      <GoldText className="block text-[10px]" style={{ fontFamily: ACME, lineHeight: "15px" }}>
        {String(number).padStart(2, "0")}
      </GoldText>
      <span className="flex w-full items-start justify-between gap-3">
        <span className="text-[16px] leading-6 whitespace-pre-line" style={{ fontFamily: RUBIK, color: KR_COLORS.cream }}>
          {heading}
        </span>
        {body && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="mt-1 shrink-0 text-[12px]"
            style={{ color: KR_COLORS.goldText }}
            aria-hidden="true"
          >
            ▼
          </motion.span>
        )}
      </span>
      <AnimatePresence initial={false}>
        {open && body && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="block overflow-hidden text-[14px] leading-[22px] whitespace-pre-line"
            style={{ fontFamily: RUBIK, color: "rgba(255,246,223,0.75)" }}
          >
            {body}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** King Rewards T&C card (Figma 707:3720): rules panel + Back. Terms are fetched by the caller. */
export default function KrTermsRules({ terms = [], loading = false, onBack }) {
  return (
    <GlassCard variant="solid" className="flex w-full flex-col gap-6 px-2 py-4">
      <div
        className="w-full rounded-[12px] p-[17px]"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: `1px solid ${KR_COLORS.goldBright}`,
          boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
        }}
      >
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Fragment key={i}>
                {i > 0 && <Divider />}
                <div className="flex animate-pulse flex-col gap-2 p-3">
                  <div className="h-2.5 w-5 rounded bg-white/15" />
                  <div className="h-4 w-2/3 rounded bg-white/15" />
                </div>
              </Fragment>
            ))}
          </div>
        ) : terms.length === 0 ? (
          <p className="py-6 text-center text-[14px]" style={{ fontFamily: KR_FONT, color: KR_COLORS.creamMuted }}>
            No terms and conditions available.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {terms.map((term, i) => (
              <Fragment key={i}>
                {i > 0 && <Divider />}
                <RuleItem number={i + 1} title={term.title} description={term.description} />
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {onBack && (
        <div className="flex w-full justify-between">
          <OutlinePill onClick={onBack}>Back</OutlinePill>
        </div>
      )}
    </GlassCard>
  );
}

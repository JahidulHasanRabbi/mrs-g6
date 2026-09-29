"use client";

import { Fragment } from "react";
import { GlassCard, GoldText, OutlinePill } from "./KrUi";
import { KR_COLORS, KR_FONT } from "./assets";

function Divider() {
  return <div className="h-px w-full" style={{ background: "rgba(255,240,102,0.35)" }} />;
}

// Rules stay fully open: the page scrolls, so nothing approved is hidden behind a toggle.
function RuleItem({ number, title, description }) {
  const heading = title || description;
  const body = title ? description : "";

  return (
    <div className="flex w-full flex-col gap-1 px-2 py-3 text-left">
      <GoldText className="block text-[12px] font-bold tracking-[0.5px]">{String(number).padStart(2, "0")}</GoldText>
      <p className="whitespace-pre-line text-[16px] font-semibold leading-[1.55] text-white [overflow-wrap:anywhere]">
        {heading}
      </p>
      {body && (
        <p className="whitespace-pre-line text-[15px] leading-[1.65] text-[rgba(255,255,255,0.88)] [overflow-wrap:anywhere]">
          {body}
        </p>
      )}
    </div>
  );
}

/** King Rewards T&C card (Figma 707:3720): rules panel + Back. Terms are fetched by the caller. */
export default function KrTermsRules({ terms = [], loading = false, onBack }) {
  return (
    <GlassCard variant="solid" className="mb-4 flex w-full flex-col gap-6 px-2 py-4" style={{ fontFamily: KR_FONT }}>
      <div
        className="w-full rounded-[12px] px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: `1px solid ${KR_COLORS.goldBright}`,
          boxShadow: "inset -2px 8px 8px rgba(165,196,255,0.25)",
        }}
      >
        {loading ? (
          <div className="flex flex-col gap-3 py-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Fragment key={i}>
                {i > 0 && <Divider />}
                <div className="flex animate-pulse flex-col gap-2 p-2">
                  <div className="h-2.5 w-5 rounded bg-white/15" />
                  <div className="h-4 w-2/3 rounded bg-white/15" />
                </div>
              </Fragment>
            ))}
          </div>
        ) : terms.length === 0 ? (
          <p className="py-6 text-center text-[15px] leading-6 text-white/80">No terms and conditions available.</p>
        ) : (
          <div className="flex flex-col">
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
        <div className="flex w-full justify-start">
          <OutlinePill onClick={onBack}>Back</OutlinePill>
        </div>
      )}
    </GlassCard>
  );
}

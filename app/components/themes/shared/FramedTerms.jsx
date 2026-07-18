"use client";

import FramedPanel from "./FramedPanel";
import FramedHeading from "./FramedHeading";
import { SMASH_EGG_ASSETS } from "../../smash-egg/smashEggAssets";

/** Shared Terms & Conditions on the theme's ornate frame, heading outside. */
export default function FramedTerms({ skin, termsText = "" }) {
  const terms = String(termsText || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FramedHeading gradient={skin.headingGradient}>Terms &amp; Conditions</FramedHeading>
      <FramedPanel skin={skin} height={250}>
        {terms.length === 0 ? (
          <p className="pt-2 text-[13px]" style={{ color: skin.c.empty, fontFamily: "var(--font-rubik), sans-serif" }}>
            No terms and conditions available.
          </p>
        ) : (
          terms.map((term, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <img src={SMASH_EGG_ASSETS.termsIcon} alt="" className="mt-[3px] h-4 w-[18px] shrink-0 object-contain" />
              <p className="flex-1 text-[13px] leading-5" style={{ color: skin.c.term, fontFamily: "var(--font-acme), sans-serif" }}>{term}</p>
            </div>
          ))
        )}
      </FramedPanel>
    </div>
  );
}

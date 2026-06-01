"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { COLORS } from "./constants";

const TERMS_INTRO =
  "By participating in the Penalty Kick game, users agree to follow all gameplay rules and maintain fair play at all times.";

const TERMS = [
  "Any use of cheats, exploits, automated software, or unauthorized modifications may result in suspension or permanent account termination. Players are responsible for maintaining the confidentiality of their account information and internet connection stability during gameplay.",
  "Rewards, rankings, and in-game items are subject to change without prior notice. The game provider reserves the right to update features, modify rules, or discontinue services when necessary.",
  "Continued use of the game confirms acceptance of all current terms, policies, and future updates or revisions.",
];

export default function TermsDialog({ onClose }) {
  return (
    <GlassCard>
      <div
        className="mb-4 w-full rounded-[4px] px-4 py-2 text-center text-[14px] tracking-[0.5px] uppercase"
        style={{
          backgroundColor: COLORS.greenSoft10,
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          lineHeight: "15px",
        }}
      >
        Terms & Condition
      </div>

      <p
        className="mb-2 text-[10px] leading-[24px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {TERMS_INTRO}
      </p>

      <ol
        className="mb-5 list-decimal space-y-0 pl-[18px] text-[10px] leading-[24px]"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        {TERMS.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      <GreenCta onClick={onClose} showPlayIcon={false}>
        Close
      </GreenCta>
    </GlassCard>
  );
}

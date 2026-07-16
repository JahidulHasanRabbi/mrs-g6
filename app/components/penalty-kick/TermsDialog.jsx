"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { usePkColors } from "./usePkColors";

const TERMS_INTRO =
  "By participating in the Penalty Kick game, users agree to follow all gameplay rules and maintain fair play at all times.";

const TERMS = [
  "Any use of cheats, exploits, automated software, or unauthorized modifications may result in suspension or permanent account termination. Players are responsible for maintaining the confidentiality of their account information and internet connection stability during gameplay.",
  "Rewards, rankings, and in-game items are subject to change without prior notice. The game provider reserves the right to update features, modify rules, or discontinue services when necessary.",
  "Continued use of the game confirms acceptance of all current terms, policies, and future updates or revisions.",
];

export default function TermsDialog({ onClose, termsText }) {
  const { colors: COLORS } = usePkColors();
  const hasApiValue = termsText !== null && termsText !== undefined;
  const lines = hasApiValue
    ? String(termsText).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : TERMS;
  const isEmptyApiValue = hasApiValue && lines.length === 0;

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
        {isEmptyApiValue ? "No terms and conditions available." : hasApiValue ? lines[0] : TERMS_INTRO}
      </p>

      {!isEmptyApiValue && lines.length > 1 && (
        <ol
          className="mb-5 list-decimal space-y-0 pl-[18px] text-[10px] leading-[24px]"
          style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
        >
          {lines.slice(1).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      )}

      <GreenCta onClick={onClose} showPlayIcon={false}>
        Close
      </GreenCta>
    </GlassCard>
  );
}

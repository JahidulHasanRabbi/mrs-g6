"use client";

import { PageTitle } from "../components/themes/kingrewards/KrUi";
import { KR_COLORS, KR_SURFACES } from "../components/themes/kingrewards/assets";

function SpeakerIcon({ muted }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
      {muted ? (
        <path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** KR stand-in for LBHeader's wordmark + sound toggle; the shell header already has menu and info. */
export default function KrWorldCupHeading({ muted, onSoundToggle }) {
  return (
    <div className="relative flex w-full items-center justify-center px-14 pb-2 pt-4">
      <PageTitle>Leaderboards</PageTitle>
      <button
        type="button"
        aria-label={muted ? "Unmute crowd sound" : "Mute crowd sound"}
        aria-pressed={muted}
        onClick={onSoundToggle}
        className="absolute right-4 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full active:scale-95"
        style={{ ...KR_SURFACES.solid, border: `1px solid ${KR_COLORS.goldBright}`, color: KR_COLORS.goldText }}
      >
        <SpeakerIcon muted={muted} />
      </button>
    </div>
  );
}

"use client";

import GoldButton from "./GoldButton";
import ThemedActionButton from "../../themes/shared/ThemedActionButton";
import { MISSION_COLORS } from "./data";

const ICONS = {
  target: "/assets/penalty-kick/missions/icon-target.svg",
  star: "/assets/penalty-kick/missions/icon-star.svg",
  bolt: "/assets/penalty-kick/missions/icon-bolt.svg",
};

// 48px leading glyph. "target" is a full-bleed overlay that ships with its own
// gold-tinted rounded background, so it renders bare. "star" / "bolt" are plain
// glyphs that sit inside a gold-tinted chip (Figma: rgba(255,221,116,0.2)).
function MissionIcon({ icon }) {
  if (icon === "target") {
    return (
      <img
        src={ICONS.target}
        alt=""
        aria-hidden="true"
        className="block size-12 shrink-0"
      />
    );
  }
  const size = icon === "star" ? { width: 25, height: 23.75 } : { width: 20, height: 25 };
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-[8px]"
      style={{ backgroundColor: MISSION_COLORS.iconChip }}
    >
      <img src={ICONS[icon]} alt="" aria-hidden="true" style={size} />
    </div>
  );
}

export default function MissionCard({ mission, onClaim, onJoin, actionLoading }) {
  const { icon, title, reward, badge, progress, status, description } = mission;
  const completed = status === "completed";
  const claimed = mission.claimed;
  const joined = mission.joined;
  const pct =
    progress.total > 0
      ? Math.min(100, (progress.current / progress.total) * 100)
      : 0;

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-[12px] p-[17px] backdrop-blur-[10px]"
      style={{
        backgroundColor: MISSION_COLORS.cardFill,
        border: `1px solid ${MISSION_COLORS.cardBorder}`,
        opacity: completed ? 1 : 0.9,
      }}
    >
      {/* Header: icon + title/reward, optional tab badge on the right */}
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex items-start gap-4">
          <MissionIcon icon={icon} />
          <div className="flex flex-col">
            <h3
              className="leading-[27px]"
              style={{
                fontFamily: '"Times New Roman", serif',
                color: MISSION_COLORS.title,
                fontSize: 18,
              }}
            >
              {title}
            </h3>
            <p
              className="leading-[24px]"
              style={{
                fontFamily: '"Times New Roman", serif',
                color: MISSION_COLORS.muted,
                fontSize: 16,
              }}
            >
              Reward: {reward} Tokens
            </p>
            {description?.trim() && (
              <p
                className="leading-[20px]"
                style={{
                  fontFamily: '"Times New Roman", serif',
                  color: MISSION_COLORS.muted,
                  fontSize: 14,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {badge && (
          <span
            className="shrink-0 rounded-[4px] px-2 py-1 uppercase"
            style={{
              fontFamily: '"Times New Roman", serif',
              fontSize: 10,
              letterSpacing: "0.5px",
              lineHeight: "15px",
              color: MISSION_COLORS.goldDeep,
              backgroundColor: "rgba(233,175,65,0.15)",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Progress row + track */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span
            className="leading-[20px]"
            style={{
              fontFamily: '"Times New Roman", serif',
              color: MISSION_COLORS.muted,
              fontSize: 14,
            }}
          >
            Progress
          </span>
          <span
            className="leading-[20px]"
            style={{
              fontFamily: '"Times New Roman", serif',
              color: completed ? MISSION_COLORS.green : MISSION_COLORS.title,
              fontSize: 14,
            }}
          >
            {progress.current} / {progress.total}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: MISSION_COLORS.track }}
        >
          {pct > 0 && (
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: completed
                  ? `linear-gradient(90deg, ${MISSION_COLORS.goldDeep}, #F2C36B)`
                  : MISSION_COLORS.gold,
                boxShadow: completed
                  ? "0 0 15px rgba(var(--lb-accent-rgb), 0.3)"
                  : "0 0 15px rgba(255,221,116,0.3)",
              }}
            />
          )}
        </div>
      </div>

      {/* Action: manual join is optional because backend may auto-join on the first qualifying action. */}
      {(() => {
        const btnDisabled = actionLoading || claimed || (joined && !completed);
        const btnLabel = actionLoading
          ? "Loading..."
          : claimed
            ? "Claimed"
            : !joined
              ? "Join"
              : completed
                ? "Claim"
                : "In Progress";
        const btnClick = () => {
          if (!joined) onJoin?.(mission.id);
          else if (completed) onClaim?.(mission.id);
        };
        // On a themed portal this renders the theme's ornate gold button; on
        // the default theme it falls back to the missions GoldButton. Centered
        // so the theme plaque's fixed max width doesn't strand it to the left.
        return (
          <div className="flex w-full justify-center">
            <ThemedActionButton
              textSize={16}
              disabled={btnDisabled}
              onClick={btnClick}
              fallback={
                <GoldButton disabled={btnDisabled} onClick={btnClick}>
                  {btnLabel}
                </GoldButton>
              }
            >
              {btnLabel}
            </ThemedActionButton>
          </div>
        );
      })()}
    </div>
  );
}

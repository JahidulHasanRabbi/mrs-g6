"use client";

import { LB_COLORS } from "./constants";
import { SectionBadge, Flag } from "./primitives";
import { useUser } from "../../contexts/UserContext";

function StatRow({ icon, label, children }) {
  return (
    <div className="flex w-full items-end gap-2">
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: LB_COLORS.primarySoft20, color: LB_COLORS.primary }}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div
          className="text-[10px] leading-[14px]"
          style={{ color: LB_COLORS.textMuted, fontFamily: "'Lexend',sans-serif" }}
        >
          {label}
        </div>
        <div className="flex items-center">{children}</div>
      </div>
    </div>
  );
}

const RankValue = ({ value, suffix = "th" }) => (
  <span style={{ color: LB_COLORS.rankGreen, fontFamily: "'Lexend',sans-serif", fontWeight: 700, lineHeight: "24px" }}>
    <span style={{ fontSize: 16 }}>#{(value ?? 0).toLocaleString()}</span>
    <span style={{ fontSize: 12, fontWeight: 500 }}>{suffix}</span>
  </span>
);

const StatValue = ({ children }) => (
  <span style={{ color: LB_COLORS.rankGreen, fontFamily: "'Lexend',sans-serif", fontWeight: 500, fontSize: 16, lineHeight: "24px" }}>
    {children}
  </span>
);

const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
const RankIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 21V11M12 21V3M18 21V13"/><path d="M3 21h18"/></svg>;
const FlagIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>;
const FireIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1-2-1-4-1-5 0 0-3 2-5 5s-3 5-3 7c0 4 1 7 5 7z"/></svg>;
const CoinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>;
const PctIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><path d="M6 18 18 6"/></svg>;
const TrophyIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4h10v4a5 5 0 1 1-10 0V4z"/><path d="M5 4H3v3a3 3 0 0 0 4 3M19 4h2v3a3 3 0 0 1-4 3"/><path d="M9 14v3h6v-3M8 20h8"/></svg>;

export default function ProfileCard({ profile }) {
  const { profilePicture } = useUser();

  return (
    <div
      className="w-full max-w-[358px] rounded-[12px] p-[17px] backdrop-blur-[10px]"
      style={{ background: LB_COLORS.panelLight, border: `1px solid ${LB_COLORS.borderSoft}` }}
    >
      <div className="flex flex-col items-center gap-6">
        <SectionBadge align="left">My Profile</SectionBadge>

        {profilePicture && (
          <img
            src={profilePicture}
            alt="Profile"
            className="h-16 w-16 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${LB_COLORS.borderSoft}` }}
          />
        )}

        <div className="flex w-full gap-6">
          <div className="flex flex-1 flex-col gap-4">
            <StatRow icon={<UserIcon />} label="Player">
              <span style={{ color: "#fff", fontSize: 14, fontFamily: "'Lexend',sans-serif", lineHeight: "24px" }}>
                {profile.name}
              </span>
              <span className="ml-3"><Flag code={profile.countryCode} src={profile.countryFlag} /></span>
            </StatRow>

            <StatRow icon={<RankIcon />} label="Global Rank">
              <RankValue value={profile.globalRank} />
            </StatRow>

            <StatRow icon={<FlagIcon />} label="Country Rank">
              <RankValue value={profile.countryRank} />
              <span className="ml-2" style={{ color: "#fff", fontSize: 12, fontFamily: "'Lexend',sans-serif", lineHeight: "24px" }}>
                ({profile.countryName})
              </span>
            </StatRow>

            <StatRow icon={<FireIcon />} label="Winning Streak">
              <StatValue>{profile.winningStreak ?? 0}</StatValue>
            </StatRow>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <StatRow icon={<CoinIcon />} label="Your Total Points">
              <StatValue>{(profile.totalPoints ?? 0).toLocaleString()}</StatValue>
            </StatRow>
            <StatRow icon={<PctIcon />} label="Total Predictions">
              <StatValue>{profile.totalPredictions ?? 0}</StatValue>
            </StatRow>
            <StatRow icon={<TrophyIcon />} label="Total Wins">
              <StatValue>{profile.totalWins ?? 0}</StatValue>
            </StatRow>
          </div>
        </div>
      </div>
    </div>
  );
}

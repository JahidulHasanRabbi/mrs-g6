"use client";

import KingRewardsButton from "./KingRewardsButton";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";
import { formatKrAmount } from "./KrUi";
import { KR_PK_INK, KrPkCard, KrPkCoin, KrPkDialogTitle, KrPkGlowText } from "./KrPkParts";

const ERROR_ICON = "/assets/themes/kingrewards/pk/icon-error.svg";

// Presentation-only King Rewards bodies for the penalty-kick dialogs. The shared
// dialogs keep all state (reward text, redeem flow, terms fallback) and pass it in.

export function KrOutlineButton(props) {
  return <KingRewardsButton {...props} variant="dark" />;
}

function GoldButton(props) {
  return <KingRewardsButton {...props} variant="gold" />;
}

// Raw API copy can still say "token"; the UI name is KR Coins.
function toDisplayCopy(text) {
  return String(text ?? "").replace(/\btokens?\b/gi, "KR Coins");
}

function CoinLine({ children }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <KrPkCoin size={64} />
      <p
        className="max-h-[96px] min-w-0 max-w-[220px] overflow-y-auto text-left text-[16px] font-medium leading-[24px] [scrollbar-width:thin]"
        style={{ fontFamily: KR_FONT, color: KR_PK_INK.glow }}
      >
        {children}
      </p>
    </div>
  );
}

function Lead({ children }) {
  return (
    <p className="px-2 text-[18px] font-medium leading-[27px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.heading }}>
      {children}
    </p>
  );
}

function RedeemedNote({ summary }) {
  if (!summary) return null;
  return (
    <p
      className="max-h-[72px] overflow-y-auto px-2 text-[12px] leading-[18px] [scrollbar-width:thin]"
      style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}
    >
      Redeemed: {summary}
    </p>
  );
}

function Actions({ children }) {
  return <div className="flex w-full flex-col items-center gap-4">{children}</div>;
}

export function KrPkGoalDialog({ rewardText, redeemedSummary, redeemButton, onKickAgain, onReturn }) {
  return (
    <KrPkCard>
      <div className="flex flex-col items-center gap-8">
        <KrPkGlowText as="h3">Goal!</KrPkGlowText>
        <div className="flex flex-col items-center gap-4">
          <Lead>Congratulations!</Lead>
          <CoinLine>{rewardText === "a reward" ? "Reward Won" : `${toDisplayCopy(rewardText)} Won`}</CoinLine>
          <RedeemedNote summary={redeemedSummary} />
        </div>
      </div>
      <Actions>
        <GoldButton onClick={onKickAgain}>Kick Again?</GoldButton>
        {redeemButton}
        <KrOutlineButton onClick={onReturn}>Back</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

export function KrPkFailDialog({ isError, heading, body, balance, redeemedSummary, redeemButton, kickAgainLabel, onKickAgain, onReturn }) {
  return (
    <KrPkCard>
      <div className="flex flex-col items-center gap-8">
        {isError ? (
          <div className="flex h-9 items-center justify-center gap-1">
            <img src={ERROR_ICON} alt="" aria-hidden="true" className="h-8 w-8" />
            <h3
              className="text-[32px] font-bold uppercase leading-[1.2] tracking-[1.4px]"
              style={{
                fontFamily: KR_FONT,
                backgroundImage: KR_GRADIENTS.red,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Error!
            </h3>
          </div>
        ) : (
          <KrPkGlowText as="h3">{heading}</KrPkGlowText>
        )}
        <div className="flex flex-col items-center gap-4">
          <Lead>{toDisplayCopy(isError ? body || heading : body)}</Lead>
          {balance != null && <CoinLine>{formatKrAmount(balance)} KR Coins Left</CoinLine>}
          <RedeemedNote summary={redeemedSummary} />
        </div>
      </div>
      <Actions>
        <GoldButton onClick={onKickAgain}>{kickAgainLabel}</GoldButton>
        {redeemButton}
        <KrOutlineButton onClick={onReturn}>Back</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

export function KrPkInfoDialog({ onClose, onOpenTerms }) {
  return (
    <KrPkCard>
      <div className="flex w-full flex-col items-center gap-8">
        <KrPkDialogTitle>Information</KrPkDialogTitle>
        <img
          src={KR_ASSETS.pk.infoSwipe}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block h-auto w-[240px] max-w-full select-none"
          style={{ aspectRatio: "240 / 156" }}
        />
        <h3
          className="text-[20px] font-bold uppercase leading-[1.2] tracking-[1.4px]"
          style={{ fontFamily: KR_FONT, color: KR_PK_INK.title, textShadow: "0 0 10px rgba(233,196,84,0.8)" }}
        >
          Swipe to Kick
        </h3>
      </div>
      <GoldButton onClick={onClose}>Close</GoldButton>
      <button
        type="button"
        onClick={onOpenTerms}
        className="cursor-pointer text-[12px] leading-[24px] underline"
        style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}
      >
        Terms &amp; Conditions
      </button>
    </KrPkCard>
  );
}

export function KrPkTermsDialog({ lines, onClose }) {
  return (
    <KrPkCard className="p-4">
      <div className="flex w-full flex-col items-center gap-4">
        <KrPkDialogTitle>Terms &amp; Condition</KrPkDialogTitle>
        <div
          className="max-h-[52vh] w-full overflow-y-auto pr-1 text-left text-[10px] leading-[24px] [scrollbar-width:thin]"
          style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}
        >
          <p>{lines[0]}</p>
          {lines.length > 1 && (
            <ol className="list-decimal">
              {lines.slice(1).map((line, i) => (
                <li key={i} style={{ marginInlineStart: 15 }}>
                  {line}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <GoldButton onClick={onClose}>Close</GoldButton>
    </KrPkCard>
  );
}

function HistoryRow({ row }) {
  const amt = Number(row.amount ?? 0);
  const hasAmt = Number.isFinite(amt) && amt > 0;
  const isMiss = /miss/i.test(row.label || "");
  return (
    <div className="flex w-full items-center gap-2" style={{ opacity: row.claimed ? 0.35 : 1 }}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px]" style={{ background: "rgba(228,233,84,0.2)" }}>
        <KrPkCoin />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[18px] font-medium leading-[27px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.heading }}>
          {toDisplayCopy(row.label)}
        </p>
        <p className="truncate text-[10px] leading-[14px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}>
          {row.claimed ? "Redeemed" : toDisplayCopy(row.sub)}
        </p>
      </div>
      <p
        className="shrink-0 self-start text-[16px] leading-[24px]"
        style={{ fontFamily: KR_FONT, color: isMiss ? KR_PK_INK.negative : "#ffffff" }}
      >
        {isMiss ? "-" : hasAmt ? "+" : ""}
        {hasAmt ? amt.toFixed(2) : ""}
      </p>
    </div>
  );
}

export function KrPkHistoryDialog({ rows, redeemedSummary, redeemButton, onClose }) {
  return (
    <KrPkCard className="p-4">
      <div className="flex w-full flex-col items-center gap-6">
        <KrPkDialogTitle>Game History</KrPkDialogTitle>
        <div className="flex max-h-[44vh] w-full flex-col gap-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {rows.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}>
              No game history yet.
            </p>
          ) : (
            rows.map((r) => <HistoryRow key={r.id} row={r} />)
          )}
        </div>
      </div>
      <RedeemedNote summary={redeemedSummary} />
      <Actions>
        {redeemButton}
        <KrOutlineButton onClick={onClose}>Close</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

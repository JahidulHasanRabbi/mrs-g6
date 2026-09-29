"use client";

import { useRouter } from "next/navigation";
import KingRewardsButton from "./KingRewardsButton";
import { formatKrCoins } from "../../../api/apiOptions";
import { KR_ASSETS, KR_FONT, KR_GRADIENTS } from "./assets";
import { GoldText, KrImage, KrTabs, formatKrAmount } from "./KrUi";
import KrPagination from "./KrPagination";
import { KR_PK_INK, KrPkCard, KrPkCoin, KrPkDialogTitle } from "./KrPkParts";

// Presentation-only King Rewards bodies for the penalty-kick dialogs. The shared
// dialogs keep all state (reward text, redeem flow, terms fallback) and pass it in.
// Result popups mirror the shared KR result dialog (KrResultDialog in KrSpinPanels).

const HEADING_SHADOW = "drop-shadow(0 4px 1.5px rgba(0,0,0,0.1)) drop-shadow(0 10px 4px rgba(0,0,0,0.04))";

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

function coins(value) {
  return formatKrCoins(formatKrAmount(value));
}

function ResultHeading({ warning = false, children }) {
  return (
    <div className="flex min-h-9 items-center justify-center gap-1 px-2 text-center" style={{ filter: HEADING_SHADOW }}>
      {warning && <img src={KR_ASSETS.ui.iconWarning} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />}
      <GoldText
        as="h3"
        className="text-[32px] font-bold uppercase"
        style={{ letterSpacing: 1.4, ...(warning ? { backgroundImage: KR_GRADIENTS.red } : null) }}
      >
        {children}
      </GoldText>
    </div>
  );
}

function ResultLine({ image, fallback, children }) {
  return (
    <div className="flex max-w-full items-center justify-center gap-4 px-2">
      <KrImage src={image} fallback={fallback} className="h-16 w-16 shrink-0 object-contain" />
      <p
        className="max-h-[96px] min-w-0 overflow-y-auto break-words text-left text-[16px] font-medium leading-6 [scrollbar-width:thin]"
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

export function KrPkGoalDialog({ rewardText, rewardImage, isBattlePoint, redeemedSummary, redeemButton, onKickAgain, onReturn }) {
  return (
    <KrPkCard>
      <div className="flex w-full flex-col items-center gap-8">
        <ResultHeading>Goal!</ResultHeading>
        <div className="flex w-full flex-col items-center gap-4">
          <Lead>Congratulations!</Lead>
          <ResultLine image={rewardImage} fallback={isBattlePoint ? KR_ASSETS.ui.iconBp : KR_ASSETS.ui.iconCoins}>
            You won {toDisplayCopy(rewardText)}
          </ResultLine>
          <RedeemedNote summary={redeemedSummary} />
        </div>
      </div>
      <Actions>
        <GoldButton onClick={onKickAgain}>Kick Again?</GoldButton>
        {redeemButton}
        <KrOutlineButton onClick={onReturn}>Return to Website</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

export function KrPkFailDialog({
  isError,
  isInsufficient,
  heading,
  body,
  balance,
  perShot,
  redeemedSummary,
  redeemButton,
  kickAgainLabel,
  onKickAgain,
  onReturn,
}) {
  const router = useRouter();
  // Same pair as the KR Spin / Egg low-balance dialog: top up, or Back to the pitch.
  if (isInsufficient) {
    return (
      <KrPkCard>
        <div className="flex w-full flex-col items-center gap-8">
          <ResultHeading warning>Not Enough</ResultHeading>
          <div className="flex w-full flex-col items-center gap-4">
            <Lead>
              {perShot != null ? `You need ${coins(perShot)} to kick.` : "You don't have enough KR Coins to kick."}
            </Lead>
            {balance != null && <ResultLine fallback={KR_ASSETS.ui.iconCoins}>{coins(balance)} Left</ResultLine>}
          </div>
        </div>
        <Actions>
          <GoldButton onClick={() => router.push("/missions")}>Get KR Coins?</GoldButton>
          <KrOutlineButton onClick={onKickAgain}>Back</KrOutlineButton>
        </Actions>
      </KrPkCard>
    );
  }
  return (
    <KrPkCard>
      <div className="flex w-full flex-col items-center gap-8">
        <ResultHeading warning={isError}>{heading}</ResultHeading>
        <div className="flex w-full flex-col items-center gap-4">
          <Lead>{toDisplayCopy(body)}</Lead>
          {!isError && balance != null && <ResultLine fallback={KR_ASSETS.ui.iconCoins}>{coins(balance)} Left</ResultLine>}
          <RedeemedNote summary={redeemedSummary} />
        </div>
      </div>
      <Actions>
        <GoldButton onClick={onKickAgain}>{kickAgainLabel}</GoldButton>
        {redeemButton}
        <KrOutlineButton onClick={onReturn}>Return to Website</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

export function KrPkInfoDialog({ onClose, onOpenTerms, onOpenHistory }) {
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
      <Actions>
        <GoldButton onClick={onClose}>Close</GoldButton>
        {onOpenHistory && <KrOutlineButton onClick={onOpenHistory}>Game History</KrOutlineButton>}
      </Actions>
      <button
        type="button"
        onClick={onOpenTerms}
        className="cursor-pointer text-[14px] leading-[24px] underline"
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
        <KrPkDialogTitle>Terms &amp; Conditions</KrPkDialogTitle>
        <div
          className="max-h-[52vh] w-full overflow-y-auto rounded-[12px] p-3 text-left text-[14px] leading-[22px] [scrollbar-width:thin]"
          style={{ fontFamily: KR_FONT, color: "#ffffff", background: "rgba(255,255,255,0.08)" }}
        >
          <p>{lines[0]}</p>
          {lines.length > 1 && (
            <ol className="mt-2 flex list-decimal flex-col gap-2">
              {lines.slice(1).map((line, i) => (
                <li key={i} style={{ marginInlineStart: 18 }}>
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
  const amountText = isMiss ? `-${hasAmt ? amt.toFixed(2) : ""}` : toDisplayCopy(row.amountText);
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
        {amountText}
      </p>
    </div>
  );
}

const HISTORY_TABS = [
  { id: "game", label: "Game History" },
  { id: "prize", label: "Prize History" },
];

export function KrPkHistoryDialog({
  activeTab = "game",
  onTab,
  rows,
  loading = false,
  countLabel,
  page = 1,
  totalPages = 1,
  onPage,
  redeemedSummary,
  redeemButton,
  onClose,
}) {
  const isGame = activeTab === "game";
  const note = loading ? "Loading…" : rows.length === 0 ? (isGame ? "No rewards waiting to redeem." : "No prize history yet.") : null;
  return (
    <KrPkCard className="p-4">
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <KrPkDialogTitle>{isGame ? "Game History" : "Prize History"}</KrPkDialogTitle>
          {countLabel && (
            <p className="text-[12px] leading-[18px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}>
              {countLabel}
            </p>
          )}
        </div>
        {onTab && <KrTabs tabs={HISTORY_TABS} active={activeTab} onChange={onTab} size={12} />}
        <div className="flex max-h-[40vh] w-full flex-col gap-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {note ? (
            <p className="py-6 text-center text-[12px]" style={{ fontFamily: KR_FONT, color: KR_PK_INK.muted }}>
              {note}
            </p>
          ) : (
            rows.map((r, i) => <HistoryRow key={r.id ?? i} row={r} />)
          )}
        </div>
        {totalPages > 1 && onPage && (
          <div className="w-full">
            <KrPagination page={page} totalPages={totalPages} onPage={onPage} />
          </div>
        )}
      </div>
      <RedeemedNote summary={redeemedSummary} />
      <Actions>
        {redeemButton}
        <KrOutlineButton onClick={onClose}>Close</KrOutlineButton>
      </Actions>
    </KrPkCard>
  );
}

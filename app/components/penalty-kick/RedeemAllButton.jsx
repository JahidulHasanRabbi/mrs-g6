"use client";

import { formatKrCoins } from "../../api/apiOptions";
import { useState } from "react";
import { OutlinePillCta } from "./GreenCta";

// Shared in-flight state for the "Redeem All" action so it cannot be
// double-tapped, regardless of which button renders the label. The button
// label itself stays short and fixed ("Redeem All" / "Redeeming…" /
// "Redeemed ✓") — a themed skin's Button is a fixed-size ornate plaque, not a
// text container, so it can't hold a long, unbounded breakdown (e.g. 9x
// "Jersey"). The breakdown is returned separately so callers can render it
// inside a scrollable text area instead (the "You won" card already has one).
export function formatRedeemedSummary(result) {
  const parts = [];
  const credit = Number(result?.total_credit ?? 0);
  const tokens = Number(result?.total_tokens ?? 0);
  const battlePoints = Number(result?.total_battle_points ?? 0);
  const score = Number(result?.wc_score ?? 0);

  if (credit > 0) parts.push(`RM ${credit.toFixed(2)}`);
  if (tokens > 0) parts.push(formatKrCoins(tokens));
  if (battlePoints > 0) parts.push(`${battlePoints.toLocaleString("en-US")} BP`);
  if (score > 0) parts.push(`${score.toLocaleString("en-US")} Score`);
  if (Array.isArray(result?.prizes) && result.prizes.length > 0) {
    parts.push(result.prizes.join(", "));
  }

  return parts.join(" + ");
}

function useRedeemAllState(onRedeemAll, onSummary) {
  const [state, setState] = useState("idle");

  const handleRedeem = async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      const result = await onRedeemAll?.();
      onSummary?.(formatRedeemedSummary(result));
      setState("done");
    } catch {
      setState("idle");
    }
  };

  const label =
    state === "loading" ? "Redeeming…" : state === "done" ? "Redeemed ✓" : "Redeem All";

  return { state, label, handleRedeem };
}

// Default (non-themed) skin's "Redeem All" action for the result dialogs.
// `onSummary`, if given, receives the formatted RM/Tokens/BP/Score/prize
// breakdown once redemption succeeds, so the parent can display it in its own
// scrollable text area rather than the button.
export default function RedeemAllButton({ onRedeemAll, onSummary }) {
  const { state, label, handleRedeem } = useRedeemAllState(onRedeemAll, onSummary);

  return (
    <OutlinePillCta onClick={handleRedeem} disabled={state !== "idle"}>
      {label}
    </OutlinePillCta>
  );
}

// Themed-skin variant — same idle/loading/done handling, rendered through the
// theme's own ornate Button so it never looks dead on tap (previously these
// skins fired onRedeemAll with no loading/disabled/success feedback at all).
export function ThemedRedeemAllButton({ onRedeemAll, onSummary, Button }) {
  const { state, label, handleRedeem } = useRedeemAllState(onRedeemAll, onSummary);

  return (
    <Button variant="gold" onClick={handleRedeem} disabled={state !== "idle"}>
      {label}
    </Button>
  );
}

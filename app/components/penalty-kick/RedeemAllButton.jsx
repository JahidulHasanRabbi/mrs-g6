"use client";

import { useState } from "react";
import { OutlinePillCta } from "./GreenCta";

// Shared "Redeem All" action for the result dialogs (goal / fail). Owns its
// own in-flight state so it cannot be double-tapped and shows the payout totals
// returned by the member redeem-all endpoint.
export default function RedeemAllButton({ onRedeemAll }) {
  const [state, setState] = useState("idle");
  const [redeemedSummary, setRedeemedSummary] = useState("");

  const formatRedeemedSummary = (result) => {
    const parts = [];
    const credit = Number(result?.total_credit ?? 0);
    const tokens = Number(result?.total_tokens ?? 0);
    const battlePoints = Number(result?.total_battle_points ?? 0);
    const score = Number(result?.wc_score ?? 0);

    if (credit > 0) parts.push(`RM ${credit.toFixed(2)}`);
    if (tokens > 0) parts.push(`${tokens.toLocaleString("en-US")} Tokens`);
    if (battlePoints > 0) parts.push(`${battlePoints.toLocaleString("en-US")} BP`);
    if (score > 0) parts.push(`${score.toLocaleString("en-US")} Score`);
    if (Array.isArray(result?.prizes) && result.prizes.length > 0) {
      parts.push(result.prizes.join(", "));
    }

    return parts.join(" + ");
  };

  const handleRedeem = async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      const result = await onRedeemAll?.();
      setRedeemedSummary(formatRedeemedSummary(result));
      setState("done");
    } catch {
      setState("idle");
    }
  };

  const label =
    state === "loading"
      ? "Redeeming…"
      : state === "done"
        ? redeemedSummary || "Redeemed ✓"
        : "Redeem All";

  return (
    <OutlinePillCta onClick={handleRedeem} disabled={state !== "idle"}>
      {label}
    </OutlinePillCta>
  );
}

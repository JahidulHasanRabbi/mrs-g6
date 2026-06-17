"use client";

import { useState } from "react";
import { OutlinePillCta } from "./GreenCta";

// Shared "Redeem All" action for the result dialogs (goal / fail). Owns its
// own in-flight state so it can't be double-tapped and confirms success in
// place. Uses the same OutlinePillCta styling as the other dialog actions.
export default function RedeemAllButton({ onRedeemAll }) {
  // idle -> loading -> done
  const [state, setState] = useState("idle");

  const handleRedeem = async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      await onRedeemAll?.();
      setState("done");
    } catch {
      setState("idle");
    }
  };

  const label =
    state === "loading" ? "Redeeming…" : state === "done" ? "Redeemed ✓" : "Redeem All";

  return (
    <OutlinePillCta onClick={handleRedeem} disabled={state !== "idle"}>
      {label}
    </OutlinePillCta>
  );
}

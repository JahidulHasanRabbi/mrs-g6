"use client";

import AcebetShell from "../../acebet77/AcebetShell";
import { ACEBET_ASSETS } from "../../acebet77/assets";

/**
 * Split point for <ThemedPageShell>: pairs the acebet77 shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only acebet77 members download.
 */
export default function AcebetShellEntry({ children, ...props }) {
  return (
    <AcebetShell bg={ACEBET_ASSETS.spin.bg} {...props}>
      {children}
    </AcebetShell>
  );
}

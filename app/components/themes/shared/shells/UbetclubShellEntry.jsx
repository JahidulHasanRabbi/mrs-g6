"use client";

import UbetclubShell from "../../ubetclub/UbetclubShell";
import { UBET_ASSETS } from "../../ubetclub/assets";

/**
 * Split point for <ThemedPageShell>: pairs the ubetclub shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only ubetclub members download.
 */
export default function UbetclubShellEntry({ children, ...props }) {
  return (
    <UbetclubShell bg={UBET_ASSETS.spin.bg} {...props}>
      {children}
    </UbetclubShell>
  );
}

"use client";

import N1gangShell from "../../n1gang/N1gangShell";
import { N1GANG_ASSETS } from "../../n1gang/assets";

/**
 * Split point for <ThemedPageShell>: pairs the n1gang shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only n1gang members download.
 */
export default function N1gangShellEntry({ children, ...props }) {
  return (
    <N1gangShell bg={N1GANG_ASSETS.spin.bg} {...props}>
      {children}
    </N1gangShell>
  );
}

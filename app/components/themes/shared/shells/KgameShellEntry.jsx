"use client";

import KgameShell from "../../kgame99/KgameShell";
import { KGAME99_ASSETS } from "../../kgame99/assets";

/**
 * Split point for <ThemedPageShell>: pairs the kgame99 shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only kgame99 members download.
 */
export default function KgameShellEntry({ children, ...props }) {
  return (
    <KgameShell bg={KGAME99_ASSETS.spin.bg} {...props}>
      {children}
    </KgameShell>
  );
}

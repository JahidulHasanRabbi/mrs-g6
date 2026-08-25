"use client";

import Ep369Shell from "../../ep369/Ep369Shell";
import { EP369_ASSETS } from "../../ep369/assets";

/**
 * Split point for <ThemedPageShell>: pairs the ep369 shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only ep369 members download.
 */
export default function Ep369ShellEntry({ children, ...props }) {
  return (
    <Ep369Shell bg={EP369_ASSETS.spin.bg} {...props}>
      {children}
    </Ep369Shell>
  );
}

"use client";

import Lv918Shell from "../../lv918/Lv918Shell";
import { LV918_ASSETS } from "../../lv918/assets";

/**
 * Split point for <ThemedPageShell>: pairs the lv918 shell with its default
 * lucky-spin backdrop so the whole skin — shell, nav, assets map — lands in one
 * chunk that only lv918 members download.
 */
export default function Lv918ShellEntry({ children, ...props }) {
  return (
    <Lv918Shell bg={LV918_ASSETS.spin.bg} {...props}>
      {children}
    </Lv918Shell>
  );
}

"use client";

import { createContext, useCallback, useContext, useState } from "react";

// Shared collapse/expand state for the admin sidebar.
//
// The sidebar component owns the toggle button, but the surrounding admin
// layout also needs to know the state so it can animate the aside width and
// shift content padding. Storing this in context keeps both halves in sync
// without prop-drilling through every page.
const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children, initialCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const toggle = useCallback(() => setCollapsed((v) => !v), []);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

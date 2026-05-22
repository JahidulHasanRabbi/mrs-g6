"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: { fg: "#84ebb4", bar: "#06b800", icon: "✓" },
  error:   { fg: "#fb6b6b", bar: "#f04a4a", icon: "✕" },
  warning: { fg: "#ffd27a", bar: "#e9af41", icon: "!" },
  info:    { fg: "#7ab8ff", bar: "#3b82f6", icon: "i" },
};

const DEFAULT_DURATION = 4500;

/**
 * Toast notification system.
 *
 * Why: checklist #7 — users must know what's happening. Replaces window.alert
 * and ad-hoc inline error banners with non-blocking, dismissible toasts.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Banner created");
 *   toast.error("Failed to save", { description: err.message });
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone, message, opts = {}) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts.duration ?? DEFAULT_DURATION;
      setToasts((prev) => [...prev, { id, tone, message, description: opts.description }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (msg, opts) => push("success", msg, opts),
      error:   (msg, opts) => push("error", msg, opts),
      warning: (msg, opts) => push("warning", msg, opts),
      info:    (msg, opts) => push("info", msg, opts),
      dismiss,
    }),
    [push, dismiss],
  );

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const style = TONE_STYLES[toast.tone] || TONE_STYLES.info;
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="relative overflow-hidden rounded-lg border border-white/10 bg-[#10131c]/95 backdrop-blur shadow-[0_8px_24px_rgba(0,0,0,0.4)] pl-4 pr-3 py-3 animate-[toast-in_180ms_ease-out]"
      style={{ borderLeftColor: style.bar, borderLeftWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
          style={{ background: `${style.bar}22`, color: style.fg }}
          aria-hidden="true"
        >
          {style.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white break-words">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-white/60 break-words">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-white/40 hover:text-white/80 transition-colors text-base leading-none px-1"
        >
          ×
        </button>
      </div>
      <style jsx>{`
        @keyframes toast-in {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    if (typeof window !== "undefined") {
      console.warn("useToast() called outside <ToastProvider>. Falling back to no-op.");
    }
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}

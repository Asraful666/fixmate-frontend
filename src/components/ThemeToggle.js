"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "fixmate-theme";
const THEME_EVENT = "fixmate-theme-change";

// The <html class="dark"> element is the single source of truth, so the
// toggle stays in sync with the pre-paint script in the root layout.
const subscribe = (onChange) => {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const getServerSnapshot = () => "light";

const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
};

export default function ThemeToggle({ className = "" }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // First client render: honour the saved preference (or the OS setting).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial =
      stored === "dark" || stored === "light"
        ? stored
        : prefersDark
          ? "dark"
          : "light";

    if (document.documentElement.classList.contains("dark") !== (initial === "dark")) {
      document.documentElement.classList.toggle("dark", initial === "dark");
      window.dispatchEvent(new Event(THEME_EVENT));
    }
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:bg-slate-50 ${className}`}
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}

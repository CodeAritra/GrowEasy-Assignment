"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle component that allows users to switch between light and dark themes.
 * Persists user preference in localStorage.
 */
export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const isLight = root.classList.contains("light");
    const timer = setTimeout(() => {
      setTheme(isLight ? "light" : "dark");
      setMounted(true);
    }, 0);
    return (): void => clearTimeout(timer);
  }, []);

  const toggleTheme = (): void => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  // Render a matching placeholder during SSR to prevent layout shift
  if (!mounted) {
    return <div className="size-9 rounded-lg border border-border bg-card/50" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 cursor-pointer"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-500 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-indigo-500 transition-transform duration-500 hover:-rotate-12" />
      )}
    </button>
  );
}

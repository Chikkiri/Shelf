import { useEffect, useLayoutEffect } from "react";
import { ThemeMode } from "@/types/bookmark";

export function useTheme(themeMode: ThemeMode) {
  // Use useLayoutEffect to apply theme before paint to prevent flash
  useLayoutEffect(() => {
    const applyTheme = (isDark: boolean) => {
     if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyTheme(themeMode === "dark");
    }
  }, [themeMode]);
}
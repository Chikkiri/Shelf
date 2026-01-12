import { useLayoutEffect } from "react";
import { ThemeMode } from "@/types/bookmark";

export function useTheme(themeMode: ThemeMode) {
  // Use useLayoutEffect to apply theme before paint to prevent flash
  useLayoutEffect(() => {
    const applyTheme = (isDark: boolean) => {
     const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
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
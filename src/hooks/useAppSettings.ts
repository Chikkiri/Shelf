import { useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useTheme } from "./useTheme";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/bookmark";

export function useAppSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>("app-settings", DEFAULT_SETTINGS);

  // Apply theme mode using separate hook
  useTheme(settings.themeMode);

  //Apply accent color to CSS variable (Main UI only)
  useEffect(() => {
    const root = document.documentElement;
    const accentColor = settings.accentColor || DEFAULT_SETTINGS.accentColor;
    root.style.setProperty("--accent-hex",accentColor);
  
  }, [settings.accentColor]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  return { settings, updateSetting, resetSettings };
}

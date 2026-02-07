import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useTheme } from "./useTheme";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/bookmark";

export function useAppSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>("app-settings", DEFAULT_SETTINGS);

  // Apply theme mode using separate hook
  useTheme(settings.themeMode);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  return { settings, updateSetting, resetSettings };
}

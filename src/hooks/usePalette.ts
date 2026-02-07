import { useEffect } from "react";
import { ColorPalette, STOCK_PALETTES, DEFAULT_PALETTE_ID, DEFAULT_CUSTOM_PALETTE } from "@/types/palette";
import { useLocalStorage } from "./useLocalStorage";

interface PaletteSettings {
  selectedPaletteId: string;
  customPalette: ColorPalette;
  privateSpaceUseGlobalPalette: boolean;
}

const DEFAULT_PALETTE_SETTINGS: PaletteSettings = {
  selectedPaletteId: DEFAULT_PALETTE_ID,
  customPalette: DEFAULT_CUSTOM_PALETTE,
  privateSpaceUseGlobalPalette: false,
};

export function usePalette() {
  const [paletteSettings, setPaletteSettings] = useLocalStorage<PaletteSettings>(
    "palette-settings",
    DEFAULT_PALETTE_SETTINGS
  );

  // Get the currently selected palette
  const getCurrentPalette = (): ColorPalette => {
    if (paletteSettings.selectedPaletteId === "custom") {
      return paletteSettings.customPalette;
    }
    return (
      STOCK_PALETTES.find((p) => p.id === paletteSettings.selectedPaletteId) ||
      STOCK_PALETTES[0]
    );
  };

  const currentPalette = getCurrentPalette();

  // Apply palette colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const { colors } = currentPalette;

    // Set CSS variables for the palette
    root.style.setProperty("--palette-primary", colors.primary);
    root.style.setProperty("--palette-secondary", colors.secondary);
    root.style.setProperty("--palette-accent", colors.accent);
    root.style.setProperty("--palette-muted", colors.muted);
    root.style.setProperty("--palette-background", colors.background);

    // Also update the old accent-hex for backward compatibility
    root.style.setProperty("--accent-hex", colors.primary);
  }, [currentPalette]);

  const selectPalette = (paletteId: string) => {
    setPaletteSettings((prev) => ({
      ...prev,
      selectedPaletteId: paletteId,
    }));
  };

  const updateCustomPalette = (colors: ColorPalette["colors"]) => {
    setPaletteSettings((prev) => ({
      ...prev,
      customPalette: {
        ...prev.customPalette,
        colors,
      },
    }));
  };

  const setPrivateSpaceUseGlobalPalette = (value: boolean) => {
    setPaletteSettings((prev) => ({
      ...prev,
      privateSpaceUseGlobalPalette: value,
    }));
  };

  return {
    currentPalette,
    selectedPaletteId: paletteSettings.selectedPaletteId,
    customPalette: paletteSettings.customPalette,
    privateSpaceUseGlobalPalette: paletteSettings.privateSpaceUseGlobalPalette,
    selectPalette,
    updateCustomPalette,
    setPrivateSpaceUseGlobalPalette,
    stockPalettes: STOCK_PALETTES,
  };
}

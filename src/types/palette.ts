// Color Palette System Types

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;      // Main accent color
    secondary: string;    // Secondary/background accent
    accent: string;       // Highlight color
    muted: string;        // Muted/subtle color
    background: string;   // Background tint
  };
  isCustom?: boolean;
}

// Stock palettes - well-balanced color schemes
export const STOCK_PALETTES: ColorPalette[] = [
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      primary: "#0A1931",
      secondary: "#185ADB",
      accent: "#4A7FA7",
      muted: "#B3CFE5",
      background: "#F6FAFD",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      primary: "#1B4332",
      secondary: "#2D6A4F",
      accent: "#52B788",
      muted: "#95D5B2",
      background: "#F0FDF4",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      primary: "#7C2D12",
      secondary: "#C2410C",
      accent: "#F97316",
      muted: "#FDBA74",
      background: "#FFF7ED",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    colors: {
      primary: "#4C1D95",
      secondary: "#7C3AED",
      accent: "#A78BFA",
      muted: "#C4B5FD",
      background: "#FAF5FF",
    },
  },
  {
    id: "rose",
    name: "Rose",
    colors: {
      primary: "#881337",
      secondary: "#BE185D",
      accent: "#F472B6",
      muted: "#FBCFE8",
      background: "#FDF2F8",
    },
  },
  {
    id: "slate",
    name: "Slate",
    colors: {
      primary: "#1E293B",
      secondary: "#475569",
      accent: "#64748B",
      muted: "#94A3B8",
      background: "#F8FAFC",
    },
  },
  {
    id: "amber",
    name: "Amber",
    colors: {
      primary: "#78350F",
      secondary: "#B45309",
      accent: "#F59E0B",
      muted: "#FCD34D",
      background: "#FFFBEB",
    },
  },
  {
    id: "teal",
    name: "Teal",
    colors: {
      primary: "#134E4A",
      secondary: "#0D9488",
      accent: "#2DD4BF",
      muted: "#99F6E4",
      background: "#F0FDFA",
    },
  },
];

export const DEFAULT_PALETTE_ID = "ocean";

export const DEFAULT_CUSTOM_PALETTE: ColorPalette = {
  id: "custom",
  name: "Custom",
  colors: {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    accent: "#93C5FD",
    muted: "#BFDBFE",
    background: "#EFF6FF",
  },
  isCustom: true,
};

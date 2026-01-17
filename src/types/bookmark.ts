export type BookmarkType = "website" | "app" | "url";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  categoryId: string; // Keep for backward compatibility
  categoryIds?: string[]; // New: multiple categories
  description: string;
  rating: number;
  notes: string;
  createdAt: string;
  type: BookmarkType;
  playStoreUrl?: string;
  pinned?: boolean;
  favorite?: boolean;
  private?: boolean; // Private Space item
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string; // Icon name from lucide-react
  showAddButton?: boolean; // Whether to show add button for this category
}

export type ThemeMode = "light" | "dark" | "auto";
export type CardSize = "small" | "medium" | "large";
export type LayoutView = "list" | "grid";
export type GridColumns = "2" | "3" | "auto";
export type HoverBoardPosition = "top" | "bottom";

export interface AppSettings {
  themeMode: ThemeMode;
  cardSize: CardSize;
  showDescriptions: boolean;
  showNotes: boolean;
  layoutView: LayoutView;
  gridColumns: GridColumns;
  accentColor: string; // HEX format: "#3b82f6"
  hoverBoardPosition: HoverBoardPosition;
  hideOthersFromAll: boolean; // Hide "Others" category from "All" view
  persistOnImport: boolean; // Persist existing items when importing
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "auto",
  cardSize: "medium",
  showDescriptions: true,
  showNotes: true,
  layoutView: "grid",
  gridColumns: "auto",
  accentColor: "#3b82f6", // Default blue
  hoverBoardPosition: "bottom",
  hideOthersFromAll: false,
  persistOnImport: false,
};

// Others category ID - fixed ID for migration purposes
export const OTHERS_CATEGORY_ID = "others-default";

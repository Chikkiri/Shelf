export type BookmarkType = "website" | "app";

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
}

export type ThemeMode = "light" | "dark" | "auto";
export type CardSize = "small" | "medium" | "large";
export type LayoutView = "list" | "grid";
export type GridColumns = "2" | "3" | "auto";

export interface AppSettings {
  themeMode: ThemeMode;
  cardSize: CardSize;
  showDescriptions: boolean;
  showNotes: boolean;
  layoutView: LayoutView;
  gridColumns: GridColumns;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "auto",
  cardSize: "medium",
  showDescriptions: true,
  showNotes: true,
  layoutView: "grid",
  gridColumns: "auto",
};

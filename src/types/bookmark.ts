export type BookmarkType = "website" | "app" | "url" | "note";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  categoryId: string; // Keep for backward compatibility
  categoryIds?: string[]; // Multiple categories
  description: string;
  rating: number;
  notes: string;
  createdAt: string;
  type: BookmarkType;
  playStoreUrl?: string;
  pinned?: boolean;
  favorite?: boolean;
  private?: boolean; // Private Space item
  tags?: string[]; // Tag IDs
  content?: string; // Note text content
  price?: string; // Price (e.g., "$10/m")
  alternates?: string[]; // IDs of alternate bookmark items
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
  hoverBoardPosition: HoverBoardPosition;
  persistOnImport: boolean; // Persist existing items when importing
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "auto",
  cardSize: "medium",
  showDescriptions: true,
  showNotes: true,
  layoutView: "grid",
  gridColumns: "auto",
  hoverBoardPosition: "bottom",
  persistOnImport: false,
};

// Others category ID - fixed ID for migration purposes
export const OTHERS_CATEGORY_ID = "others-default";

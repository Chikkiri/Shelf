import { BookmarkType } from "@/types/bookmark";

// Display labels for bookmark types (internal values remain unchanged)
export const TYPE_LABELS: Record<BookmarkType, string> = {
  website: "Website",
  app: "Apps",
  url: "Links",
  note: "Note",
};

// Singular labels for the Add Item dialog
export const TYPE_LABELS_SINGULAR: Record<BookmarkType, string> = {
  website: "Website",
  app: "App",
  url: "Link",
  note: "Note",
};

// Get display label for a type
export function getTypeLabel(type: BookmarkType): string {
  return TYPE_LABELS[type] || type;
}

// Get singular display label (for Add Item dialog)
export function getTypeLabelSingular(type: BookmarkType): string {
  return TYPE_LABELS_SINGULAR[type] || type;
}

// All available types for selection
export const BOOKMARK_TYPES: BookmarkType[] = ["website", "app", "url", "note"];

import { BookmarkType } from "@/types/bookmark";
// Display labels for bookmark types (internal values remain unchanged)
export const TYPE_LABELS: Record<BookmarkType, string> = {
  website: "Website",
  app: "Apps",
  url: "Links",
};
// Get display label for a type
export function getTypeLabel(type: BookmarkType): string {
  return TYPE_LABELS[type] || type;
}
// All available types for selection
export const BOOKMARK_TYPES: BookmarkType[] = ["website", "app", "url"];
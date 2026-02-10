import { Bookmark } from "@/types/bookmark";
import { SearchFilters } from "@/components/SearchFilterBar";
import { ItemTag, STOCK_TAGS } from "@/types/tags";
import { getTypeLabel } from "@/utils/typeLabels";

export type SortOption = "name" | "rating" | "recent" | "favorite";
export type TypeFilter = "all" | "website" | "app" | "url" | "note";

interface FilterSortOptions {
  bookmarks: Bookmark[];
  search: string;
  selectedCategory: string | null;
  selectedType: TypeFilter;
  sortBy: SortOption;
  isPrivateSpace: boolean;
  showFavorites?: boolean;
  filters?: SearchFilters;
  customTags?: ItemTag[];
}

export function filterAndSortBookmarks({
  bookmarks,
  search,
  selectedCategory,
  selectedType,
  sortBy,
  isPrivateSpace,
  showFavorites = false,
  filters,
  customTags = [],
}: FilterSortOptions): Bookmark[] {
  // Step 1: Exclude private items (main space only)
  let result = isPrivateSpace
    ? bookmarks.filter((b) => b.private)
    : bookmarks.filter((b) => !b.private);

  // Step 2: Enhanced search filter (name, description, notes, tags, type, favorite)
  if (search) {
    const query = search.toLowerCase();
    const allTags = [...STOCK_TAGS, ...customTags];
    
    result = result.filter((b) => {
      // Search in name
      if (b.name.toLowerCase().includes(query)) return true;
      // Search in description
      if (b.description?.toLowerCase().includes(query)) return true;
      // Search in notes
      if (b.notes?.toLowerCase().includes(query)) return true;
      // Search in type label
      if (getTypeLabel(b.type).toLowerCase().includes(query)) return true;
      // Search in tags
      if (b.tags && b.tags.length > 0) {
        const tagNames = b.tags.map((tagId) => {
          const tag = allTags.find((t) => t.id === tagId);
          return tag?.name?.toLowerCase() || "";
        });
        if (tagNames.some((name) => name.includes(query))) return true;
      }
      // Search for "favorite" or "starred"
      if (b.favorite && (query.includes("favorite") || query.includes("starred"))) return true;
      return false;
    });
  }

  // Step 3: Advanced filters
  if (filters) {
    // Filter by tags
    if (filters.tags.length > 0) {
      result = result.filter((b) => 
        b.tags && filters.tags.some((tagId) => b.tags!.includes(tagId))
      );
    }
    // Filter by min rating
    if (filters.minRating > 0) {
      result = result.filter((b) => b.rating >= filters.minRating);
    }
    // Filter by types
    if (filters.types.length > 0) {
      result = result.filter((b) => filters.types.includes(b.type));
    }
    // Filter by favorites
    if (filters.favoritesOnly) {
      result = result.filter((b) => b.favorite);
    }
    // Filter by pinned
    if (filters.pinnedOnly) {
      result = result.filter((b) => b.pinned);
    }
  }

  // Step 4: Type filter (from type bar, if no advanced type filter)
  if (selectedType !== "all" && (!filters || filters.types.length === 0)) {
    result = result.filter((b) => b.type === selectedType);
  }

  // Step 5: Category / Favorite filter
  if (showFavorites) {
    // Favorite virtual category - show only favorites
    result = result.filter((b) => b.favorite);
  } else if (selectedCategory) {
    result = result.filter((b) => {
      const ids = b.categoryIds || [b.categoryId];
      return ids.includes(selectedCategory);
    });
  }

  // Step 5: Sorting (base sort first)
  switch (sortBy) {
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "recent":
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "favorite":
      // Favorites first, then by recent
      result.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;
  }

  // Step 6: Always sort pinned items to top (stable sort)
  result.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return result;
}

export function getSortLabel(sortBy: SortOption): string {
  switch (sortBy) {
    case "name":
      return "Name";
    case "rating":
      return "Rating";
    case "recent":
      return "Recent";
    case "favorite":
      return "Favorite";
    default:
      return "Recent";
  }
}

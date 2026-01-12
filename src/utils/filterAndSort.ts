import { Bookmark } from "@/types/bookmark";

export type SortOption = "name" | "rating" | "recent" | "favorite";
export type TypeFilter = "all" | "website" | "app";

interface FilterSortOptions {
  bookmarks: Bookmark[];
  search: string;
  selectedCategory: string | null;
  selectedType: TypeFilter;
  sortBy: SortOption;
  hideURLFromAll: boolean;
  urlCategoryId: string | undefined;
  isPrivateSpace: boolean;
  showFavorites?: boolean;
}

export function filterAndSortBookmarks({
  bookmarks,
  search,
  selectedCategory,
  selectedType,
  sortBy,
  hideURLFromAll,
  urlCategoryId,
  isPrivateSpace,
  showFavorites = false,
}: FilterSortOptions): Bookmark[] {
  // Step 1: Exclude private items (main space only)
  let result = isPrivateSpace
    ? bookmarks.filter((b) => b.private)
    : bookmarks.filter((b) => !b.private);

  // Step 2: Hide URL items from "All" if setting is enabled and no category is selected
  if (hideURLFromAll && !selectedCategory && urlCategoryId && !showFavorites) {
    result = result.filter((b) => {
      const ids = b.categoryIds || [b.categoryId];
      return !ids.includes(urlCategoryId);
    });
  }

  // Step 3: Search filter
  if (search) {
    const query = search.toLowerCase();
    result = result.filter((b) => b.name.toLowerCase().includes(query));
  }

  // Step 4: Type filter (skip when URL category is selected)
  const isURLCategorySelected = selectedCategory === urlCategoryId;
  if (selectedType !== "all" && !isURLCategorySelected) {
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

  // Step 6: Sorting (base sort first)
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

  // Step 7: Always sort pinned items to top (stable sort)
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
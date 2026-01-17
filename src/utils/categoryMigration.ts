import { Bookmark, Category, OTHERS_CATEGORY_ID } from "@/types/bookmark";

/**
 * Migrates "URL" category to "Others" and updates all bookmarks
 * This runs once on app load to handle the category rename
 */
export function migrateURLToOthers(
  categories: Category[],
  bookmarks: Bookmark[]
): { categories: Category[]; bookmarks: Bookmark[]; migrated: boolean } {
  // Find the old "URL" category
  const urlCategory = categories.find((c) => c.name === "URL");
  
  // Check if "Others" already exists
  const othersExists = categories.some((c) => c.name === "Others" || c.id === OTHERS_CATEGORY_ID);
  
  // If no URL category or Others already exists, no migration needed
  if (!urlCategory || othersExists) {
    // Ensure Others category exists
    if (!othersExists) {
      const newCategories = [
        ...categories,
        {
          id: OTHERS_CATEGORY_ID,
          name: "Others",
          color: "orange",
          icon: "MoreHorizontal",
          showAddButton: true,
        },
      ];
      return { categories: newCategories, bookmarks, migrated: true };
    }
    return { categories, bookmarks, migrated: false };
  }

  // Replace URL category with Others
  const newCategories = categories.map((c) =>
    c.id === urlCategory.id
      ? { ...c, name: "Others", icon: "MoreHorizontal", showAddButton: true }
      : c
  );

  // No need to update bookmarks as they reference category IDs, not names
  return { categories: newCategories, bookmarks, migrated: true };
}

/**
 * Ensures the Others category exists in the category list
 */
export function ensureOthersCategory(categories: Category[]): Category[] {
  const othersExists = categories.some((c) => c.name === "Others" || c.id === OTHERS_CATEGORY_ID);
  
  if (othersExists) return categories;
  
  return [
    ...categories,
    {
      id: OTHERS_CATEGORY_ID,
      name: "Others",
      color: "orange",
      icon: "MoreHorizontal",
      showAddButton: true,
    },
  ];
}

/**
 * Gets the Others category ID from the list
 */
export function getOthersCategoryId(categories: Category[]): string | undefined {
  const othersCategory = categories.find((c) => c.name === "Others");
  return othersCategory?.id;
}

/**
 * Reassigns bookmarks from a deleted category to Others
 */
export function reassignToOthers(
  bookmarks: Bookmark[],
  deletedCategoryId: string,
  othersCategoryId: string
): Bookmark[] {
  return bookmarks.map((b) => {
    const ids = b.categoryIds || [b.categoryId];
    
    // If bookmark has the deleted category
    if (ids.includes(deletedCategoryId)) {
      // Remove deleted category and add Others if no other categories remain
      const newIds = ids.filter((id) => id !== deletedCategoryId);
      if (newIds.length === 0) {
        newIds.push(othersCategoryId);
      }
      return {
        ...b,
        categoryIds: newIds,
        categoryId: newIds[0],
      };
    }
    
    return b;
  });
}
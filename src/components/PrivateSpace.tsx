import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, Lock, ArrowLeft, Bookmark as BookmarkIcon, MoreHorizontal } from "lucide-react";
import { Bookmark, Category, AppSettings } from "@/types/bookmark";
import { ItemTag } from "@/types/tags";
import { usePalette } from "@/hooks/usePalette";
import { BookmarkCard } from "@/components/BookmarkCard";
import { CategoryHoverBoard } from "@/components/CategoryHoverBoard";
import { PrivateSpaceSettingsMenu } from "@/components/PrivateSpaceSettingsMenu";
import { SearchFilterBar, SearchFilters, DEFAULT_FILTERS } from "@/components/SearchFilterBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { filterAndSortBookmarks, getSortLabel, SortOption, TypeFilter } from "@/utils/filterAndSort";
import { getTypeLabel } from "@/utils/typeLabels";

interface PrivateSpaceProps {
  bookmarks: Bookmark[];
  categories: Category[];
  customTags: ItemTag[];
  mergedTags?: ItemTag[];
  settings: AppSettings;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExit: () => void;
  onOpenCategoryManager: () => void;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  onClearPrivateData: () => void;
}

export function PrivateSpace({
  bookmarks,
  categories,
  customTags,
  mergedTags,
  settings,
  onEdit,
  onDelete,
  onToggleFavorite,
  onExit,
  onOpenCategoryManager,
  onUpdateSetting,
  onResetSettings,
  onClearPrivateData,
}: PrivateSpaceProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Get palette settings
  const { privateSpaceUseGlobalPalette } = usePalette();

  // Apply neutral Private Space theme on mount, restore on unmount
  // If global palette is enabled, don't apply Private Space styling
  useEffect(() => {
    if (!privateSpaceUseGlobalPalette) {
      document.documentElement.setAttribute("data-private-space", "true");
    }
    return () => {
      document.documentElement.removeAttribute("data-private-space");
    };
  }, [privateSpaceUseGlobalPalette]);

  // Find the Others category ID
  const othersCategoryId = useMemo(() => {
    return categories.find((c) => c.name === "Others")?.id;
  }, [categories]);

  // Get only private items
  const privateBookmarks = useMemo(() => {
    return bookmarks.filter((b) => b.private);
  }, [bookmarks]);

  // Count bookmarks per category (private only)
  const bookmarkCounts = useMemo(() => {
    return privateBookmarks.reduce((acc, b) => {
      const ids = b.categoryIds || [b.categoryId];
      ids.forEach((id) => {
        acc[id] = (acc[id] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [privateBookmarks]);

  // Check if Others category is selected
  const isOthersCategorySelected = selectedCategory === othersCategoryId;

  const filteredBookmarks = useMemo(() => {
    return filterAndSortBookmarks({
      bookmarks,
      search,
      selectedCategory,
      selectedType,
      sortBy,
      isPrivateSpace: true,
      showFavorites,
      filters,
      customTags,
    });
  }, [bookmarks, search, selectedCategory, selectedType, sortBy, showFavorites, filters, customTags]);

  const handleToggleFavorites = () => {
    setShowFavorites((prev) => !prev);
  };

  // Grid classes based on layout settings
  const getGridClasses = () => {
    const gapClass = settings.cardSize === "small" ? "gap-3" : settings.cardSize === "large" ? "gap-5" : "gap-4";
    
    if (settings.layoutView === "list") {
      return `flex flex-col ${gapClass} max-w-2xl`;
    }
    
    switch (settings.gridColumns) {
      case "2":
        return `grid grid-cols-1 sm:grid-cols-2 ${gapClass}`;
      case "3":
        return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass}`;
      case "auto":
      default:
        if (settings.cardSize === "small") {
          return `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${gapClass}`;
        } else if (settings.cardSize === "large") {
          return `grid grid-cols-1 md:grid-cols-2 ${gapClass}`;
        }
        return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass}`;
    }
  };

  const gridClasses = getGridClasses();

  // Get empty state content
  const getEmptyState = () => {
    if (showFavorites) {
      return {
        icon: <BookmarkIcon className="w-8 h-8 private-space-muted" />,
        title: "No favorites yet",
        description: "Mark items as favorite to see them here",
      };
    }
    
    if (isOthersCategorySelected) {
      return {
        icon: <MoreHorizontal className="w-8 h-8 private-space-muted" />,
        title: "No items in Others yet",
        description: "Add your first private item to Others to get started",
      };
    }
    
    return {
      icon: <Lock className="w-8 h-8 private-space-muted" />,
      title: privateBookmarks.length === 0 ? "No private items" : "No matches found",
      description: privateBookmarks.length === 0
        ? "Mark items as private to see them here"
        : "Try adjusting your search or filters",
    };
  };

  const emptyState = getEmptyState();

  return (
    <div className="min-h-screen private-space-bg pb-24 overflow-x-hidden w-full max-w-full">
      {/* Header with private indicator */}
      <header className="sticky top-0 z-10 private-space-header backdrop-blur-sm border-b private-space-border">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl private-space-icon-bg flex items-center justify-center elevation-2">
                <Lock className="w-5 h-5 private-space-icon" />
              </div>
              <div>
                <h1 className="text-xl font-semibold private-space-text">Private Space</h1>
                <p className="text-xs private-space-muted">{privateBookmarks.length} private items</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PrivateSpaceSettingsMenu
                settings={settings}
                onOpenCategoryManager={onOpenCategoryManager}
                onUpdateSetting={onUpdateSetting}
                onResetSettings={onResetSettings}
                onClearPrivateData={onClearPrivateData}
              />
              <Button variant="outline" onClick={onExit} className="gap-2 private-space-button">
                <ArrowLeft className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              filters={filters}
              onFiltersChange={setFilters}
              customTags={customTags}
              allTags={mergedTags}
              isPrivateSpace={true}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 private-space-button">
                <ArrowUpDown className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort: {getSortLabel(sortBy)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rating")}>
                Highest Rating
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("favorite")}>
                Favorite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Hover Board - Top position */}
        {settings.hoverBoardPosition === "top" && (
          <CategoryHoverBoard
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            bookmarkCounts={bookmarkCounts}
            totalCount={privateBookmarks.length}
            isPrivateSpace={true}
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavorites}
          />
        )}

        {/* Type filter - Top Bar */}
        {!showFavorites && (
          <div className="flex justify-center gap-8 mb-6">
            {(["all", "website", "app", "url", "note"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-sm font-medium transition-colors ${
                  selectedType === t
                    ? "private-space-text-accent"
                    : "private-space-muted hover:private-space-text"
                }`}
              >
                {t === "all" ? "All" : getTypeLabel(t)}
              </button>
            ))}
          </div>
        )}

        {/* Category Hover Board - Bottom position (default) */}
        {settings.hoverBoardPosition !== "top" && (
          <CategoryHoverBoard
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            bookmarkCounts={bookmarkCounts}
            totalCount={privateBookmarks.length}
            isPrivateSpace={true}
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavorites}
          />
        )}

        {/* Private bookmarks grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl private-space-empty-icon flex items-center justify-center elevation-1">
              {emptyState.icon}
            </div>
            <h2 className="text-lg font-semibold private-space-text mb-2">
              {emptyState.title}
            </h2>
            <p className="private-space-muted mb-4">
              {emptyState.description}
            </p>
          </div>
        ) : (
          <div className={gridClasses}>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                categories={categories}
                customTags={customTags}
                allTags={mergedTags}
                settings={settings}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                searchHighlight={search}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { Search, ArrowUpDown, Lock, ArrowLeft } from "lucide-react";
import { Bookmark, Category, AppSettings } from "@/types/bookmark";
import { BookmarkCard } from "@/components/BookmarkCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrivateSpaceProps {
  bookmarks: Bookmark[];
  categories: Category[];
  settings: AppSettings;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExit: () => void;
}

type SortOption = "name" | "rating" | "recent";
type TypeFilter = "all" | "website" | "app";

export function PrivateSpace({
  bookmarks,
  categories,
  settings,
  onEdit,
  onDelete,
  onToggleFavorite,
  onExit,
}: PrivateSpaceProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Apply neutral Private Space theme on mount, restore on unmount
  useEffect(() => {
    document.documentElement.setAttribute("data-private-space", "true");
    return () => {
      document.documentElement.removeAttribute("data-private-space");
    };
  }, []);

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

  const filteredBookmarks = useMemo(() => {
    let result = [...privateBookmarks];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(query));
    }

    if (selectedCategory) {
      result = result.filter((b) => {
        const ids = b.categoryIds || [b.categoryId];
        return ids.includes(selectedCategory);
      });
    }

        // Type filter
    if (selectedType !== "all") {
      result = result.filter((b) => b.type === selectedType);
    }

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
    }

    // Always sort pinned items to top
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    return result;
  }, [privateBookmarks, search, selectedCategory, selectedType, sortBy]);
  
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

  // Get categories that have private items
  const categoriesWithPrivateItems = categories.filter(cat => bookmarkCounts[cat.id] > 0);

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

            <Button variant="outline" onClick={onExit} className="gap-2 private-space-button">
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 private-space-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 private-space-input"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 private-space-button">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort: {sortBy === "name" ? "Name" : sortBy === "rating" ? "Rating" : "Recent"}
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
            </DropdownMenuContent>
          </DropdownMenu>
                  </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === "all"
                ? "private-space-chip-active"
                : "private-space-chip"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("website")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === "website"
                ? "private-space-chip-active"
                : "private-space-chip"
            }`}
          >
            Website
          </button>
          <button
            onClick={() => setSelectedType("app")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === "app"
                ? "private-space-chip-active"
                : "private-space-chip"
            }`}
          >
            Application
          </button>
        </div>

        {/* Category filter */}
        {categoriesWithPrivateItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "private-space-chip-active"
                  : "private-space-chip"
              }`}
            >
              All ({privateBookmarks.length})
            </button>
            {categoriesWithPrivateItems.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "private-space-chip-active"
                    : "private-space-chip"
                }`}
              >
                {cat.name} ({bookmarkCounts[cat.id] || 0})
              </button>
            ))}
          </div>
        )}

        {/* Private bookmarks grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl private-space-empty-icon flex items-center justify-center elevation-1">
              <Lock className="w-8 h-8 private-space-muted" />
            </div>
            <h2 className="text-lg font-semibold private-space-text mb-2">
              {privateBookmarks.length === 0 ? "Empty" : "No matches found"}
            </h2>
            <p className="private-space-muted mb-4">
              {privateBookmarks.length === 0
                ? "Mark as private to see them here"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className={gridClasses}>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                categories={categories}
                settings={settings}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

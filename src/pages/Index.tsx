import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Layers } from "lucide-react";
import { Bookmark, Category, DEFAULT_SETTINGS } from "@/types/bookmark";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePrivateSpace } from "@/contexts/PrivateSpaceContext";
import { CategoryHoverBoard } from "@/components/CategoryHoverBoard";
import { BookmarkCard } from "@/components/BookmarkCard";
import { BookmarkDialog } from "@/components/BookmarkDialog";
import { CategoryManager } from "@/components/CategoryManager";
import { SettingsMenu } from "@/components/SettingsMenu";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { PinDialog } from "@/components/PinDialog";
import { PrivateSpace } from "@/components/PrivateSpace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Development", color: "blue" },
  { id: "2", name: "Design", color: "purple" },
  { id: "3", name: "Productivity", color: "green" },
  { id: "4", name: "Entertainment", color: "pink" },
  { id: "links", name: "Links", color: "orange" },
];

type SortOption = "name" | "rating" | "recent";
type TypeFilter = "all" | "website" | "app";

const Index = () => {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  const [categories, setCategories] = useLocalStorage<Category[]>("categories", DEFAULT_CATEGORIES);
  const { settings, updateSetting, resetSettings } = useAppSettings();
  const { isUnlocked, hasPin, unlock, lock, setPin } = usePrivateSpace();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");  
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [showPrivateSpace, setShowPrivateSpace] = useState(false);

  const [accent, setAccent] = useLocalStorage(
  "shelf-accent",
  "accent-blue"
);

  // Get non-private favorite items
  const favoriteBookmarks = useMemo(() => {
    return bookmarks.filter((b) => b.favorite && !b.private);
  }, [bookmarks]);

  // Count non-private bookmarks per category
  const bookmarkCounts = useMemo(() => {
    return bookmarks
      .filter((b) => !b.private)
      .reduce((acc, b) => {
        const ids = b.categoryIds || [b.categoryId];
        ids.forEach((id) => {
          acc[id] = (acc[id] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
  }, [bookmarks]);

 // Find the Links category ID
  const linksCategoryId = useMemo(() => {
    return categories.find((c) => c.name === "Links")?.id;
  }, [categories]);

  const filteredBookmarks = useMemo(() => {
    // Filter out private items from main list
    let result = bookmarks.filter((b) => !b.private);

    // Hide links from "All" if setting is enabled and no category is selected
    if (settings.hideLinksFromAll && !selectedCategory && linksCategoryId) {
      result = result.filter((b) => {
        const ids = b.categoryIds || [b.categoryId];
        return !ids.includes(linksCategoryId);
      });
    }
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(query));
    }

    if (selectedCategory === "_favorite_") {
  result = result.filter((b) => b.favorite);
} else if (selectedCategory) {
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
    if (selectedCategory !== "favorite") {
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }
  
    return result;
  }, [bookmarks, search, selectedCategory, selectedType, sortBy, settings.hideLinksFromAll, linksCategoryId]);

  const handleAddBookmark = (data: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [...prev, newBookmark]);
  };

  const handleEditBookmark = (data: Omit<Bookmark, "id" | "createdAt">) => {
    if (!editingBookmark) return;
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === editingBookmark.id ? { ...b, ...data } : b
      )
    );
    setEditingBookmark(null);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, favorite: !b.favorite } : b
      )
    );
  };

  const openEditDialog = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkDialogOpen(true);
  };

  const handleAddCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, name: string, color: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Remove category from bookmarks (but keep bookmark if it has other categories)
    setBookmarks((prev) =>
      prev.map((b) => {
        const ids = b.categoryIds || [b.categoryId];
        const newIds = ids.filter((cId) => cId !== id);
        if (newIds.length === 0) return b; // Keep at least one category
        return { ...b, categoryIds: newIds, categoryId: newIds[0] };
      }).filter((b) => {
        const ids = b.categoryIds || [b.categoryId];
        return ids.length > 0 && ids.some((cId) => cId !== id);
      })
    );
    if (selectedCategory === id) setSelectedCategory(null);
  };

  const handleImportData = (importedBookmarks: Bookmark[], importedCategories: Category[]) => {
    setBookmarks(importedBookmarks);
    setCategories(importedCategories);
  };

  const handleClearData = () => {
    setBookmarks([]);
  };

  const handleClearPrivateData = () => {
    setBookmarks((prev) => prev.filter((b) => !b.private));
  };

  const handlePrivateSpaceClick = () => {
    if (isUnlocked) {
      setShowPrivateSpace(true);
    } else {
      setPinDialogOpen(true);
    }
  };

  const handlePinSubmit = (pin: string) => {
    if (hasPin) {
      const success = unlock(pin);
      if (success) {
        setShowPrivateSpace(true);
        setPinDialogOpen(false);
      }
      return success;
    } else {
      setPin(pin);
      setShowPrivateSpace(true);
      setPinDialogOpen(false);
      return true;
    }
  };

  const handleExitPrivateSpace = () => {
    lock();
    setShowPrivateSpace(false);
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

  // Show Private Space if unlocked and requested
  if (showPrivateSpace && isUnlocked) {
    return (
      <>
        <PrivateSpace
          bookmarks={bookmarks}
          categories={categories}
          settings={settings}
          onEdit={openEditDialog}
          onDelete={handleDeleteBookmark}
          onToggleFavorite={handleToggleFavorite}
          onExit={handleExitPrivateSpace}
          onOpenCategoryManager={() => setCategoryManagerOpen(true)}
          onUpdateSetting={updateSetting}
          onResetSettings={resetSettings}
          onClearPrivateData={handleClearPrivateData}
        />

        {/* Floating Add Button */}
        <FloatingAddButton
          onClick={() => {
            setEditingBookmark(null);
            setBookmarkDialogOpen(true);
          }}
          isPrivateSpace={true}
        />

        {/* Dialogs */}
        <BookmarkDialog
          open={bookmarkDialogOpen}
          onOpenChange={(open) => {
            setBookmarkDialogOpen(open);
            if (!open) setEditingBookmark(null);
          }}
          bookmark={editingBookmark}
          categories={categories}
          onSave={editingBookmark ? handleEditBookmark : handleAddBookmark}
        />

        <CategoryManager
          open={categoryManagerOpen}
          onOpenChange={setCategoryManagerOpen}
          categories={categories}
          onAdd={handleAddCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
          bookmarkCounts={bookmarkCounts}
        />
      </>
    );
  }

  return (
    

    <div className={cn(
    "min-h-screen bg-background pb-24 overflow-x-hidden w-full max-w-full",
    accent)}>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrivateSpaceClick}
                className="w-10 h-10 rounded-xl bg-accent-custom flex items-center justify-center elevation-2 hover:elevation-3 transition-all"               
               title="Private Space"
              >
                <Layers className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-xl font-semibold text-foreground hidden sm:block">Shelf</h1>
            </div>

            <SettingsMenu
              bookmarks={bookmarks}
              categories={categories}
              settings={settings}
              onImport={handleImportData}
              onOpenCategoryManager={() => setCategoryManagerOpen(true)}
              onUpdateSetting={updateSetting}
              onResetSettings={resetSettings}
              onClearData={handleClearData}
              onClearPrivateData={handleClearPrivateData}
            />
          </div>
        </div>
      </header>

      <main className="container py-6">

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <ArrowUpDown className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort: {sortBy === "name" ? "Name" : sortBy === "rating" ? "Rating" : "Recent"}</span>
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

                          {/* Category Hover Board - Top position */}
        {settings.hoverBoardPosition === "top" && (
          <CategoryHoverBoard
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            bookmarkCounts={bookmarkCounts}
            totalCount={bookmarks.filter((b) => !b.private).length}
          />
        )}

        {/* Type filter - Top Bar (hidden when Links category is selected) */}
        {!categories.find((c) => c.id === selectedCategory && c.name === "Links") && (
          <div className="flex justify-center gap-8 mb-6">
            <button
              onClick={() => setSelectedType("all")}
              className={`text-sm font-medium transition-colors ${
                selectedType === "all"
                  ? "text-accent-custom"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType("website")}
              className={`text-sm font-medium transition-colors ${
                selectedType === "website"
                  ? "text-accent-custom"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Website
            </button>
            <button
              onClick={() => setSelectedType("app")}
              className={`text-sm font-medium transition-colors ${
                selectedType === "app"
                  ? "text-accent-custom"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Application
            </button>
          </div>
        )}

       {/* Category Hover Board - Bottom position (default) */}
        {settings.hoverBoardPosition !== "top" && (
          <CategoryHoverBoard
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            bookmarkCounts={bookmarkCounts}
            totalCount={bookmarks.filter((b) => !b.private).length}
          />
        )}

        <div className={cn("h-full", accent)}>
        {/* Main Space */}
        </div>

        {/* Bookmarks grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center elevation-1">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {bookmarks.filter((b) => !b.private).length === 0 ? "Empty" : "No matches found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {bookmarks.filter((b) => !b.private).length === 0
                ? "Add one now"
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
                onEdit={openEditDialog}
                onDelete={handleDeleteBookmark}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton
        onClick={() => {
          setEditingBookmark(null);
          setBookmarkDialogOpen(true);
        }}
      />

      {/* Dialogs */}
      <BookmarkDialog
        open={bookmarkDialogOpen}
        onOpenChange={(open) => {
          setBookmarkDialogOpen(open);
          if (!open) setEditingBookmark(null);
        }}
        bookmark={editingBookmark}
        categories={categories}
        onSave={editingBookmark ? handleEditBookmark : handleAddBookmark}
      />

      <CategoryManager
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={categories}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        bookmarkCounts={bookmarkCounts}
      />

      {/* PIN Dialog for Private Space */}
      <PinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        mode={hasPin ? "enter" : "setup"}
        onSubmit={handlePinSubmit}
      />
    </div>
  );
};

export default Index;

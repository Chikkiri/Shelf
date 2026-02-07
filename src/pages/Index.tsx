import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Layers, Bookmark as BookmarkIcon, MoreHorizontal } from "lucide-react";
import { Bookmark, Category, DEFAULT_SETTINGS } from "@/types/bookmark";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePalette } from "@/hooks/usepalette";
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
import { filterAndSortBookmarks, getSortLabel, SortOption, TypeFilter } from "@/utils/filterAndSort";
import { getTypeLabel } from "@/utils/typeLabels";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Development", color: "blue", icon: "Code2", showAddButton: true },
  { id: "2", name: "Design", color: "purple", icon: "Palette", showAddButton: true },
  { id: "3", name: "Productivity", color: "green", icon: "Briefcase", showAddButton: true },
  { id: "4", name: "Entertainment", color: "pink", icon: "Gamepad2", showAddButton: true },
  { id: "5", name: "Others", color: "orange", icon: "MoreHorizontal", showAddButton: true },
];

const Index = () => {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("bookmarks", []);
  const [categories, setCategories] = useLocalStorage<Category[]>("categories", DEFAULT_CATEGORIES);
  const { settings, updateSetting, resetSettings } = useAppSettings();
  const { isUnlocked, hasPin, unlock, lock, setPin } = usePrivateSpace();
  
  // Initialize palette system
  usePalette();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [showPrivateSpace, setShowPrivateSpace] = useState(false);

  // Find the Others category ID
  const othersCategoryId = useMemo(() => {
    return categories.find((c) => c.name === "Others")?.id;
  }, [categories]);

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

  // Check if Others category is selected
  const isOthersCategorySelected = selectedCategory === othersCategoryId;

  const filteredBookmarks = useMemo(() => {
    return filterAndSortBookmarks({
      bookmarks,
      search,
      selectedCategory,
      selectedType,
      sortBy,
      isPrivateSpace: false,
      showFavorites,
    });
  }, [bookmarks, search, selectedCategory, selectedType, sortBy, showFavorites]);

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

  const handleAddClick = () => {
    setEditingBookmark(null);
    setBookmarkDialogOpen(true);
  };

  const handleAddCategory = (name: string, color: string, icon?: string, showAddButton?: boolean, parentId?: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
      icon,
      showAddButton: showAddButton !== false,
      parentId,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, name: string, color: string, icon?: string, showAddButton?: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color, icon, showAddButton: showAddButton !== false } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    // Find all sub-categories that should also be deleted
    const subCategoryIds = categories.filter((c) => c.parentId === id).map((c) => c.id);
    const allIdsToDelete = [id, ...subCategoryIds];
    
    // Find or create Others category for reassignment
    let othersId = categories.find((c) => c.name === "Others" && !c.parentId)?.id;
    if (!othersId) {
      othersId = crypto.randomUUID();
      setCategories((prev) => [...prev.filter((c) => !allIdsToDelete.includes(c.id)), {
        id: othersId!,
        name: "Others",
        color: "orange",
        icon: "MoreHorizontal",
        showAddButton: true,
      }]);
    } else {
      setCategories((prev) => prev.filter((c) => !allIdsToDelete.includes(c.id)));
    }
    
    // Reassign bookmarks to Others
    setBookmarks((prev) =>
      prev.map((b) => {
        const ids = b.categoryIds || [b.categoryId];
        const hasDeletedCategory = ids.some((cId) => allIdsToDelete.includes(cId));
        if (hasDeletedCategory) {
          const newIds = ids.filter((cId) => !allIdsToDelete.includes(cId));
          if (newIds.length === 0) {
            newIds.push(othersId!);
          }
          return { ...b, categoryIds: newIds, categoryId: newIds[0] };
        }
        return b;
      })
    );
    if (allIdsToDelete.includes(selectedCategory!)) setSelectedCategory(null);
  };

  const handleImportData = (importedBookmarks: Bookmark[], importedCategories: Category[], persist?: boolean) => {
    if (persist) {
      // Merge with existing - avoid duplicates by ID
      const existingIds = new Set(bookmarks.map(b => b.id));
      const newBookmarks = importedBookmarks.filter(b => !existingIds.has(b.id));
      setBookmarks((prev) => [...prev, ...newBookmarks]);
      
      const existingCatIds = new Set(categories.map(c => c.id));
      const newCategories = importedCategories.filter(c => !existingCatIds.has(c.id));
      setCategories((prev) => [...prev, ...newCategories]);
    } else {
      setBookmarks(importedBookmarks);
      setCategories(importedCategories);
    }
  };

  const handleClearData = () => {
    setBookmarks([]);
  };

  const handleClearPrivateData = () => {
    setBookmarks((prev) => prev.filter((b) => !b.private));
  };

  const handleClearCategoryData = (categoryId: string) => {
    // Get sub-category IDs
    const subCategoryIds = categories.filter((c) => c.parentId === categoryId).map((c) => c.id);
    const allCategoryIds = [categoryId, ...subCategoryIds];
    
    setBookmarks((prev) =>
      prev.filter((b) => {
        if (b.private) return true; // Don't delete private items
        const ids = b.categoryIds || [b.categoryId];
        return !ids.some((id) => allCategoryIds.includes(id));
      })
    );
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
    const nonPrivateCount = bookmarks.filter((b) => !b.private).length;
    
    if (showFavorites) {
      return {
        icon: <BookmarkIcon className="w-8 h-8 text-muted-foreground" />,
        title: "No favorites yet",
        description: "Mark items as favorite to see them here",
      };
    }
    
    if (isOthersCategorySelected) {
      return {
        icon: <MoreHorizontal className="w-8 h-8 text-muted-foreground" />,
        title: "No items in Others yet",
        description: "Add your first item to Others to get started",
      };
    }
    
    return {
      icon: <Layers className="w-8 h-8 text-muted-foreground" />,
      title: nonPrivateCount === 0 ? "No items yet" : "No matches found",
      description: nonPrivateCount === 0
        ? "Add your first item to get started"
        : "Try adjusting your search or filters",
    };
  };

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
          onClick={handleAddClick}
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
          isPrivateSpace={true}
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

  const emptyState = getEmptyState();

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden w-full max-w-full">
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
              onClearCategoryData={handleClearCategoryData}
              bookmarkCounts={bookmarkCounts}
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
              placeholder="Search items..."
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
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
            totalCount={bookmarks.filter((b) => !b.private).length}
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavorites}
          />
        )}

        {/* Type filter - Top Bar */}
        {!showFavorites && (
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
              {getTypeLabel("website")}
            </button>
            <button
              onClick={() => setSelectedType("app")}
              className={`text-sm font-medium transition-colors ${
                selectedType === "app"
                  ? "text-accent-custom"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {getTypeLabel("app")}
            </button>
            <button
              onClick={() => setSelectedType("url")}
              className={`text-sm font-medium transition-colors ${
                selectedType === "url"
                  ? "text-accent-custom"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {getTypeLabel("url")}
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
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavorites}
          />
        )}

        {/* Bookmarks grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center elevation-1">
              {emptyState.icon}
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {emptyState.title}
            </h2>
            <p className="text-muted-foreground mb-4">
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
        onClick={handleAddClick}
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

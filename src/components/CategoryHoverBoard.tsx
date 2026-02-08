import { Category } from "@/types/bookmark";
import { renderCategoryIcon } from "@/utils/categoryIcons";

interface CategoryHoverBoardProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  bookmarkCounts: Record<string, number>;
  totalCount: number;
  isPrivateSpace?: boolean;
  showFavorites?: boolean;
  onToggleFavorites?: () => void;
}

export function CategoryHoverBoard({
  categories,
  selectedCategory,
  onSelectCategory,
  bookmarkCounts,
  totalCount,
  isPrivateSpace = false,
  showFavorites = false,
  onToggleFavorites,
}: CategoryHoverBoardProps) {
  const baseItemClasses = isPrivateSpace
    ? "private-space-chip"
    : "bg-secondary text-secondary-foreground hover:bg-secondary/80";

  const activeItemClasses = isPrivateSpace
    ? "private-space-chip-active"
    : "bg-palette-primary text-white";

  const handleCategoryClick = (categoryId: string | null) => {
    // Reset favorites when selecting a category
    if (showFavorites && onToggleFavorites) {
      onToggleFavorites();
    }
    onSelectCategory(categoryId);
  };

  return (
    <div className="flex justify-center mb-6">
      <div className={`inline-flex items-center gap-1 sm:gap-2 p-2 rounded-2xl flex-wrap justify-center ${isPrivateSpace ? 'private-space-hover-board' : 'bg-secondary/50'}`}>
        {/* Category items - show all categories (no "All" category) */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-colors min-w-[48px] sm:min-w-[72px] ${
              selectedCategory === cat.id && !showFavorites ? activeItemClasses : baseItemClasses
            }`}
          >
            {renderCategoryIcon(cat.name, cat.icon)}
            <span className="text-xs font-medium hidden sm:block">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Layers, Briefcase, Palette, Gamepad2, Code2, Link2, Heart } from "lucide-react";
import { Category } from "@/types/bookmark";

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Productivity": <Briefcase className="w-5 h-5" />,
  "Design": <Palette className="w-5 h-5" />,
  "Entertainment": <Gamepad2 className="w-5 h-5" />,
   "URL": <Link2 className="w-5 h-5" />,
  "Development": <Code2 className="w-5 h-5" />,
};

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
 // Filter to only show the specified categories in order
  const allowedCategories = ["Productivity", "Design", "Entertainment", "URL", "Development"];
  const filteredCategories = allowedCategories
    .map((name) => categories.find((cat) => cat.name === name))
    .filter((cat): cat is Category => cat !== undefined);

  const baseItemClasses = isPrivateSpace
    ? "private-space-chip"
    : "bg-secondary text-secondary-foreground hover:bg-secondary/80";

  const activeItemClasses = isPrivateSpace
    ? "private-space-chip-active"
    : "bg-accent-custom text-white";

    const handleCategoryClick = (categoryId: string | null) => {
    // Reset favorites when selecting a category
    if (showFavorites && onToggleFavorites) {
      onToggleFavorites();
    }
    onSelectCategory(categoryId);
  };

  const handleFavoritesClick = () => {
    if (onToggleFavorites) {
      onSelectCategory(null); // Reset category when selecting favorites
      onToggleFavorites();
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className={`inline-flex items-center gap-1 sm:gap-2 p-2 rounded-2xl ${isPrivateSpace ? 'private-space-hover-board' : 'bg-secondary/50'}`}>
        {/* All category */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-colors min-w-[48px] sm:min-w-[72px] ${
            selectedCategory === null && !showFavorites ? activeItemClasses : baseItemClasses
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:block">All</span>
        </button>

        {/* Category items */}
        {filteredCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-colors min-w-[48px] sm:min-w-[72px] ${
              selectedCategory === cat.id && !showFavorites ? activeItemClasses : baseItemClasses
            }`}
          >
            {CATEGORY_ICONS[cat.name] || <Layers className="w-5 h-5" />}
            <span className="text-xs font-medium hidden sm:block">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
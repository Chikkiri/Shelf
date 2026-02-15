import { useState } from "react";
import { Search, SlidersHorizontal, Star, Pin, Bookmark, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ItemTag, STOCK_TAGS, getTagIcon } from "@/types/tags";
import { getTypeLabel } from "@/utils/typeLabels";

export interface SearchFilters {
  tags: string[];
  minRating: number;
  types: string[];
  favoritesOnly: boolean;
  pinnedOnly: boolean;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  customTags: ItemTag[];
  allTags?: ItemTag[];
  isPrivateSpace?: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
  tags: [],
  minRating: 0,
  types: [],
  favoritesOnly: false,
  pinnedOnly: false,
};

export function SearchFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  customTags,
  allTags: allTagsProp,
  isPrivateSpace = false,
}: SearchFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const allTags = allTagsProp || [...STOCK_TAGS, ...customTags];
  const activeFilterCount = 
    filters.tags.length + 
    (filters.minRating > 0 ? 1 : 0) + 
    filters.types.length + 
    (filters.favoritesOnly ? 1 : 0) + 
    (filters.pinnedOnly ? 1 : 0);

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isPrivateSpace ? 'private-space-muted' : 'text-muted-foreground'}`} />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className={`pl-9 ${isPrivateSpace ? 'private-space-input' : ''}`}
        />
      </div>

      {/* Filter button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={`relative shrink-0 ${isPrivateSpace ? 'private-space-button' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                isPrivateSpace ? 'bg-gray-600 text-white' : 'bg-palette-primary text-white'
              }`}>
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  Clear all
                </Button>
              )}
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Type</Label>
              <div className="flex flex-wrap gap-2">
                {(["website", "app", "url", "note"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.types.includes(type)
                        ? "bg-palette-primary text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {allTags.map((tag) => {
                  const IconComponent = getTagIcon(tag.icon);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                        filters.tags.includes(tag.id)
                          ? "bg-palette-primary text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <IconComponent className="w-2.5 h-2.5" />
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Rating filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Min Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(rating)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                      filters.minRating === rating
                        ? "bg-palette-primary text-white"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {rating}★
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Other filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="favorites-only"
                  checked={filters.favoritesOnly}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, favoritesOnly: checked as boolean })
                  }
                />
                <Label htmlFor="favorites-only" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Bookmark className="w-3.5 h-3.5" />
                  Favorites only
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pinned-only"
                  checked={filters.pinnedOnly}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, pinnedOnly: checked as boolean })
                  }
                />
                <Label htmlFor="pinned-only" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned only
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DEFAULT_FILTERS };

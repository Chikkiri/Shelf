import { useEffect, useState } from "react";
import { Bookmark, BookmarkType, Category } from "@/types/bookmark";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BOOKMARK_TYPES, getTypeLabel } from "@/utils/typeLabels";
import { FolderOpen } from "lucide-react";

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  categories: Category[];
  onSave: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
parentCategoryName?: string; // Display parent folder name when adding inside a sub-category
  isPrivateSpace?: boolean;
}

export function BookmarkDialog({
  open,
  onOpenChange,
  bookmark,
  categories,
  onSave,
  parentCategoryName,
  isPrivateSpace = false,
}: BookmarkDialogProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<BookmarkType>("website");
  const [pinned, setPinned] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name);
      setUrl(bookmark.url);
      // Handle both old single categoryId and new categoryIds array
      setCategoryIds(bookmark.categoryIds || [bookmark.categoryId]);
      setDescription(bookmark.description);
      setRating(bookmark.rating);
      setNotes(bookmark.notes);
      setType(bookmark.type || "website");
      setPinned(bookmark.pinned || false);
      setFavorite(bookmark.favorite || false);
      setIsPrivate(bookmark.private || false);
    } else {
      setName("");
      setUrl("");
      setCategoryIds(categories[0]?.id ? [categories[0].id] : []);
      setDescription("");
      setRating(0);
      setNotes("");
      setType("website");
      setPinned(false);
      setFavorite(false);
      setIsPrivate(false);
    }
  }, [bookmark, categories, open]);

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setCategoryIds((prev) => [...prev, categoryId]);
    } else {
      setCategoryIds((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const handleTypeToggle = (selectedType: BookmarkType) => {
    setType(selectedType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || categoryIds.length === 0) return;
    
    onSave({
      name: name.trim(),
      url: url.trim(),
      categoryId: categoryIds[0], // Keep for backward compatibility
      categoryIds,
      description: description.trim(),
      rating,
      notes: notes.trim(),
      type,
      pinned,
      favorite,
      private: isPrivate,
    });
    onOpenChange(false);
  };

    // Get parent categories (no parentId) for display
  const parentCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? "Edit Item" : "Add Item"}
          </DialogTitle>
        {/* Show parent folder name when adding inside a sub-category */}
          {parentCategoryName && (
            <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-md ${isPrivateSpace ? 'bg-secondary/50' : 'bg-accent/10'}`}>
              <FolderOpen className={`w-4 h-4 ${isPrivateSpace ? 'text-muted-foreground' : 'text-accent-custom'}`} />
              <span className="text-sm text-muted-foreground">
                Adding to: <span className={`font-medium ${isPrivateSpace ? 'text-foreground' : 'text-accent-custom'}`}>{parentCategoryName}</span>
              </span>
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GitHub"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-3 p-2 border rounded-lg bg-background">
              {BOOKMARK_TYPES.map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${t}`}
                    checked={type === t}
                    onCheckedChange={() => handleTypeToggle(t)}
                  />
                  <label
                    htmlFor={`type-${t}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {getTypeLabel(t)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categories (select one or more)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
              {/* Parent categories */}
              {parentCategories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={categoryIds.includes(cat.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`cat-${cat.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {cat.name}
                  </label>
                </div>
              ))}
            {/* Sub-categories with indent */}
              {subCategories.map((cat) => {
                const parent = categories.find((c) => c.id === cat.parentId);
                return (
                  <div key={cat.id} className="flex items-center space-x-2 pl-4">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={categoryIds.includes(cat.id)}
                      onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
                    >
                      {parent ? `${parent.name} / ` : ""}{cat.name}
                    </label>
                  </div>
                );
              })}
            </div>
            {categoryIds.length === 0 && (
              <p className="text-xs text-destructive">Select at least one category</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating rating={rating} onRatingChange={setRating} allowClear />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="pinned">Pin to top</Label>
            <Switch
              id="pinned"
              checked={pinned}
              onCheckedChange={setPinned}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="favorite">Add to Favorites</Label>
            <Switch
              id="favorite"
              checked={favorite}
              onCheckedChange={setFavorite}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="private" className="flex items-center gap-2">
              Private Item
              <span className="text-xs text-muted-foreground">(hidden in main list)</span>
            </Label>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={categoryIds.length === 0}>
              {bookmark ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

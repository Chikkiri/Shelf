import { useEffect, useState } from "react";
import { Bookmark, BookmarkType, Category } from "@/types/bookmark";
import { ItemTag } from "@/types/tags";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BOOKMARK_TYPES, getTypeLabelSingular } from "@/utils/typeLabels";

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  categories: Category[];
  customTags: ItemTag[];
  allTags?: ItemTag[];
  allBookmarks?: Bookmark[];
  onAddCustomTag: (tag: ItemTag) => void;
  onSave: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  isPrivateSpace?: boolean;
}

export function BookmarkDialog({
  open,
  onOpenChange,
  bookmark,
  categories,
  customTags,
  allTags,
  allBookmarks = [],
  onAddCustomTag,
  onSave,
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
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name);
      setUrl(bookmark.url);
      setCategoryIds(bookmark.categoryIds || [bookmark.categoryId]);
      setDescription(bookmark.description);
      setRating(bookmark.rating);
      setNotes(bookmark.notes);
      setType(bookmark.type || "website");
      setPinned(bookmark.pinned || false);
      setFavorite(bookmark.favorite || false);
      setIsPrivate(bookmark.private || false);
      setTags(bookmark.tags || []);
      setContent(bookmark.content || "");
      setPrice(bookmark.price || "");
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
      setTags([]);
      setContent("");
      setPrice("");
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

  const isNote = type === "note";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || categoryIds.length === 0) return;
    if (!isNote && !url.trim()) return;
    
    onSave({
      name: name.trim(),
      url: url.trim(),
      categoryId: categoryIds[0],
      categoryIds,
      description: description.trim(),
      rating,
      notes: notes.trim(),
      type,
      pinned,
      favorite,
      private: isPrivate,
      tags,
      content: content.trim(),
      price: price.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? "Edit Item" : "Add Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</Label>
            <div className="flex flex-wrap gap-2">
              {BOOKMARK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeToggle(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    type === t
                      ? isPrivateSpace
                        ? "private-space-chip-active"
                        : "bg-palette-primary text-white"
                      : isPrivateSpace
                        ? "private-space-chip"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {getTypeLabelSingular(t)}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GitHub"
              required
            />
          </div>

          {/* Note content - only for Note type */}
          {isNote && (
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
              />
            </div>
          )}

          {/* URL - hidden for Note type */}
          {!isNote && (
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {/* Category & Tags row */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</Label>
              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto p-2 border rounded-lg bg-background">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={categoryIds.includes(cat.id)}
                      onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`cat-${cat.id}`}
                      className="text-xs font-medium leading-none cursor-pointer truncate"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
              {categoryIds.length === 0 && (
                <p className="text-[10px] text-destructive">Select at least one category</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</Label>
              <TagSelector
                selectedTags={tags}
                customTags={customTags}
                allTags={allTags}
                onTagsChange={setTags}
                onAddCustomTag={onAddCustomTag}
                isPrivateSpace={isPrivateSpace}
              />
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>

          {/* Rating & Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rating</Label>
              <StarRating rating={rating} onRatingChange={setRating} allowClear />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., $10/m"
                className="h-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="pinned" className="text-sm">Pin to top</Label>
              <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="favorite" className="text-sm">Add to Favorites</Label>
              <Switch id="favorite" checked={favorite} onCheckedChange={setFavorite} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="private" className="text-sm">Private Item</Label>
              <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
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

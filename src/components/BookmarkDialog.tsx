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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  categories: Category[];
  onSave: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
}

export function BookmarkDialog({
  open,
  onOpenChange,
  bookmark,
  categories,
  onSave,
}: BookmarkDialogProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<BookmarkType>("website");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
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
      setPlayStoreUrl(bookmark.playStoreUrl || "");
      setPinned(bookmark.pinned || false);
      setFavorite(bookmark.favorite || false);
      setIsPrivate(bookmark.private || false);
    } else {
      setName("");
      setUrl("");
      setCategoryIds(categories[0]?.id ? [categories[0].id] : []);
      setDescription("");
      setRating(3);
      setNotes("");
      setType("website");
      setPlayStoreUrl("");
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
      playStoreUrl: type === "app" ? playStoreUrl.trim() : undefined,
      pinned,
      favorite,
      private: isPrivate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? "Edit Item" : "Add Item"}
          </DialogTitle>
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
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BookmarkType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="app">App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{type === "app" ? "Website URL" : "URL"}</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          {type === "app" && (
            <div className="space-y-2">
              <Label htmlFor="playStoreUrl">Play Store URL (optional)</Label>
              <Input
                id="playStoreUrl"
                type="url"
                value={playStoreUrl}
                onChange={(e) => setPlayStoreUrl(e.target.value)}
                placeholder="https://play.google.com/store/apps/..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Categories (select one or more)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
              {categories.map((cat) => (
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
            <StarRating rating={rating} onRatingChange={setRating} />
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

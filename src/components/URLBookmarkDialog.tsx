import { useEffect, useState } from "react";
import { Bookmark, BookmarkType, Category } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface URLBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  urlCategoryId: string;
  onSave: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
}

export function URLBookmarkDialog({
  open,
  onOpenChange,
  bookmark,
  urlCategoryId,
  onSave,
}: URLBookmarkDialogProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<BookmarkType>("website");
  const [pinned, setPinned] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name);
      setUrl(bookmark.url);
      setDescription(bookmark.description);
      setNotes(bookmark.notes);
      setType(bookmark.type || "website");
      setPinned(bookmark.pinned || false);
      setIsPrivate(bookmark.private || false);
    } else {
      setName("");
      setUrl("");
      setDescription("");
      setNotes("");
      setType("website");
      setPinned(false);
      setIsPrivate(false);
    }
  }, [bookmark, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    
    onSave({
      name: name.trim(),
      url: url.trim(),
      categoryId: urlCategoryId, // Always save under URL category
      categoryIds: [urlCategoryId], // Always save under URL category
      description: description.trim(),
      rating: 0, // No rating for URL items
      notes: notes.trim(),
      type,
      pinned,
      favorite: false, // No favorite for URL items in simplified form
      private: isPrivate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? "Edit URL Item" : "Add URL Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Link"
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
            />
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
            <Button type="submit">
              {bookmark ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

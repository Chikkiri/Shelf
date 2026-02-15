import { useState } from "react";
import { Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { ItemTag, STOCK_TAGS, AVAILABLE_TAG_ICONS, getTagIcon } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Predefined color options
const TAG_COLORS = [
  "#3DDC84", "#0078D4", "#A2AAAD", "#4CAF50", "#FF9800", "#F44336",
  "#9C27B0", "#2196F3", "#009688", "#FF5722", "#795548", "#607D8B",
  "#E91E63", "#673AB7", "#03A9F4", "#00BCD4", "#8BC34A", "#CDDC39",
  "#FFC107", "#FF4081",
];

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customTags: ItemTag[];
  editedStockTags: Record<string, Partial<ItemTag>>;
  onUpdateCustomTags: (tags: ItemTag[]) => void;
  onUpdateEditedStockTags: (edits: Record<string, Partial<ItemTag>>) => void;
}

export function TagManager({
  open,
  onOpenChange,
  customTags,
  editedStockTags,
  onUpdateCustomTags,
  onUpdateEditedStockTags,
}: TagManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  // Merge stock tags with edits
  const getMergedStockTags = (): ItemTag[] => {
    return STOCK_TAGS.map((tag) => ({
      ...tag,
      ...editedStockTags[tag.id],
    }));
  };

  const allTags = [...getMergedStockTags(), ...customTags];

  const startEdit = (tag: ItemTag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditIcon(tag.icon || "Tag");
    setEditColor(tag.color || "#607D8B");
    setShowIconPicker(false);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;

    const isStock = STOCK_TAGS.some((t) => t.id === editingId);

    if (isStock) {
      onUpdateEditedStockTags({
        ...editedStockTags,
        [editingId]: { name: editName.trim(), icon: editIcon, color: editColor },
      });
    } else {
      onUpdateCustomTags(
        customTags.map((t) =>
          t.id === editingId
            ? { ...t, name: editName.trim(), icon: editIcon, color: editColor }
            : t
        )
      );
    }

    setEditingId(null);
  };

  const deleteTag = (tagId: string) => {
    const isStock = STOCK_TAGS.some((t) => t.id === tagId);
    if (isStock) {
      // For stock tags, remove edits (restores default)
      const newEdits = { ...editedStockTags };
      delete newEdits[tagId];
      onUpdateEditedStockTags(newEdits);
    } else {
      onUpdateCustomTags(customTags.filter((t) => t.id !== tagId));
    }
  };

  const addNewTag = () => {
    if (!newTagName.trim()) return;
    const newTag: ItemTag = {
      id: `custom-${Date.now()}`,
      name: newTagName.trim(),
      icon: "Tag",
      color: "#607D8B",
      isStock: false,
    };
    onUpdateCustomTags([...customTags, newTag]);
    setNewTagName("");
    setShowAddTag(false);
  };

  const iconNames = Object.keys(AVAILABLE_TAG_ICONS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 pb-4">
            {allTags.map((tag) => {
              const IconComponent = getTagIcon(tag.icon);
              const isEditing = editingId === tag.id;
              const isStock = STOCK_TAGS.some((t) => t.id === tag.id);

              if (isEditing) {
                return (
                  <div key={tag.id} className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                    {/* Name */}
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="Tag name"
                      />
                      <Button size="sm" className="h-8" onClick={saveEdit} disabled={!editName.trim()}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Icon picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Icon</Label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border rounded-lg bg-background">
                        {iconNames.map((name) => {
                          const IC = AVAILABLE_TAG_ICONS[name];
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setEditIcon(name)}
                              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                                editIcon === name
                                  ? "bg-palette-primary text-white"
                                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                              }`}
                              title={name}
                            >
                              <IC className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {TAG_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              editColor === color ? "border-foreground scale-110" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={tag.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tag.color || "#607D8B" }}
                  >
                    <IconComponent className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{tag.name}</span>
                  {isStock && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Stock</span>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(tag)}>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  {!isStock && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete tag "{tag.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This tag will be removed. Items using this tag will lose the association.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTag(tag.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />

        {/* Add new tag */}
        <div className="pt-2">
          {showAddTag ? (
            <div className="flex gap-2 items-center">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewTag();
                  }
                }}
                placeholder="New tag name..."
                className="flex-1 h-8 text-sm"
                autoFocus
              />
              <Button size="sm" className="h-8" onClick={addNewTag} disabled={!newTagName.trim()}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => {
                  setShowAddTag(false);
                  setNewTagName("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowAddTag(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Tag
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

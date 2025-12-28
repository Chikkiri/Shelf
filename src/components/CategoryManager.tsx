import { useState } from "react";
import { Category } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COLORS = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "teal", label: "Teal" },
  { value: "orange", label: "Orange" },
];

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  bookmarkCounts: Record<string, number>;
}

export function CategoryManager({
  open,
  onOpenChange,
  categories,
  onAdd,
  onUpdate,
  onDelete,
  bookmarkCounts,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newColor);
    setNewName("");
    setNewColor("blue");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdate(editingId, editName.trim(), editColor);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <Select value={newColor} onValueChange={setNewColor}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Category list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
              >
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8"
                    />
                    <Select value={editColor} onValueChange={setEditColor}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-sm">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {bookmarkCounts[cat.id] || 0} items
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete "{cat.name}" and all {bookmarkCounts[cat.id] || 0} bookmarks in it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(cat.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

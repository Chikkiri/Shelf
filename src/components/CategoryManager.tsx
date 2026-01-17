import { useState } from "react";
import { Category } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { AVAILABLE_ICONS, renderCategoryIcon } from "@/utils/categoryIcons";

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
  onAdd: (name: string, color: string, icon?: string, showAddButton?: boolean) => void;
  onUpdate: (id: string, name: string, color: string, icon?: string, showAddButton?: boolean) => void;
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
  const [newIcon, setNewIcon] = useState("Folder");
  const [newShowAddButton, setNewShowAddButton] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editShowAddButton, setEditShowAddButton] = useState(true);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newColor, newIcon, newShowAddButton);
    setNewName("");
    setNewColor("blue");
    setNewIcon("Folder");
    setNewShowAddButton(true);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditIcon(cat.icon || "Folder");
    setEditShowAddButton(cat.showAddButton !== false);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdate(editingId, editName.trim(), editColor, editIcon, editShowAddButton);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const canDelete = categories.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Add new category */}
          <div className="space-y-3 p-3 border rounded-lg bg-secondary/30">
            <Label className="text-sm font-medium">Add New Category</Label>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
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
            </div>
            <div className="flex gap-2 items-center">
              <Select value={newIcon} onValueChange={setNewIcon}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <span className="flex items-center gap-2">
                        {renderCategoryIcon("", icon.value, "w-4 h-4")}
                        {icon.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 flex-1">
                <Switch
                  checked={newShowAddButton}
                  onCheckedChange={setNewShowAddButton}
                  id="new-show-add"
                />
                <Label htmlFor="new-show-add" className="text-xs">Show Add</Label>
              </div>
              <Button size="icon" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category list */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-3 rounded-md bg-secondary/50"
              >
                {editingId === cat.id ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
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
                    </div>
                    <div className="flex gap-2 items-center">
                      <Select value={editIcon} onValueChange={setEditIcon}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ICONS.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <span className="flex items-center gap-2">
                                {renderCategoryIcon("", icon.value, "w-4 h-4")}
                                {icon.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 flex-1">
                        <Switch
                          checked={editShowAddButton}
                          onCheckedChange={setEditShowAddButton}
                          id="edit-show-add"
                        />
                        <Label htmlFor="edit-show-add" className="text-xs">Add</Label>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 flex items-center justify-center">
                      {renderCategoryIcon(cat.name, cat.icon)}
                    </div>
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
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          disabled={!canDelete}
                        >
                          <Trash2 className={`h-3.5 w-3.5 ${canDelete ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete "{cat.name}". Items in this category ({bookmarkCounts[cat.id] || 0}) will be moved to "Others".
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
import { useState, useMemo } from "react";
import { Trash2, FolderOpen } from "lucide-react";
import { Category } from "@/types/bookmark";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClearCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  bookmarkCounts: Record<string, number>;
  onClearCategory: (categoryId: string) => void;
}

export function ClearCategoryDialog({
  open,
  onOpenChange,
  categories,
  bookmarkCounts,
  onClearCategory,
}: ClearCategoryDialogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Get count for selected category
  const totalCount = useMemo(() => {
    if (!selectedCategoryId) return 0;
    return bookmarkCounts[selectedCategoryId] || 0;
  }, [selectedCategoryId, bookmarkCounts]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleClear = () => {
    if (selectedCategoryId) {
      onClearCategory(selectedCategoryId);
      setConfirmOpen(false);
      onOpenChange(false);
      setSelectedCategoryId("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Clear Category Items
            </DialogTitle>
            <DialogDescription>
              Delete all items from a specific category. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Select Category
              </Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const count = bookmarkCounts[category.id] || 0;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({count} items)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedCategoryId && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm">
                  <strong>{totalCount}</strong> items will be deleted from{" "}
                  <strong>{selectedCategory?.name}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedCategoryId || totalCount === 0}
            >
              Clear Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {totalCount} items from "{selectedCategory?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

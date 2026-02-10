import { useState, useMemo } from "react";
import { Download, FolderOpen, FileType } from "lucide-react";
import { Bookmark, Category } from "@/types/bookmark";
import { getTypeLabel } from "@/utils/typeLabels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface AdvancedExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarks: Bookmark[];
  categories: Category[];
}

export function AdvancedExportDialog({
  open,
  onOpenChange,
  bookmarks,
  categories,
}: AdvancedExportDialogProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Get non-private bookmarks only
  const exportableBookmarks = useMemo(
    () => bookmarks.filter((b) => !b.private),
    [bookmarks]
  );

  // Calculate filtered count
  const filteredCount = useMemo(() => {
    let filtered = exportableBookmarks;

    // Filter by categories if any selected
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((b) => {
        const ids = b.categoryIds || [b.categoryId];
        return ids.some((id) => selectedCategoryIds.includes(id));
      });
    }

    // Filter by types if any selected
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((b) => selectedTypes.includes(b.type));
    }

    return filtered.length;
  }, [exportableBookmarks, selectedCategoryIds, selectedTypes]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map((c) => c.id));
    }
  };

  const handleSelectAllTypes = () => {
    const allTypes = ["website", "app", "url", "note"];
    if (selectedTypes.length === allTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(allTypes);
    }
  };

  const handleExport = () => {
    let filtered = exportableBookmarks;

    // Filter by categories if any selected
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((b) => {
        const ids = b.categoryIds || [b.categoryId];
        return ids.some((id) => selectedCategoryIds.includes(id));
      });
    }

    // Filter by types if any selected
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((b) => selectedTypes.includes(b.type));
    }

    // Get relevant categories (only those that have items)
    const relevantCategoryIds = new Set<string>();
    filtered.forEach((b) => {
      const ids = b.categoryIds || [b.categoryId];
      ids.forEach((id) => relevantCategoryIds.add(id));
    });

    const relevantCategories = categories.filter((c) => relevantCategoryIds.has(c.id));

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks: filtered,
      categories: relevantCategories,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shelf-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filtered.length} items`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Items
          </DialogTitle>
          <DialogDescription>
            Select categories and types to export. Private items are excluded.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Categories Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Categories
              </Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAllCategories}>
                {selectedCategoryIds.length === categories.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <span className="text-sm truncate">{category.name}</span>
                </label>
              ))}
            </div>
            {selectedCategoryIds.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No selection = export all categories
              </p>
            )}
          </div>

          <Separator />

          {/* Types Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileType className="w-4 h-4" />
                Item Types
              </Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAllTypes}>
                {selectedTypes.length === 4 ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["website", "app", "url", "note"] as const).map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <span className="text-sm">{getTypeLabel(type)}</span>
                </label>
              ))}
            </div>
            {selectedTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No selection = export all types
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="text-sm text-muted-foreground">
            {filteredCount} items will be exported
          </div>
          <Button onClick={handleExport} disabled={filteredCount === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

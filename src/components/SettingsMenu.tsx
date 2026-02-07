import { useState } from "react";
import { Settings, Moon, Sun, Monitor, Download, Upload, FolderOpen, LayoutGrid, Type, RotateCcw, Trash2, Grid3X3, Lock, KeyRound, Palette, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { Bookmark, Category, AppSettings, ThemeMode, CardSize, GridColumns, HoverBoardPosition } from "@/types/bookmark";
import { ColorPalette } from "@/types/palette";
import { usePrivateSpace } from "@/contexts/PrivateSpaceContext";
import { usePalette } from "@/hooks/usePalette";
import { PinDialog } from "@/components/PinDialog";
import { PaletteSelector } from "@/components/PaletteSelector";
import { AdvancedExportDialog } from "@/components/AdvancedExportDialog";
import { ClearCategoryDialog } from "@/components/ClearCategoryDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SettingsMenuProps {
  bookmarks: Bookmark[];
  categories: Category[];
  settings: AppSettings;
  onImport: (bookmarks: Bookmark[], categories: Category[], persist?: boolean) => void;
  onOpenCategoryManager: () => void;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  onClearData: () => void;
  onClearPrivateData?: () => void;
  onClearCategoryData?: (categoryId: string) => void;
  bookmarkCounts?: Record<string, number>;
}

export function SettingsMenu({
  bookmarks,
  categories,
  settings,
  onImport,
  onOpenCategoryManager,
  onUpdateSetting,
  onResetSettings,
  onClearData,
  onClearPrivateData,
  onClearCategoryData,
  bookmarkCounts = {},
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [clearCategoryDialogOpen, setClearCategoryDialogOpen] = useState(false);
  const { hasPin, changePin, setPin } = usePrivateSpace();
  const {
    selectedPaletteId,
    customPalette,
    privateSpaceUseGlobalPalette,
    selectPalette,
    updateCustomPalette,
    setPrivateSpaceUseGlobalPalette,
  } = usePalette();

  const handleImport = (persistItems: boolean = false) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.bookmarks && data.categories) {
            // Filter out private items from import
            const nonPrivateBookmarks = data.bookmarks.filter((b: Bookmark) => !b.private);
            if (persistItems && settings.persistOnImport) {
              onImport(nonPrivateBookmarks, data.categories, true);
            } else {
              onImport(nonPrivateBookmarks, data.categories, false);
            }
            toast.success(`Restored ${nonPrivateBookmarks.length} items and ${data.categories.length} categories`);
          } else {
            toast.error("Invalid backup file format");
          }
        } catch {
          toast.error("Failed to import backup");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetSettings = () => {
    onResetSettings();
    toast.success("Settings reset to defaults");
  };

  const handleClearData = () => {
    onClearData();
    setOpen(false);
    toast.success("All items deleted");
  };

  const handleClearPrivateData = () => {
    if (onClearPrivateData) {
      onClearPrivateData();
      setOpen(false);
      toast.success("Private Space data cleared");
    }
  };

  const handleClearCategoryData = (categoryId: string) => {
    if (onClearCategoryData) {
      onClearCategoryData(categoryId);
      toast.success("Category items cleared");
    }
  };

  const handlePinChange = (newPin: string, oldPin?: string) => {
    if (hasPin && oldPin) {
      const success = changePin(oldPin, newPin);
      if (success) {
        toast.success("PIN changed successfully");
        setPinDialogOpen(false);
      }
      return success;
    } else {
      setPin(newPin);
      toast.success("PIN created successfully");
      setPinDialogOpen(false);
      return true;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-6 overflow-y-auto flex-1 -mx-6 px-6">
            {/* Appearance Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Theme Mode</Label>
                  <Select
                    value={settings.themeMode}
                    onValueChange={(v) => onUpdateSetting("themeMode", v as ThemeMode)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" /> Auto
                        </span>
                      </SelectItem>
                      <SelectItem value="light">
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" /> Light
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                          <Moon className="h-4 w-4" /> Dark
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Color Palette Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Palette
              </h3>
              <PaletteSelector
                selectedPaletteId={selectedPaletteId}
                customPalette={customPalette}
                onSelectPalette={selectPalette}
                onUpdateCustomPalette={updateCustomPalette}
              />
            </div>

            <Separator />

            {/* Layout Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Layout
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Grid Columns</Label>
                  <Select
                    value={settings.gridColumns}
                    onValueChange={(v) => onUpdateSetting("gridColumns", v as GridColumns)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Card Size</Label>
                  <Select
                    value={settings.cardSize}
                    onValueChange={(v) => onUpdateSetting("cardSize", v as CardSize)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Category Board Position</Label>
                  <Select
                    value={settings.hoverBoardPosition || "bottom"}
                    onValueChange={(v) => onUpdateSetting("hoverBoardPosition", v as HoverBoardPosition)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">
                        <span className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" /> Top
                        </span>
                      </SelectItem>
                      <SelectItem value="bottom">
                        <span className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" /> Bottom
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Display Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Display
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Descriptions</Label>
                  <Switch
                    checked={settings.showDescriptions}
                    onCheckedChange={(v) => onUpdateSetting("showDescriptions", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Notes</Label>
                  <Switch
                    checked={settings.showNotes}
                    onCheckedChange={(v) => onUpdateSetting("showNotes", v)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Category Management */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onOpenCategoryManager();
                  setOpen(false);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Categories
              </Button>
            </div>

            <Separator />

            {/* Backup & Restore */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Backup & Restore
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Persist items on Import</Label>
                  <Switch
                    checked={settings.persistOnImport}
                    onCheckedChange={(v) => onUpdateSetting("persistOnImport", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={() => handleImport(settings.persistOnImport)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Private items are excluded from export/import
                </p>
              </div>
            </div>

            <Separator />

            {/* Private Space */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Private Space
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setPinDialogOpen(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                {hasPin ? "Change PIN" : "Create PIN"}
              </Button>
              <div className="flex items-center justify-between">
                <Label>Use global palette in Private Space</Label>
                <Switch
                  checked={privateSpaceUseGlobalPalette}
                  onCheckedChange={setPrivateSpaceUseGlobalPalette}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {hasPin 
                  ? "Your Private Space is protected with a PIN"
                  : "Set up a PIN to protect your private items"}
              </p>
            </div>

            <Separator />

            {/* Reset Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2 text-destructive">
                <RotateCcw className="h-4 w-4" />
                Reset
              </h3>
              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset App Settings
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Settings?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset theme, layout, and UI preferences to defaults. Your items and categories will NOT be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetSettings}>
                        Reset Settings
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {onClearCategoryData && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setClearCategoryDialogOpen(true)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Clear Category Items
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete ALL items. Categories and settings will be preserved. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete All Items
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {onClearPrivateData && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                        <Lock className="h-4 w-4 mr-2" />
                        Clear Private Space Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Private Space Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all private items only. Regular items, categories, and settings will be preserved. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearPrivateData}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Private Items
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>

          <PinDialog
            open={pinDialogOpen}
            onOpenChange={setPinDialogOpen}
            mode={hasPin ? "change" : "setup"}
            onSubmit={handlePinChange}
          />
        </SheetContent>
      </Sheet>

      <AdvancedExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        bookmarks={bookmarks}
        categories={categories}
      />

      <ClearCategoryDialog
        open={clearCategoryDialogOpen}
        onOpenChange={setClearCategoryDialogOpen}
        categories={categories}
        bookmarkCounts={bookmarkCounts}
        onClearCategory={handleClearCategoryData}
      />
    </>
  );
}

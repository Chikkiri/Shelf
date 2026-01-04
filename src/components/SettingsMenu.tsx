import { useState } from "react";
import { Settings, Moon, Sun, Monitor, Download, Upload, FolderOpen, LayoutGrid, Type, RotateCcw, Trash2, List, Grid3X3, Lock, KeyRound, Palette, ArrowUp, ArrowDown } from "lucide-react";
import { Bookmark, Category, AppSettings, ThemeMode, CardSize, LayoutView, GridColumns, HoverBoardPosition } from "@/types/bookmark";
import { usePrivateSpace } from "@/contexts/PrivateSpaceContext";
import { PinDialog } from "@/components/PinDialog";
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
  onImport: (bookmarks: Bookmark[], categories: Category[]) => void;
  onOpenCategoryManager: () => void;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  onClearData: () => void;
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
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const { hasPin, changePin, setPin } = usePrivateSpace();

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks,
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shelf-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup exported successfully");
  };

  const handleImport = () => {
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
            onImport(data.bookmarks, data.categories);
            toast.success(`Restored ${data.bookmarks.length} items and ${data.categories.length} categories`);
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
              <div className="flex items-center justify-between">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border"
                    style={{ backgroundColor: settings.accentColor || "#3b82f6" }}
                  />
                  <input
                    type="color"
                     value={settings.accentColor || "#3b82f6"}
                    onChange={(e) => onUpdateSetting("accentColor", e.target.value)}
                    className="w-10 h-8 cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
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
                <Label>View Style</Label>
                <Select
                  value={settings.layoutView}
                  onValueChange={(v) => onUpdateSetting("layoutView", v as LayoutView)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">
                      <span className="flex items-center gap-2">
                        <List className="h-4 w-4" /> List
                      </span>
                    </SelectItem>
                    <SelectItem value="grid">
                      <span className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" /> Grid
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {settings.layoutView === "grid" && (
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
              )}

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

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories
            </h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                onOpenCategoryManager();
              }}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
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
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
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
  );
}

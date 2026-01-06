import { useState } from "react";
import { Settings, LayoutGrid, Type, RotateCcw, Trash2, List, Grid3X3, FolderOpen, ArrowUp, ArrowDown, Lock } from "lucide-react";
import { AppSettings, CardSize, LayoutView, GridColumns, HoverBoardPosition } from "@/types/bookmark";
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

interface PrivateSpaceSettingsMenuProps {
  settings: AppSettings;
  onOpenCategoryManager: () => void;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  onClearPrivateData: () => void;
}

export function PrivateSpaceSettingsMenu({
  settings,
  onOpenCategoryManager,
  onUpdateSetting,
  onResetSettings,
  onClearPrivateData,
}: PrivateSpaceSettingsMenuProps) {
  const [open, setOpen] = useState(false);

  const handleResetSettings = () => {
    onResetSettings();
    toast.success("Settings reset to defaults");
  };

  const handleClearPrivateData = () => {
    onClearPrivateData();
    setOpen(false);
    toast.success("Private Space data cleared");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 private-space-button">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col bg-popover">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="private-space-text">Private Space Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6 overflow-y-auto flex-1 -mx-6 px-6">
          {/* Layout Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 private-space-text">
              <LayoutGrid className="h-4 w-4" />
              Layout
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="private-space-text">View Style</Label>
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
                  <Label className="private-space-text">Grid Columns</Label>
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
                <Label className="private-space-text">Card Size</Label>
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
                <Label className="private-space-text">Category Board Position</Label>
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
            <h3 className="text-sm font-medium flex items-center gap-2 private-space-text">
              <Type className="h-4 w-4" />
              Display
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="private-space-text">Show Descriptions</Label>
                <Switch
                  checked={settings.showDescriptions}
                  onCheckedChange={(v) => onUpdateSetting("showDescriptions", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="private-space-text">Show Notes</Label>
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
            <h3 className="text-sm font-medium flex items-center gap-2 private-space-text">
              <FolderOpen className="h-4 w-4" />
              Categories
            </h3>
            <Button
              variant="outline"
              className="w-full justify-start private-space-button"
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

          {/* Reset Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-destructive">
              <RotateCcw className="h-4 w-4" />
              Reset
            </h3>
            <div className="space-y-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start private-space-button">
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
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive private-space-button">
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
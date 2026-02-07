import { Check } from "lucide-react";
import { ColorPalette, STOCK_PALETTES } from "@/types/palette";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface PaletteSelectorProps {
  selectedPaletteId: string;
  customPalette: ColorPalette;
  onSelectPalette: (paletteId: string) => void;
  onUpdateCustomPalette: (colors: ColorPalette["colors"]) => void;
}

export function PaletteSelector({
  selectedPaletteId,
  customPalette,
  onSelectPalette,
  onUpdateCustomPalette,
}: PaletteSelectorProps) {
  const [customOpen, setCustomOpen] = useState(selectedPaletteId === "custom");

  return (
    <div className="space-y-4">
      {/* Stock Palettes Grid */}
      <div className="grid grid-cols-4 gap-2">
        {STOCK_PALETTES.map((palette) => (
          <button
            key={palette.id}
            onClick={() => onSelectPalette(palette.id)}
            className={`relative p-2 rounded-lg border-2 transition-all ${
              selectedPaletteId === palette.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Color preview */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: palette.colors.primary }}
                />
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: palette.colors.secondary }}
                />
              </div>
              <div className="flex gap-0.5">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: palette.colors.accent }}
                />
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: palette.colors.muted }}
                />
              </div>
            </div>
            <span className="text-[10px] font-medium mt-1 block truncate">
              {palette.name}
            </span>
            {selectedPaletteId === palette.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Palette */}
      <Collapsible open={customOpen} onOpenChange={setCustomOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between ${
              selectedPaletteId === "custom" ? "border-primary" : ""
            }`}
            onClick={() => {
              if (!customOpen) {
                onSelectPalette("custom");
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Object.values(customPalette.colors).slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span>Custom Palette</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${customOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Primary</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: customPalette.colors.primary }}
                />
                <Input
                  type="color"
                  value={customPalette.colors.primary}
                  onChange={(e) =>
                    onUpdateCustomPalette({
                      ...customPalette.colors,
                      primary: e.target.value,
                    })
                  }
                  className="w-12 h-8 p-0 border-0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Secondary</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: customPalette.colors.secondary }}
                />
                <Input
                  type="color"
                  value={customPalette.colors.secondary}
                  onChange={(e) =>
                    onUpdateCustomPalette({
                      ...customPalette.colors,
                      secondary: e.target.value,
                    })
                  }
                  className="w-12 h-8 p-0 border-0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Accent</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: customPalette.colors.accent }}
                />
                <Input
                  type="color"
                  value={customPalette.colors.accent}
                  onChange={(e) =>
                    onUpdateCustomPalette({
                      ...customPalette.colors,
                      accent: e.target.value,
                    })
                  }
                  className="w-12 h-8 p-0 border-0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Muted</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: customPalette.colors.muted }}
                />
                <Input
                  type="color"
                  value={customPalette.colors.muted}
                  onChange={(e) =>
                    onUpdateCustomPalette({
                      ...customPalette.colors,
                      muted: e.target.value,
                    })
                  }
                  className="w-12 h-8 p-0 border-0"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

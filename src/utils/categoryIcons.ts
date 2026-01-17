import {
  Layers,
  Briefcase,
  Palette,
  Gamepad2,
  Code2,
  MoreHorizontal,
  Folder,
  Music,
  Video,
  Camera,
  Book,
  ShoppingBag,
  Heart,
  Star,
  Globe,
  Cpu,
  Coffee,
  Zap,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";
import React from "react";

// Map of icon names to their components
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Briefcase,
  Palette,
  Gamepad2,
  Code2,
  MoreHorizontal,
  Folder,
  Music,
  Video,
  Camera,
  Book,
  ShoppingBag,
  Heart,
  Star,
  Globe,
  Cpu,
  Coffee,
  Zap,
  Home,
  Settings,
};

// Available icons for selection
export const AVAILABLE_ICONS = [
  { value: "Briefcase", label: "Work" },
  { value: "Palette", label: "Design" },
  { value: "Gamepad2", label: "Games" },
  { value: "Code2", label: "Code" },
  { value: "MoreHorizontal", label: "More" },
  { value: "Folder", label: "Folder" },
  { value: "Music", label: "Music" },
  { value: "Video", label: "Video" },
  { value: "Camera", label: "Camera" },
  { value: "Book", label: "Book" },
  { value: "ShoppingBag", label: "Shopping" },
  { value: "Heart", label: "Heart" },
  { value: "Star", label: "Star" },
  { value: "Globe", label: "Globe" },
  { value: "Cpu", label: "Tech" },
  { value: "Coffee", label: "Coffee" },
  { value: "Zap", label: "Energy" },
  { value: "Home", label: "Home" },
  { value: "Settings", label: "Settings" },
];

// Default icon mappings based on category name
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  "Productivity": "Briefcase",
  "Design": "Palette",
  "Entertainment": "Gamepad2",
  "Development": "Code2",
  "Others": "MoreHorizontal",
};

// Get icon component for a category
export function getCategoryIcon(
  categoryName: string,
  customIcon?: string
): LucideIcon {
  if (customIcon && CATEGORY_ICON_MAP[customIcon]) {
    return CATEGORY_ICON_MAP[customIcon];
  }
  
  const defaultIcon = DEFAULT_CATEGORY_ICONS[categoryName];
  if (defaultIcon && CATEGORY_ICON_MAP[defaultIcon]) {
    return CATEGORY_ICON_MAP[defaultIcon];
  }
  
  return Folder;
}

// Render icon element
export function renderCategoryIcon(
  categoryName: string,
  customIcon?: string,
  className: string = "w-5 h-5"
): React.ReactElement {
  const IconComponent = getCategoryIcon(categoryName, customIcon);
  return React.createElement(IconComponent, { className });
}
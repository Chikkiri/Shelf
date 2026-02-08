import { Smartphone, Monitor, Apple, Globe, Lock, DollarSign, LucideIcon, Tag } from "lucide-react";

export interface ItemTag {
  id: string;
  name: string;
  icon?: string; // Icon name from lucide-react
  isStock?: boolean; // Stock tags can't be fully removed, only hidden
}

// Stock tags with predefined icons
export const STOCK_TAGS: ItemTag[] = [
  { id: "android", name: "Android", icon: "Smartphone", isStock: true },
  { id: "windows", name: "Windows", icon: "Monitor", isStock: true },
  { id: "apple", name: "Apple", icon: "Apple", isStock: true },
  { id: "foss", name: "FOSS", icon: "Globe", isStock: true },
  { id: "limited", name: "Limited", icon: "Lock", isStock: true },
  { id: "paid", name: "Paid", icon: "DollarSign", isStock: true },
];

// Tag icon mapping
export const TAG_ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Lock,
  DollarSign,
  Tag,
};

export function getTagIcon(iconName?: string): LucideIcon {
  if (iconName && TAG_ICONS[iconName]) {
    return TAG_ICONS[iconName];
  }
  return Tag;
}

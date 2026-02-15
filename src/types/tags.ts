import { Smartphone, Monitor, Apple, Globe, Lock, DollarSign, LucideIcon, Tag, Heart, Zap, Shield, Wifi, Cloud, Star, Eye, Hash, Flame, Clock, Award, BookOpen, Camera, Code, Compass, Database, Feather, Gift, Headphones, Key, Layers, Link, Mail, Map, Music, Package, Phone, Printer, Radio, Scissors, Send, Server, ShoppingCart, Speaker, Terminal, Tv, Umbrella, Users, Video, Volume2, Watch } from "lucide-react";

export interface ItemTag {
  id: string;
  name: string;
  icon?: string; // Icon name from lucide-react
  color?: string; // HEX color for the tag
  isStock?: boolean; // Stock tags can't be fully removed, only hidden
}

// Stock tags with predefined icons
export const STOCK_TAGS: ItemTag[] = [
  { id: "android", name: "Android", icon: "Smartphone", color: "#3DDC84", isStock: true },
  { id: "windows", name: "Windows", icon: "Monitor", color: "#0078D4", isStock: true },
  { id: "apple", name: "Apple", icon: "Apple", color: "#A2AAAD", isStock: true },
  { id: "foss", name: "FOSS", icon: "Globe", color: "#4CAF50", isStock: true },
  { id: "limited", name: "Limited", icon: "Lock", color: "#FF9800", isStock: true },
  { id: "paid", name: "Paid", icon: "DollarSign", color: "#F44336", isStock: true },
];

// All available icons for tag customization
export const AVAILABLE_TAG_ICONS: Record<string, LucideIcon> = {
  Tag,
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Lock,
  DollarSign,
  Heart,
  Zap,
  Shield,
  Wifi,
  Cloud,
  Star,
  Eye,
  Hash,
  Flame,
  Clock,
  Award,
  BookOpen,
  Camera,
  Code,
  Compass,
  Database,
  Feather,
  Gift,
  Headphones,
  Key,
  Layers,
  Link,
  Mail,
  Map,
  Music,
  Package,
  Phone,
  Printer,
  Radio,
  Scissors,
  Send,
  Server,
  ShoppingCart,
  Speaker,
  Terminal,
  Tv,
  Umbrella,
  Users,
  Video,
  Volume2,
  Watch,
};

// Tag icon mapping (legacy + new)
export const TAG_ICONS: Record<string, LucideIcon> = AVAILABLE_TAG_ICONS;

export function getTagIcon(iconName?: string): LucideIcon {
  if (iconName && TAG_ICONS[iconName]) {
    return TAG_ICONS[iconName];
  }
  return Tag;
}

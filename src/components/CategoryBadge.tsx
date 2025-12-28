import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  color: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-category-blue/15 text-category-blue",
  green: "bg-category-green/15 text-category-green",
  purple: "bg-category-purple/15 text-category-purple",
  pink: "bg-category-pink/15 text-category-pink",
  teal: "bg-category-teal/15 text-category-teal",
  orange: "bg-category-orange/15 text-category-orange",
};

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorMap[color] || colorMap.blue,
        className
      )}
    >
      {name}
    </span>
  );
}

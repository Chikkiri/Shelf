import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  size?: "sm" | "md";
  isFavorite?: boolean;
}

export function RatingDisplay({ rating, size = "md", isFavorite = false }: RatingDisplayProps) {
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  
  if (rating === 0) {
    return (
      <span className={`${textSize} text-muted-foreground/60`}>—</span>
    );
  }

  const starColor = isFavorite
    ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]"
    : "fill-primary/80 text-primary";

  return (
    <div className="flex items-center gap-0.5">
      <span className={`${textSize} font-medium ${isFavorite ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>{rating}</span>
      <Star
        className={`${sizeClasses} ${starColor}`}
        strokeWidth={1.5}
      />
    </div>
  );
}

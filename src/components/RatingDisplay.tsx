import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  size?: "sm" | "md";
}

export function RatingDisplay({ rating, size = "md" }: RatingDisplayProps) {
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  
  if (rating === 0) {
    return (
      <span className={`${textSize} text-muted-foreground/60`}>—</span>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <span className={`${textSize} font-medium text-muted-foreground`}>{rating}</span>
      <Star
        className={`${sizeClasses} fill-primary/80 text-primary`}
        strokeWidth={1.5}
      />
    </div>
  );
}

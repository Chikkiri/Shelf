import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function StarRating({ rating, onRatingChange, readonly = false, size = "md" }: StarRatingProps) {
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            "transition-all duration-200",
            !readonly && "hover:scale-125 cursor-pointer active:scale-95",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses,
              "transition-colors duration-200",
              star <= rating
                ? "fill-primary/80 text-primary"
                : "fill-transparent text-muted-foreground/40"
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

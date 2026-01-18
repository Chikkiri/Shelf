import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
  allowClear?: boolean;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = "md",
  allowClear = false 
}: StarRatingProps) {
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const clearSizeClasses = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  
  const handleStarClick = (star: number) => {
    if (readonly) return;
    // If clicking the same star, clear rating
    if (star === rating && allowClear) {
      onRatingChange?.(0);
    } else {
      onRatingChange?.(star);
    }
  };
  
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleStarClick(star)}
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
      {/* Clear button - only shown when not readonly, allowClear is true, and has a rating */}
      {!readonly && allowClear && rating > 0 && (
        <button
          type="button"
          onClick={() => onRatingChange?.(0)}
          className="ml-1 p-0.5 rounded-full hover:bg-muted transition-colors"
          title="Clear rating"
        >
          <X className={cn(clearSizeClasses, "text-muted-foreground hover:text-foreground")} />
        </button>
      )}
    </div>
  );
}

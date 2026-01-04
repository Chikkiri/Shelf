import { ExternalLink, Globe, Heart, Pencil, Pin, Play, Share2, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bookmark, Category, AppSettings } from "@/types/bookmark";
import { StarRating } from "./StarRating";
import { RatingDisplay } from "./RatingDisplay";
import { CategoryBadge } from "./CategoryBadge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface BookmarkCardProps {
  bookmark: Bookmark;
  categories: Category[];
  settings: AppSettings;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function BookmarkCard({ 
  bookmark, 
  categories, 
  settings,
  onEdit, 
  onDelete,
  onToggleFavorite,
}: BookmarkCardProps) {
  const isApp = bookmark.type === "app";
  const isMobile = useIsMobile();
  const hasPlayStore = isApp && bookmark.playStoreUrl;

  // Get all categories for this bookmark
  const bookmarkCategories = categories.filter((c) => {
    const ids = bookmark.categoryIds || [bookmark.categoryId];
    return ids.includes(c.id);
  });

  // For apps: show dropdown only on mobile AND if Play Store URL exists
  const showDropdown = isApp && isMobile && hasPlayStore;

  // Card size padding only
  const paddingClasses = {
    small: "p-3",
    medium: "p-4",
    large: "p-5",
  };

  const handleShare = async () => {
    const cleanUrl = bookmark.url.split("?")[0]; // Remove tracking params

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: bookmark.name,
          url: cleanUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(cleanUrl);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className={`group bg-card rounded-xl ${paddingClasses[settings.cardSize]} elevation-1 hover:elevation-2 transition-all duration-200 border border-border/40 flex flex-col h-full`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {bookmark.pinned && (
              <Pin className="h-3 w-3 text-primary flex-shrink-0" />
            )}
            {bookmark.favorite && (
              <Heart className="h-3 w-3 text-destructive fill-destructive flex-shrink-0" />
            )}
            <h3 className={`font-medium text-card-foreground truncate ${settings.cardSize === "large" ? "text-base" : "text-sm"}`}>
              {bookmark.name}
            </h3>
            {isApp && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium leading-none">
                App
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {bookmarkCategories.map((cat) => (
              <CategoryBadge key={cat.id} name={cat.name} color={cat.color} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleFavorite(bookmark.id)}
          >
            <Heart className={`h-3.5 w-3.5 ${bookmark.favorite ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(bookmark)}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{bookmark.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(bookmark.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {settings.showDescriptions && bookmark.description && (
        <p className={`text-muted-foreground line-clamp-2 mt-2 ${settings.cardSize === "small" ? "text-xs" : "text-sm"}`}>
          {bookmark.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
        <RatingDisplay rating={bookmark.rating} size="sm" />
        
        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-primary hover:text-primary font-medium gap-1.5"
              >
                Visit
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem asChild>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                  Open Website
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={bookmark.playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  Open Play Store
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
          >
            Visit
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {settings.showNotes && bookmark.notes && (
        <p className={`mt-2 text-muted-foreground/80 italic ${settings.cardSize === "small" ? "text-[11px]" : "text-xs"}`}>
          "{bookmark.notes}"
        </p>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { ExternalLink, Globe, Bookmark as BookmarkIcon, Link, Pencil, Pin, Play, Share2, Tag, Trash2, Copy, ArrowRightLeft, Star, ExternalLink as Visit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bookmark, Category, AppSettings } from "@/types/bookmark";
import { ItemTag } from "@/types/tags";
import { RatingDisplay } from "./RatingDisplay";
import { CategoryBadge } from "./CategoryBadge";
import { TagDisplay, HighlightedText } from "./TagSelector";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getTypeLabel } from "@/utils/typeLabels";

interface BookmarkCardProps {
  bookmark: Bookmark;
  categories: Category[];
  customTags?: ItemTag[];
  allTags?: ItemTag[];
  allBookmarks?: Bookmark[];
  settings: AppSettings;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  searchHighlight?: string;
}

export function BookmarkCard({ 
  bookmark, 
  categories,
  customTags = [],
  allTags,
  allBookmarks = [],
  settings,
  onEdit, 
  onDelete,
  onToggleFavorite,
  searchHighlight,
}: BookmarkCardProps) {
  const isApp = bookmark.type === "app";
  const isNote = bookmark.type === "note";
  const isMobile = useIsMobile();
  const hasPlayStore = isApp && bookmark.playStoreUrl;

  const bookmarkCategories = categories.filter((c) => {
    const ids = bookmark.categoryIds || [bookmark.categoryId];
    return ids.includes(c.id);
  });

  const showDropdown = isApp && isMobile && hasPlayStore;

  const paddingClasses = {
    small: "p-3",
    medium: "p-4",
    large: "p-5",
  };

  const handleShare = async () => {
    const cleanUrl = bookmark.url.split("?")[0];
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title: bookmark.name, url: cleanUrl });
      } catch (err) {
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

  const handleCopyContent = async () => {
    const text = bookmark.content || bookmark.notes || "";
    if (!text) {
      toast.error("No content to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard");
    } catch {
      toast.error("Failed to copy text");
    }
  };

  // Get alternate bookmarks (bidirectional: if A lists B, B also shows A)
  const alternateBookmarks = useMemo(() => {
    const directAlts = bookmark.alternates || [];
    const reverseAlts = allBookmarks
      .filter((b) => b.id !== bookmark.id && (b.alternates || []).includes(bookmark.id))
      .map((b) => b.id);
    const allAltIds = Array.from(new Set([...directAlts, ...reverseAlts]));
    return allAltIds
      .map((id) => allBookmarks.find((b) => b.id === id))
      .filter(Boolean) as Bookmark[];
  }, [bookmark.id, bookmark.alternates, allBookmarks]);

  return (
    <div className={`group bg-card rounded-xl ${paddingClasses[settings.cardSize]} elevation-1 hover:elevation-2 transition-all duration-200 border border-border/40 flex flex-col h-full`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {bookmark.pinned && (
              <Pin className="h-3 w-3 text-primary flex-shrink-0" />
            )}
            {bookmark.favorite && (
              <BookmarkIcon className="h-3 w-3 text-palette-primary fill-palette-primary flex-shrink-0" />
            )}
            <h3 className={`font-medium text-card-foreground truncate ${settings.cardSize === "large" ? "text-base" : "text-sm"}`}>
              {searchHighlight ? (
                <HighlightedText text={bookmark.name} highlight={searchHighlight} />
              ) : (
                bookmark.name
              )}
            </h3>
            {bookmark.type === "app" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium leading-none">
                {getTypeLabel("app")}
              </span>
            )}
            {bookmark.type === "url" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium leading-none flex items-center gap-0.5">
                <Link className="h-2.5 w-2.5" />
                {getTypeLabel("url")}
              </span>
            )}
            {bookmark.type === "note" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium leading-none flex items-center gap-0.5">
                <Tag className="h-2.5 w-2.5" />
                Note
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {bookmarkCategories.map((cat) => (
              <CategoryBadge key={cat.id} name={cat.name} color={cat.color} />
            ))}
          </div>
          {bookmark.tags && bookmark.tags.length > 0 && (
            <TagDisplay 
              tagIds={bookmark.tags} 
              customTags={customTags}
              allTags={allTags}
              highlightText={searchHighlight}
            />
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleFavorite(bookmark.id)}
          >
            <BookmarkIcon className={`h-3.5 w-3.5 ${bookmark.favorite ? "text-palette-primary fill-palette-primary" : "text-muted-foreground"}`} />
          </Button>
          {/* Share button - hidden for Note type */}
          {!isNote && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          {/* Copy text button - only for Note type */}
          {isNote && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyContent}
              title="Copy text"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
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

      {/* Note content display */}
      {isNote && bookmark.content && (
        <p className={`text-muted-foreground mt-1 mb-2 whitespace-pre-wrap ${settings.cardSize === "small" ? "text-xs line-clamp-3" : "text-sm line-clamp-4"}`}>
          {searchHighlight ? (
            <HighlightedText text={bookmark.content} highlight={searchHighlight} />
          ) : (
            bookmark.content
          )}
        </p>
      )}

      {settings.showDescriptions && bookmark.description && (
        <p className={`text-muted-foreground line-clamp-2 mt-2 ${settings.cardSize === "small" ? "text-xs" : "text-sm"}`}>
          {searchHighlight ? (
            <HighlightedText text={bookmark.description} highlight={searchHighlight} />
          ) : (
            bookmark.description
          )}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <RatingDisplay rating={bookmark.rating} size="sm" isFavorite={bookmark.favorite} />
          {bookmark.price && (
            <span className={`text-xs font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/80 ${settings.cardSize === "small" ? "text-[10px]" : ""}`}>
              {bookmark.price}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Alternates popover */}
          {alternateBookmarks.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Alternates"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-palette-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0">
                <div className="p-2 border-b border-border">
                  <h4 className="text-xs font-semibold text-palette-primary">Alternates</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {alternateBookmarks.map((alt) => (
                    <div key={alt.id} className="flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-b-0">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium truncate text-card-foreground">{alt.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RatingDisplay rating={alt.rating} size="sm" isFavorite={alt.favorite} />
                          {alt.price && (
                            <span className="text-[10px] font-medium text-muted-foreground">{alt.price}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {alt.url && (
                          <a
                            href={alt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            title="Visit"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

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
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="h-4 w-4" />
                    Open Website
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={bookmark.playStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Play className="h-4 w-4" />
                    Open Play Store
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : bookmark.url ? (
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
            >
              Visit
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      {settings.showNotes && bookmark.notes && (
        <p className={`mt-2 text-muted-foreground/80 italic ${settings.cardSize === "small" ? "text-[11px]" : "text-xs"}`}>
          "{searchHighlight ? (
            <HighlightedText text={bookmark.notes} highlight={searchHighlight} />
          ) : (
            bookmark.notes
          )}"
        </p>
      )}
    </div>
  );
}

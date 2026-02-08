import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { ItemTag, STOCK_TAGS, getTagIcon } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagSelectorProps {
  selectedTags: string[];
  customTags: ItemTag[];
  onTagsChange: (tags: string[]) => void;
  onAddCustomTag: (tag: ItemTag) => void;
  isPrivateSpace?: boolean;
}

export function TagSelector({
  selectedTags,
  customTags,
  onTagsChange,
  onAddCustomTag,
  isPrivateSpace = false,
}: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  // Combine stock tags and custom tags
  const allTags = [...STOCK_TAGS, ...customTags];

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleAddCustomTag = () => {
    if (!newTagName.trim()) return;
    
    // Check if tag already exists
    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    if (existingTag) {
      // Just select the existing tag
      if (!selectedTags.includes(existingTag.id)) {
        onTagsChange([...selectedTags, existingTag.id]);
      }
    } else {
      // Create new custom tag
      const newTag: ItemTag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        icon: "Tag",
        isStock: false,
      };
      onAddCustomTag(newTag);
      onTagsChange([...selectedTags, newTag.id]);
    }
    
    setNewTagName("");
    setShowAddTag(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className="space-y-2">
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          const IconComponent = getTagIcon(tag.icon);
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggleTag(tag.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? isPrivateSpace
                    ? "private-space-chip-active"
                    : "bg-palette-primary text-white"
                  : isPrivateSpace
                    ? "private-space-chip"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <IconComponent className="w-3 h-3" />
              {tag.name}
            </button>
          );
        })}
        
        {/* Add new tag button */}
        {!showAddTag && (
          <button
            type="button"
            onClick={() => setShowAddTag(true)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed transition-colors ${
              isPrivateSpace
                ? "border-gray-400 text-gray-500 hover:border-gray-500"
                : "border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            <Plus className="w-3 h-3" />
            Add Tag
          </button>
        )}
      </div>

      {/* Add new tag input */}
      {showAddTag && (
        <div className="flex gap-2 items-center">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tag name..."
            className="flex-1 h-8 text-sm"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            className="h-8"
            onClick={handleAddCustomTag}
            disabled={!newTagName.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              setShowAddTag(false);
              setNewTagName("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface TagDisplayProps {
  tagIds: string[];
  customTags: ItemTag[];
  highlightText?: string;
}

export function TagDisplay({ tagIds, customTags, highlightText }: TagDisplayProps) {
  const allTags = [...STOCK_TAGS, ...customTags];
  
  if (!tagIds || tagIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tagIds.map((tagId) => {
        const tag = allTags.find((t) => t.id === tagId);
        if (!tag) return null;
        
        const IconComponent = getTagIcon(tag.icon);
        const isHighlighted = highlightText && tag.name.toLowerCase().includes(highlightText.toLowerCase());
        
        return (
          <span
            key={tagId}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/80 text-secondary-foreground"
          >
            <IconComponent className="w-2.5 h-2.5" />
            {isHighlighted ? (
              <HighlightedText text={tag.name} highlight={highlightText} />
            ) : (
              tag.name
            )}
          </span>
        );
      })}
    </div>
  );
}

export function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-palette-secondary/50 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

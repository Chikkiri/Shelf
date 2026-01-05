import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
  isPrivateSpace?: boolean;
}

export function FloatingAddButton({ onClick, isPrivateSpace = false }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full elevation-3 hover:elevation-4 z-50 text-white ${
        isPrivateSpace 
          ? "bg-neutral-600 hover:bg-neutral-500 dark:bg-neutral-500 dark:hover:bg-neutral-400" 
          : "bg-accent-custom hover:bg-accent-custom/90"
      }`}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}

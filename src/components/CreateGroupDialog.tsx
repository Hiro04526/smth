import { CourseGroup } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useDroppable } from "@dnd-kit/core";
import { Plus, PlusSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface CreateGroupDialogProps {
  onCreateGroup: (groupName: string) => void;
  existingGroups: CourseGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export default function CreateGroupDialog({
  onCreateGroup,
  existingGroups,
  open,
  onOpenChange,
  activeId,
  setActiveId,
}: CreateGroupDialogProps) {
  const moveCourseToGroup = useGlobalStore((state) => state.moveCourseToGroup);

  const { setNodeRef, isOver } = useDroppable({
    id: "create-group",
  });
  const [groupName, setGroupName] = useState("");

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name cannot be empty!", {
        description: "Please enter a valid group name.",
      });
      return;
    }

    if (existingGroups.some((group) => group.name === groupName.trim())) {
      toast.error("Group already exists!", {
        description: "Please choose a different name.",
      });
      return;
    }

    onCreateGroup(groupName.trim());

    if (activeId) {
      moveCourseToGroup(groupName.trim(), activeId);
      setActiveId(null);
    }

    setGroupName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "border border-primary/30 border-dashed p-4 rounded-lg text-muted-foreground flex flex-col gap-2 items-center justify-center h-[300px] w-full hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors cursor-pointer",
            isOver && "animate-border-pulse border-primary"
          )}
          ref={setNodeRef}
        >
          <PlusSquare className="size-8" strokeWidth={1.75} />
          <span className="w-44 text-center">
            Drag or Click here to Create New Group
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            autoComplete="off"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGroupName("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="size-4 mr-2" />
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { CourseGroup } from "@/lib/definitions";
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
}

export default function CreateGroupDialog({
  onCreateGroup,
  existingGroups,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name cannot be empty!", {
        description: "Please enter a valid group name.",
      });
      return;
    }

    if (Object.hasOwn(existingGroups, groupName)) {
      toast.error("Group already exists!", {
        description: "Please choose a different name.",
      });
      return;
    }
    onCreateGroup(groupName.trim());
    setGroupName("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="border border-primary/30 border-dashed p-4 rounded-lg text-muted-foreground flex flex-col gap-2 items-center justify-center h-[300px] w-full hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors cursor-pointer">
          <PlusSquare className="size-8" strokeWidth={1.75} />
          <span>Create New Group</span>
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
                const dialog = document.querySelector("dialog");
                if (dialog) {
                  (dialog as any).close();
                }
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

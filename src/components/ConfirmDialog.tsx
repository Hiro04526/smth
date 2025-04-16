import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ConfirmDialogProps {
  onSubmit: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
}

export default function ConfirmDialog({
  onSubmit: action,
  open,
  setOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}: ConfirmDialogProps) {
  const handleClick = () => {
    action();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={handleClick} size="sm">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Class } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import ClassForm from "./ClassForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface EditClassDialogProps {
  data: Class;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EditClassDialog({
  data,
  open,
  setOpen,
}: EditClassDialogProps) {
  const editClass = useGlobalStore((state) => state.editClass);

  const onSubmit = (values: Class) => {
    editClass(data.course, data.code, values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[600px] max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Class Details</DialogTitle>
        </DialogHeader>
        <ClassForm
          onSubmit={onSubmit}
          courseCode={data.course}
          defaultValues={data}
        />
      </DialogContent>
    </Dialog>
  );
}

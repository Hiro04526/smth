import { ColorsEnumSchema } from "@/lib/enums";
import { getCardColors } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, CheckCheck, Palette } from "lucide-react";
import { useState } from "react";
import TooltipButton from "./common/TooltipButton";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "./ui/use-toast";

interface CourseColorsDialogProps {}
export default function CourseColorsDialog({}: CourseColorsDialogProps) {
  const courseColors = useGlobalStore((state) => state.courseColors);
  const setCourseColors = useGlobalStore((state) => state.setCourseColors);

  const [colors, setColors] = useState({ ...courseColors });
  const [open, setOpen] = useState(true);

  const handleSave = () => {
    setCourseColors(colors);
    toast({
      title: "Saved!",
      description: "Your course colors have been saved.",
    });
    setOpen(false);
  };

  console.log("RENDER");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Change Course Colors">
          <Palette className="size-4" />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Course Colors</DialogTitle>
          <DialogDescription>
            Change how your courses colors look!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 w-full">
          {Object.entries(colors).map(([course, color]) => (
            <Card key={course} className="flex flex-col gap-2 p-4">
              <div className="font-bold">{course}</div>
              <div className="grid grid-cols-9 gap-2 w-full h-16">
                {ColorsEnumSchema.options.map((colorEnum) => {
                  const { color: colorCSS } = getCardColors(colorEnum);
                  return (
                    <div
                      key={colorEnum}
                      className={`size-7 ${colorCSS} rounded-full cursor-pointer inline-flex items-center justify-center w-full`}
                      onClick={() =>
                        setColors({ ...colors, [course]: colorEnum })
                      }
                    >
                      {color === colorEnum && <Check className="size-4" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            <CheckCheck className="size-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

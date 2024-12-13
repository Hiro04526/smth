import { ColorsEnumSchema } from "@/lib/enums";
import { getCardColors } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, CheckCheck, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
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
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { toast } from "./ui/use-toast";

interface CourseColorsDialogProps {}
export default function CourseColorsDialog({}: CourseColorsDialogProps) {
  const { courseColors, setCourseColors, randomizeColors, setRandomizeColors } =
    useGlobalStore(
      useShallow((state) => ({
        courseColors: state.courseColors,
        setCourseColors: state.setCourseColors,
        randomizeColors: state.randomizeColors,
        setRandomizeColors: state.setRandomizeColors,
      }))
    );

  const [colors, setColors] = useState(() => ({ ...courseColors }));
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    setCourseColors(colors);
    toast({
      title: "Succesfully saved!",
      description: "Your course colors have been saved.",
    });
    setOpen(false);
  };

  useEffect(() => {
    setColors({ ...courseColors });
  }, [courseColors]);

  console.log(colors);
  console.log(courseColors);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton tooltip="Change Course Colors" variant="outline">
          <Palette className="size-4" />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="h-[75vh]">
        <DialogHeader>
          <DialogTitle>Course Colors</DialogTitle>
          <DialogDescription>
            Change how your courses colors look!
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
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
        </ScrollArea>
        <DialogFooter>
          <div className="flex items-center gap-2 mr-auto">
            <Switch
              id="randomize-colors"
              checked={randomizeColors}
              onCheckedChange={setRandomizeColors}
            />
            <Label htmlFor="randomize-colors">
              Randomize Colors on Generate?
            </Label>
          </div>
          <Button onClick={handleSave}>
            <CheckCheck className="size-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

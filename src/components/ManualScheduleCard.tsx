import useManualSchedule from "@/hooks/useManualSchedule";
import { Course } from "@/lib/definitions";
import {
  calculateHeight,
  cn,
  formatTime,
  minutesToMilitaryTime,
} from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { X } from "lucide-react";
import { useMemo } from "react";
import { CELL_SIZE_PX, TOP_OFFSET } from "./Calendar";
import { Card } from "./ui/card";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

interface ManualScheduleCardProps {
  manualProps: ReturnType<typeof useManualSchedule>;
}
export default function ManualScheduleCard({
  manualProps,
}: ManualScheduleCardProps) {
  const { dragging, selection, setSelection } = manualProps;
  const cellSizePx = CELL_SIZE_PX;
  const selectedData: Course[] = useGlobalStore(
    (state) => state.getSelectedData
  )();

  const startTime = selection ? minutesToMilitaryTime(selection.start) : null;
  const endTime = selection ? minutesToMilitaryTime(selection.end) : null;
  const day = selection ? selection.day : null;

  const viableData = useMemo(() => {
    return selectedData.map((course) => {
      const viableClasses = course.classes.filter(({ schedules }) => {
        return schedules.some(
          (sched) =>
            sched.day === day &&
            startTime === sched.start &&
            endTime === sched.end
        );
      });

      return {
        ...course,
        classes: viableClasses,
      };
    });
  }, [selectedData, startTime, endTime, day]);

  if (!selection) return null;

  return (
    <Popover open={selection && !dragging}>
      <PopoverAnchor asChild>
        <Card
          style={{
            height: calculateHeight({
              start: selection.start,
              end: selection.end,
              cellSizePx,
              type: "minutes",
            }),
            top:
              calculateHeight({
                start: 420,
                end: selection.start,
                type: "minutes",
                cellSizePx,
              }) + TOP_OFFSET,
          }}
          className={cn(
            "bg-primary/10 border-primary/50 animate-border-pulse absolute p-2 flex items-center text-xs justify-between select-none text-accent-foreground w-full",
            dragging && "cursor-grabbing"
          )}
        >
          {`${formatTime(selection.start, "minutes")} - ${formatTime(
            selection.end,
            "minutes"
          )}`}
          <span
            className="rounded-full p-1 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/80 transition-colors duration-200 ease-in-out cursor-pointer"
            onClick={() => setSelection(null)}
          >
            <X className="size-4" />
          </span>
        </Card>
      </PopoverAnchor>
      <PopoverContent side="right">
        <ScrollArea>
          {viableData.map((course) => (
            <div key={course.courseCode} className="flex flex-col gap-2">
              {course.courseCode}
              <div>
                {course.classes.map((currClass) => (
                  <div key={currClass.code} className="">
                    {currClass.code} {currClass.section}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

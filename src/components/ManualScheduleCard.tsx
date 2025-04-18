import useManualSchedule from "@/hooks/useManualSchedule";
import { Class, Course } from "@/lib/definitions";
import { doClassesOverlap } from "@/lib/schedules";
import {
  calculateHeight,
  cn,
  formatTime,
  minutesToMilitaryTime,
  toProperCase,
} from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CELL_SIZE_PX, TOP_OFFSET } from "./Calendar";
import TooltipWrapper from "./common/TooltipWrapper";
import OverviewCard, { ScheduleWithMultipleDays } from "./OverviewCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";

interface ManualScheduleCardProps {
  manualProps: ReturnType<typeof useManualSchedule>;
}
export default function ManualScheduleCard({
  manualProps,
}: ManualScheduleCardProps) {
  const [showOngoing, setShowOngoing] = useState(false);

  const addClass = useGlobalStore((state) => state.addClass);
  const manualSchedule = useGlobalStore((state) => state.manualSchedule);

  const { dragging, selection, setSelection, popoverRef } = manualProps;
  const cellSizePx = CELL_SIZE_PX;
  const selectedData: Course[] = useGlobalStore(
    (state) => state.getSelectedData
  )();

  const startTime = selection ? minutesToMilitaryTime(selection.start) : null;
  const endTime = selection ? minutesToMilitaryTime(selection.end) : null;
  const day = selection ? selection.day : null;

  const is15MinSlot = selection
    ? selection.end - selection.start === 15
    : false;

  const viableData = useMemo(() => {
    if (!startTime || !endTime || !day) return [];

    return selectedData
      .map((course) => {
        const viableClasses = course.classes.filter(({ schedules }) => {
          const overlapsWithExisting = manualSchedule.some(
            ({ schedules: existingSched }) =>
              doClassesOverlap(schedules, existingSched)
          );

          if (overlapsWithExisting) return false;

          if (showOngoing)
            return schedules.some(
              (sched) =>
                sched.day === day &&
                sched.start < endTime &&
                startTime < sched.end
            );

          if (is15MinSlot)
            return schedules.some(
              (sched) => sched.day === day && sched.start === startTime
            );

          return schedules.some(
            (sched) =>
              sched.day === day &&
              startTime <= sched.start &&
              endTime >= sched.end
          );
        });

        return {
          ...course,
          classes: viableClasses,
        };
      })
      .filter((course) => course.classes.length > 0);
  }, [
    selectedData,
    startTime,
    endTime,
    day,
    manualSchedule,
    showOngoing,
    is15MinSlot,
  ]);

  const hasViableData = viableData.length > 0;

  if (!selection) return null;

  const handleAddClass = (classData: Class) => {
    addClass(classData);
    setSelection(null);
  };

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
          {is15MinSlot
            ? `Starts at ${formatTime(selection.start, "minutes")}`
            : `${formatTime(selection.start, "minutes")} - ${formatTime(
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
      <PopoverContent
        side="right"
        className="max-w-[600px] w-max"
        ref={popoverRef}
      >
        <div className="flex flex-row gap-2 items-center w-[500px]">
          {hasViableData ? (
            <h2 className="font-bold text-xl">Select a class</h2>
          ) : (
            <h2>No classes found.</h2>
          )}
          <Switch
            id="between-switch"
            className="ml-auto"
            checked={showOngoing}
            onCheckedChange={setShowOngoing}
          />{" "}
          <Label className="text-nowrap" htmlFor="between-switch">
            Include classes happening during this time?
          </Label>
        </div>
        {hasViableData && (
          <ScrollArea className="mt-2">
            <div className="flex flex-col gap-2 w-full">
              {viableData.map((course) => (
                <div key={course.courseCode} className="flex flex-col gap-2">
                  <h3 className="font-semibold text-sm">{course.courseCode}</h3>
                  <div className="flex flex-col gap-2">
                    {course.classes.map((classData) => (
                      <AvailableClassButton
                        key={classData.code}
                        classData={classData}
                        handleClick={handleAddClass}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface AvailableClassButtonProps {
  classData: Class;
  handleClick: (classData: Class) => void;
}

function AvailableClassButton({
  classData,
  handleClick,
}: AvailableClassButtonProps) {
  const schedules = classData.schedules.reduce<ScheduleWithMultipleDays[]>(
    (acc, curr) => {
      if (curr.start === curr.end) return acc;

      const similarSched = acc.findIndex(
        (sched) =>
          sched.start === curr.start &&
          sched.end === curr.end &&
          sched.date === curr.date
      );

      if (similarSched === -1) {
        acc.push({ ...curr, combinedDays: curr.day });
      } else {
        acc[similarSched].combinedDays += `/${curr.day}`;
      }
      return acc;
    },
    []
  );

  return (
    <TooltipWrapper
      key={classData.code}
      content={
        <OverviewCard
          classData={classData}
          colors={{
            [classData.course]: "EMERALD",
          }}
        />
      }
      delayDuration={0}
      side="right"
    >
      <Button
        className="flex flex-row items-center gap-2 w-full justify-start"
        variant="outline"
        size="sm"
        onClick={() => handleClick(classData)}
      >
        <Badge variant="secondary">{classData.section}</Badge>
        {classData.professor ? toProperCase(classData.professor) : "TBA"}
        <Badge
          className="inline-flex gap-2 items-center ml-auto"
          variant={
            classData.enrollCap === classData.enrolled
              ? "destructive"
              : "default"
          }
        >
          <UsersRound className="size-4" /> {classData.enrolled}/
          {classData.enrollCap}
        </Badge>
      </Button>
    </TooltipWrapper>
  );
}

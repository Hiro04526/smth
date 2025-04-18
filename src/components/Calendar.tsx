"use client";
import useManualSchedule from "@/hooks/useManualSchedule";
import { Class } from "@/lib/definitions";
import { ColorsEnum, DaysEnum } from "@/lib/enums";
import { calculateHeight, cn, getCardColors } from "@/lib/utils";
import { useState } from "react";
import CalendarCard from "./CalendarCard";
import ManualScheduleCard from "./ManualScheduleCard";
import { ScrollArea } from "./ui/scroll-area";

export const CELL_SIZE_PX = 64;
export const CELL_HEIGHT = "h-16";
export const TOP_OFFSET = 16; // Based on 16px (1rem) padding in the calendar
export const LEFT_OFFSET = 66; // Based on 50px + 1rem (16px)

interface BaseCalendarProps {
  classes: Class[];
  colors: Record<string, ColorsEnum>;
  cellSizePx?: number;
  cellHeight?: string;
  isMobile?: boolean;
  manualProps?: ReturnType<typeof useManualSchedule>;
  activeIndex?: number;
}

const Calendar = ({
  classes,
  colors,
  cellSizePx = CELL_SIZE_PX,
  cellHeight = CELL_HEIGHT,
  isMobile = false,
  manualProps,
  activeIndex = 0,
}: BaseCalendarProps) => {
  const { dragging, selection, setSelection, popoverRef, ...listeners } =
    manualProps ?? {};

  const [hovered, setHovered] = useState<number | false>(false);

  const sortedClasses = classes.reduce<
    Record<DaysEnum, (Class & { color: string; shadow: string })[]>
  >(
    (acc, course) => {
      for (const sched of course.schedules) {
        if (sched.day !== "U") {
          const cardColors = getCardColors(colors[course.course]);

          acc[sched.day].push({
            ...cardColors,
            ...course,
          });
        }
      }

      return acc;
    },
    { M: [], T: [], W: [], H: [], F: [], S: [] }
  );

  const headerStyle =
    "relative h-full w-full text-center py-2 px-2 mx-2 font-bold text-muted-foreground";

  return (
    <div className="flex flex-shrink min-h-0 w-full flex-col border rounded-lg bg-background">
      {/* Day Indicator Row */}
      <div className="flex w-full flex-row border-b dark:border-muted py-1">
        <div className="w-[50px] shrink-0" />
        <div className="w-2 shrink-0" />

        <div className={headerStyle}>MONDAY</div>
        <div className={headerStyle}>TUESDAY</div>
        <div className={headerStyle}>WEDNESDAY</div>
        <div className={headerStyle}>THURSDAY</div>
        <div className={headerStyle}>FRIDAY</div>
        <div className={headerStyle}>SATURDAY</div>
      </div>

      {/* Scrollable Container */}
      <ScrollArea>
        {/* Calendar Content */}
        <div className="flex h-max w-full flex-row" {...listeners}>
          {/* Time Column */}
          <div className="ml-2 flex w-[50px] shrink-0 flex-col items-end">
            {[...Array(16)].map((_, index) => (
              <div
                className={cn(`${cellHeight} shrink-0`)}
                key={"time" + index}
              >
                {" "}
                <span className="relative top-[3px] w-7 text-nowrap pr-2 text-right text-xs text-gray-500">
                  {index + 7 > 12 ? index - 5 : index + 7}{" "}
                  {index + 7 >= 12 ? "PM" : "AM"}
                </span>
              </div>
            ))}
          </div>

          <div className="relative flex w-full flex-row">
            {/* Row Separators */}
            <div className="h-full w-0 pt-4">
              {[...Array(16)].map((_, index) => (
                <div
                  className={cn(
                    `${
                      index === 15 ? "h-0" : cellHeight
                    } after:absolute after:h-[1px] after:w-full after:bg-muted/50 after:content-['']`
                  )}
                  key={index}
                />
              ))}
            </div>

            <div className="h-full w-2 shrink-0" />
            {(Object.keys(sortedClasses) as Array<DaysEnum>).map((day) => {
              return (
                <div
                  className={`relative flex h-full w-full flex-col border-l border-muted/50 pr-2 ${
                    ["M", "W", "F"].includes(day) && "bg-muted/10"
                  }`}
                  key={day}
                >
                  {manualProps && selection?.day === day && (
                    <ManualScheduleCard
                      manualProps={manualProps}
                      activeIndex={activeIndex}
                    />
                  )}
                  {sortedClasses[day].map((currClass) => {
                    const schedules = currClass.schedules.filter(
                      (sched) => sched.day === day
                    );

                    return schedules.map((sched, i) => {
                      const start = sched.start;
                      const end = sched.end;

                      return (
                        <CalendarCard
                          key={`${currClass.course}${day}${i}`}
                          currClass={currClass}
                          sched={sched}
                          height={calculateHeight({ start, end, cellSizePx })}
                          top={
                            calculateHeight({
                              start: 700,
                              end: start,
                              cellSizePx,
                            }) + TOP_OFFSET
                          }
                          hovered={hovered}
                          onMouseEnter={() => setHovered(currClass.code)}
                          onMouseLeave={() => setHovered(false)}
                          isMobile={isMobile}
                          isManual={!!manualProps}
                        />
                      );
                    });
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Calendar;

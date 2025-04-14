"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Class } from "@/lib/definitions";
import { cn, convertTime, toProperCase } from "@/lib/utils";

interface CalendarCardProps {
  currClass: Class & { color: string; shadow: string };
  height: number;
  top: number;
  hovered: number | false;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CalendarCard = ({
  currClass,
  height,
  top,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: CalendarCardProps) => {
  const sched = currClass.schedules[0]; // We're rendering one schedule at a time

  return (
    <Card
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        `border-0 p-3 ${
          hovered === currClass.code &&
          `scale-105 shadow-[0_0px_10px_3px_rgba(0,0,0,0.3)]`
        } absolute w-[95%] transition-all ${currClass.color}`,
        hovered === currClass.code && currClass.shadow
      )}
      style={{
        height,
        top,
      }}
    >
      <div className="flex h-full flex-col justify-center gap-1">
        <CardTitle className="text-xs font-bold">
          {`${currClass.course} [${currClass.code}]`}
        </CardTitle>
        <div className="text-xs">
          <div>
            {convertTime(sched.start)} - {convertTime(sched.end)}
          </div>
          {currClass.professor && (
            <div className="overflow-hidden text-ellipsis text-nowrap">
              {`${toProperCase(currClass.professor)}`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CalendarCard;

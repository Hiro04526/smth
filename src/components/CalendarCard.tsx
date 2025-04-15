"use client";

import { Card } from "@/components/ui/card";
import { Class, Schedule } from "@/lib/definitions";
import { cn, convertTime, toProperCase } from "@/lib/utils";

interface CalendarCardProps {
  currClass: Class & { color: string; shadow: string };
  height: number;
  top: number;
  hovered: number | false;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMobile?: boolean;
  sched: Schedule;
}

const CalendarCard = ({
  currClass,
  height,
  top,
  sched,
  hovered,
  onMouseEnter,
  onMouseLeave,
  isMobile = false,
}: CalendarCardProps) => {
  const room = currClass.rooms.filter((r) => r !== "");

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
        <div
          className={cn(
            "text-xs font-bold tracking-tight",
            isMobile && "text-lg -space-y-1"
          )}
        >
          {isMobile && <div>[{currClass.section}]</div>}
          <div>{`${isMobile ? "" : `[${currClass.section}]`} ${
            currClass.course
          }`}</div>
        </div>
        <div className="text-xs">
          <div className="font-medium">
            {sched.isOnline ? "Online" : !!room.length ? room : "TBA"}
          </div>
          <div className="font-medium">
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

"use client";

import { Card } from "@/components/ui/card";
import { Class, Schedule } from "@/lib/definitions";
import { cn, formatTime, inferRoom, toProperCase } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { X } from "lucide-react";

interface CalendarCardProps {
  currClass: Class & { color: string; shadow: string };
  height: number;
  top: number;
  hovered: number | false;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMobile?: boolean;
  sched: Schedule;
  isManual?: boolean;
  activeIndex?: number;
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
  isManual = false,
}: CalendarCardProps) => {
  const removeClass = useGlobalStore((state) => state.removeClass);
  const handleRemoveClass = () => {
    removeClass(currClass.code);
  };

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
            isMobile && "text-lg -space-y-1",
            isManual && "flex flex-row"
          )}
        >
          {isMobile && <div>[{currClass.section}]</div>}
          <div>{`${isMobile ? "" : `[${currClass.section}]`} ${
            currClass.course
          }`}</div>
          {isManual && (
            <X
              className="ml-auto size-4 rounded-full hover:bg-destructive/80 hover:text-destructive-foreground transition-colors text-muted-foreground duration-200 cursor-pointer"
              onClick={handleRemoveClass}
            />
          )}
        </div>
        <div className="text-xs">
          {height > 64 && (
            <div className="font-medium">{inferRoom(currClass, sched)}</div>
          )}
          <div className="font-medium">
            {formatTime(sched.start)} - {formatTime(sched.end)}
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

"use client";

import { Card } from "@/components/ui/card";
import { Class, Schedule } from "@/lib/definitions";
import {
  cn,
  formatTime,
  getCardColors,
  inferRoom,
  toProperCase,
} from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";

interface CalendarCardProps {
  currClass: Class & ReturnType<typeof getCardColors>;
  height: number;
  top: number;
  hovered: number | false;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMobile?: boolean;
  sched: Schedule;
  isManual?: boolean;
  activeIndex?: number;
  cellSizePx: number;
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
  cellSizePx,
}: CalendarCardProps) => {
  const removeClass = useGlobalStore((state) => state.removeClass);
  const removeColor = useGlobalStore(
    (state) => state.removeManualScheduleColor
  );
  const handleRemoveClass = () => {
    removeClass(currClass.code);
    removeColor(currClass.course);
  };

  const isSmall = height <= cellSizePx;

  return (
    <Card
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        hovered === currClass.code &&
          `scale-105 shadow-[0_0px_10px_3px_rgba(0,0,0,0.3)] -translate-y-2 ` +
            currClass.shadow,
        `absolute w-[95%] transition-all ${currClass.color} duration-200 ease-out`,
        "flex h-full flex-col justify-center overflow-hidden",
        currClass.border
      )}
      style={{
        height,
        top,
      }}
    >
      <div
        className={cn(
          "text-xs font-bold tracking-tight px-3 py-2",
          isMobile && "text-lg",
          isManual && "flex flex-row",
          isSmall && "py-1"
        )}
      >
        {isMobile && (
          <Badge className={currClass.secondaryColor}>
            {currClass.section}
          </Badge>
        )}
        <div>{`${isMobile ? "" : `[${currClass.section}]`} ${
          currClass.course
        }`}</div>
        {isManual && (
          <X
            className={cn(
              "ml-auto size-4 rounded-full hover:bg-black/50 hover:dark:bg-black/50 cursor-pointer opacity-50 transition-all",
              currClass.color
            )}
            onClick={handleRemoveClass}
          />
        )}
      </div>
      <div
        className={cn(
          "text-xs bg-background px-3 h-full rounded-t-md py-2 flex flex-col justify-center overflow-hidden",
          currClass.secondaryColor,
          isSmall && !isMobile && "py-0.5 text-xs"
        )}
      >
        {height > cellSizePx && (
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
    </Card>
  );
};

export default CalendarCard;

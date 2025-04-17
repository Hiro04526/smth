import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { cn } from "@/lib/utils";
import React from "react";
import OverviewCard from "./OverviewCard";
import { ScrollArea } from "./ui/scroll-area";

interface ScheduleOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  activeSchedule: Class[];
  colors: Record<string, ColorsEnum>;
  columns?: 1 | 2;
}

const ScheduleOverview = ({
  activeSchedule,
  colors,
  columns = 1,
  className,
  ...props
}: ScheduleOverviewProps) => {
  return (
    <ScrollArea
      className={cn("w-[20%] rounded-lg border bg-background", className)}
    >
      <div
        className={cn(
          "p-4 grid gap-2",
          columns === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
        {...props}
      >
        {activeSchedule &&
          activeSchedule.map((classData) => (
            <OverviewCard
              classData={classData}
              colors={colors}
              key={classData.course + classData.code}
            />
          ))}
      </div>
    </ScrollArea>
  );
};

export default ScheduleOverview;

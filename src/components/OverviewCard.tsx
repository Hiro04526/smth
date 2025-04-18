import { Class, Schedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { cn, formatTime, getCardColors, toProperCase } from "@/lib/utils";
import { CalendarClock, Clock, DoorOpen, FilePen, User } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface ScheduleWithMultipleDays extends Schedule {
  combinedDays: string;
}

interface OverviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  classData: Class;
  colors: Record<string, ColorsEnum>;
  className?: string;
}

export default function OverviewCard({
  classData,
  colors,
  className,
  ...props
}: OverviewCardProps) {
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

  const days = classData.schedules.map((sched) => {
    if (sched.day === "U") return sched.date ? sched.date : "TBA";

    return sched.day;
  });

  const rooms = [...new Set(classData.schedules.map((sched) => sched.room))];

  const { color, border } = getCardColors(colors[classData.course]);

  return (
    <Card key={classData.code} className={cn(color, className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-bold text-lg">
          {classData.course} [{classData.code}]
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="inline-flex items-center">
          <User className="gap-2 size-4 mr-2" strokeWidth={3} />{" "}
          {classData.professor !== ""
            ? toProperCase(classData.professor)
            : "TBA"}
        </div>
        <div className="inline-flex items-center">
          <CalendarClock className="gap-2 size-4 mr-2" strokeWidth={3} />
          {days.join("/")}
        </div>
        {schedules.map((sched) => (
          <div
            className="inline-flex items-center"
            key={`${sched.day}${sched.start}`}
          >
            <Clock className="gap-2 size-4 mr-2" strokeWidth={3} />

            {`${formatTime(sched.start)} - ${formatTime(sched.end)} ${`(${
              sched.combinedDays === "U" ? sched.date : sched.combinedDays
            })`}`}
          </div>
        ))}
        {rooms.map((room, index) => {
          return room !== "" ? (
            <div key={`${room}-${index}`} className="inline-flex items-center">
              <DoorOpen className="gap-2 size-4 mr-2" strokeWidth={3} />
              {room}
            </div>
          ) : (
            <React.Fragment key={index}></React.Fragment>
          );
        })}
        {classData.remarks && (
          <div className="inline-flex items-center">
            <FilePen className="gap-2 size-4 mr-2" strokeWidth={3} />
            {classData.remarks}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

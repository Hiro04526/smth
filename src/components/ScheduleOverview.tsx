import { Class, Schedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { cn, convertTime, getCardColors, toProperCase } from "@/lib/utils";
import { CalendarClock, Clock, DoorOpen, FilePen, User } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
          activeSchedule.map((courseClass) => {
            const schedules = courseClass.schedules.reduce<Schedule[]>(
              (acc, curr) => {
                if (
                  !acc.some(
                    (acc) => acc.start === curr.start && acc.end === curr.end
                  )
                )
                  acc.push(curr);
                return acc;
              },
              []
            );

            const days = courseClass.schedules.map((sched) => sched.day);

            const { color, border } = getCardColors(colors[courseClass.course]);

            return (
              <Card key={courseClass.code} className={`${color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-bold text-lg">
                    {courseClass.course} [{courseClass.code}]
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="inline-flex items-center">
                    <User className="gap-2 size-4 mr-2" strokeWidth={3} />{" "}
                    {courseClass.professor !== "" ?
                      toProperCase(courseClass.professor)
                    : "TBA"}
                  </div>
                  <div className="inline-flex items-center">
                    <CalendarClock
                      className="gap-2 size-4 mr-2"
                      strokeWidth={3}
                    />
                    {days.join("/")}
                  </div>
                  {schedules.map((sched) => (
                    <div
                      className="inline-flex items-center"
                      key={`${sched.day}${sched.start}`}
                    >
                      <Clock className="gap-2 size-4 mr-2" strokeWidth={3} />

                      {`${convertTime(sched.start)} - ${convertTime(
                        sched.end
                      )} ${schedules.length > 1 ? `(${sched.day})` : ""}`}
                    </div>
                  ))}
                  {courseClass.rooms.map((room, index) =>
                    room !== "" ?
                      <div key={room} className="inline-flex items-center">
                        <DoorOpen
                          className="gap-2 size-4 mr-2"
                          strokeWidth={3}
                        />
                        {room}
                      </div>
                    : <React.Fragment key={index}></React.Fragment>
                  )}
                  <div className="inline-flex items-center">
                    <FilePen className="gap-2 size-4 mr-2" strokeWidth={3} />
                    {courseClass.remarks}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </ScrollArea>
  );
};

export default ScheduleOverview;

import { Class, Schedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { convertTime, getCardColors, toProperCase } from "@/lib/utils";
import { CalendarClock, Clock, DoorOpen, FilePen, User } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface OverviewCardProps {
  classData: Class;
  colors: Record<string, ColorsEnum>;
}

export default function OverviewCard({ classData, colors }: OverviewCardProps) {
  const schedules = classData.schedules.reduce<Schedule[]>((acc, curr) => {
    if (!acc.some((acc) => acc.start === curr.start && acc.end === curr.end))
      acc.push(curr);
    return acc;
  }, []);

  const days = classData.schedules.map((sched) => sched.day);

  const rooms = [...new Set(classData.schedules.map((sched) => sched.room))];

  const { color, border } = getCardColors(colors[classData.course]);

  return (
    <Card key={classData.code} className={`${color}`}>
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

            {`${convertTime(sched.start)} - ${convertTime(sched.end)} ${
              schedules.length > 1 ? `(${sched.day})` : ""
            }`}
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

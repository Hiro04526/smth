"use client";

import { Class, Schedule } from "@/lib/definitions";
import { DaysEnum } from "@/lib/enums";
import {
  addDaysToDate,
  convertToIcalDay,
  formatTime,
  inferRoom,
  toProperCase,
} from "@/lib/utils";
import ical, { ICalEventData, ICalEventRepeatingFreq } from "ical-generator";
import { CalendarArrowDownIcon } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";

interface ExportButtonProps extends ButtonProps {
  classes: Class[];
}

const SEMESTER_WEEKS = 13; // Number of weeks in a semester

export default function ExportButton({ classes, ...props }: ExportButtonProps) {
  const nextSemesterRaw = process.env.NEXT_PUBLIC_NEXT_SEMESTER_DATE;
  const nextSemesterDate = nextSemesterRaw
    ? new Date(nextSemesterRaw)
    : new Date();

  const cal = ical({
    name: "Class Schedule",
    description: "Class schedule for the semester",
    timezone: "Asia/Manila",
  });

  classes.forEach((classData) => {
    const isInvalid = classData.schedules.every((schedule) => {
      const isUnknownDay = schedule.day === "U";
      const hasNoDate = !schedule.date;
      const hasValidTime = schedule.start > 0 && schedule.end > 0;
      return isUnknownDay && hasNoDate && hasValidTime;
    });

    if (isInvalid) return;

    // Group schedules with the same time on different days
    const groupedSchedules: Record<string, Schedule[]> = {};

    classData.schedules.forEach((schedule) => {
      const key = `${schedule.start}-${schedule.end}`;
      if (!groupedSchedules[key]) {
        groupedSchedules[key] = [];
      }
      groupedSchedules[key].push(schedule);
    });

    const hasDate = classData.schedules.some((schedule) => schedule.date);
    const hasUnknownDay = classData.schedules.some(
      (schedule) => schedule.day === "U"
    );

    // Early return in case there exists a schedule with no date and unknown day
    if (!hasDate && hasUnknownDay) {
      return;
    }

    // Helper function to create events with the same time
    const createSameTimeEvent = (schedules: Schedule[]) => {
      const firstSchedule = schedules[0];
      const startOffset = formatTime(firstSchedule.start);
      const endOffset = formatTime(firstSchedule.end);

      const baseStartDate = new Date(`${nextSemesterRaw} ${startOffset}`);
      const baseEndDate = new Date(`${nextSemesterRaw} ${endOffset}`);

      const startDate = addDaysToDate(
        baseStartDate,
        firstSchedule.day as DaysEnum
      );
      const endDate = addDaysToDate(baseEndDate, firstSchedule.day as DaysEnum);

      const byDays = schedules
        .map((sched) => convertToIcalDay(sched.day as DaysEnum))
        .filter(Boolean);

      const eventInfo = {
        summary: `[${classData.section}] ${classData.course}`,
        description: classData.professor
          ? `Professor: ${toProperCase(classData.professor)}`
          : "",
        location: inferRoom(classData, firstSchedule),
      };

      cal.createEvent({
        ...eventInfo,
        start: startDate,
        end: endDate,
        repeating: {
          byDay: byDays,
          freq: ICalEventRepeatingFreq.WEEKLY,
          count: SEMESTER_WEEKS * schedules.length,
        },
      });
    };

    // If it has a date, it's probably something like LASARE
    const createCalendarEvent = (sched: Schedule) => {
      const eventInfo = {
        summary: `[${classData.section}] ${classData.course}`,
        description: classData.professor
          ? `Professor: ${toProperCase(classData.professor)}`
          : "",
        location: inferRoom(classData, sched),
      };

      // Handle all-day events
      if (sched.date && sched.start === sched.end && sched.date) {
        cal.createEvent({
          start: new Date(`${sched.date}, ${nextSemesterDate.getFullYear()}`),
          allDay: true,
          ...eventInfo,
        });
        return;
      }

      // Convert time and create dates
      const startOffset = formatTime(sched.start);
      const endOffset = formatTime(sched.end);

      let startDate: Date, endDate: Date;

      // Handles one time events that have a time interval
      if (sched.date && sched.date) {
        startDate = new Date(
          `${sched.date}, ${nextSemesterDate.getFullYear()} ${startOffset}`
        );
        endDate = new Date(
          `${sched.date}, ${nextSemesterDate.getFullYear()} ${endOffset}`
        );
      } else {
        startDate = addDaysToDate(
          new Date(`${nextSemesterRaw} ${startOffset}`),
          sched.day as DaysEnum
        );
        endDate = addDaysToDate(
          new Date(`${nextSemesterRaw} ${endOffset}`),
          sched.day as DaysEnum
        );
      }

      const eventConfig: ICalEventData = {
        ...eventInfo,
        start: startDate,
        end: endDate,
      };

      // Add repeating config for non-date based events
      if (!sched.date) {
        eventConfig.repeating = {
          byDay: convertToIcalDay(sched.day as DaysEnum),
          freq: ICalEventRepeatingFreq.WEEKLY,
          count: SEMESTER_WEEKS,
        };
      }

      cal.createEvent(eventConfig);
    };

    if (hasDate) {
      classData.schedules.forEach((sched) => createCalendarEvent(sched));
    } else if (!hasUnknownDay) {
      Object.values(groupedSchedules).forEach((group) =>
        group.length > 1
          ? createSameTimeEvent(group)
          : createCalendarEvent(group[0])
      );
    }
  });

  const handleDownload = () => {
    const icsData = cal.toString();
    const blob = new Blob([icsData], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedaddle_schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleDownload} variant="secondary" {...props}>
      <CalendarArrowDownIcon className="size-4 mr-2" />
      Export
    </Button>
  );
}

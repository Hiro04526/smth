"use server";

import { format, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { calendar_v3, google } from "googleapis";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";
import { Class, classSchema, Course, Schedule } from "./definitions";
import { DaysEnum } from "./enums";
import {
  addDaysToDate,
  convertToIcalDay,
  formatTime,
  inferRoom,
  toProperCase,
} from "./utils";

const SEMESTER_WEEKS = 13;
const nextSemesterRaw =
  process.env.NEXT_PUBLIC_NEXT_SEMESTER_DATE ?? "MAY 5, 2025";
const nextSemesterDate = parse(nextSemesterRaw, "MMM d, yyyy", new Date());
const nextSemesterYear = nextSemesterDate.getFullYear();

export async function fetchCourse(courseCode: string, id: string) {
  const res = await fetch(
    `${process.env.COURSE_API}/api/courses?id=${id}&courses=${courseCode}`
  );

  if (!res.ok) {
    return { data: undefined, error: "Something went wrong while fetching." };
  }

  const isCached = res.headers.get("data-source") === "cache";
  const parsed = (await res.json())[0];
  const parsedData = classSchema.array().parse(parsed);

  const newCourse: Course = {
    courseCode: courseCode,
    classes: parsedData,
    lastFetched: new Date(),
    isCustom: false,
  };

  return { data: { newCourse, isCached }, error: undefined };
}

export async function fetchMultipleCourses(courses: Course[], id: string) {
  const courseCodes = courses.map((course) => course.courseCode);

  const res = await fetch(
    `${process.env.COURSE_API}/api/courses?id=${id}&courses=${courseCodes.join(
      "&courses="
    )}`
  );

  if (!res.ok) {
    return { error: "Something went wrong while fetching." };
  }

  const parsed = await res.json();

  const parsedData = classSchema.array().array().parse(parsed);

  const updatedCourses = parsedData.map((classes, i) => {
    return {
      ...courses[i],
      classes: classes.length ? classes : courses[i].classes,
      lastFetched: new Date(),
    };
  });

  return { data: updatedCourses };
}

export async function getCalendars(accessToken: string) {
  const calendarsRaw = await google.calendar("v3").calendarList.list({
    auth: process.env.GOOGLE_API_KEY,
    oauth_token: accessToken,
  });

  const calendars =
    calendarsRaw.data.items
      ?.filter((item) => item.accessRole === "owner" && item.id && item.summary)
      .map((item) => {
        return {
          id: item.id as string,
          summary: item.summary as string,
        };
      }) ?? [];

  return calendars;
}

function convertClassToEvent(classData: Class): calendar_v3.Schema$Event[] {
  const events: calendar_v3.Schema$Event[] = [];

  const isInvalid = classData.schedules.every((schedule) => {
    const isUnknownDay = schedule.day === "U";
    const hasNoDate = !schedule.date;
    const hasValidTime = schedule.start > 0 && schedule.end > 0;
    return isUnknownDay && hasNoDate && hasValidTime;
  });

  if (isInvalid) return events;

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
    return events;
  }

  const createSameTimeEvent = (
    schedules: Schedule[]
  ): calendar_v3.Schema$Event => {
    const firstSchedule = schedules[0];
    const startOffset = formatTime(firstSchedule.start);
    const endOffset = formatTime(firstSchedule.end);

    const baseStartDate = parse(
      `${nextSemesterRaw} ${startOffset}`,
      "MMM d, yyyy h:mm a",
      new Date()
    );
    const baseEndDate = parse(
      `${nextSemesterRaw} ${endOffset}`,
      "MMM d, yyyy h:mm a",
      new Date()
    );

    console.log(nextSemesterDate);
    console.log(startOffset, endOffset);

    // TODO: In the future, DaysEnum should contain "U" as a valid value
    // and the logic should be changed to handle it properly
    const startDate = addDaysToDate(
      baseStartDate,
      firstSchedule.day as DaysEnum
    );

    const endDate = addDaysToDate(baseEndDate, firstSchedule.day as DaysEnum);

    const byDays = schedules
      .map((sched) => convertToIcalDay(sched.day as DaysEnum))
      .filter(Boolean)
      .join(",");

    console.log(startDate, endDate);

    return {
      summary: `[${classData.section}] ${classData.course}`,
      description: classData.professor
        ? `Professor: ${toProperCase(classData.professor)}`
        : "",
      location: inferRoom(classData, firstSchedule),
      start: {
        dateTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        timeZone: "Asia/Manila",
      },
      end: {
        dateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        timeZone: "Asia/Manila",
      },
      recurrence: [
        `RRULE:FREQ=WEEKLY;COUNT=${
          SEMESTER_WEEKS * schedules.length
        };BYDAY=${byDays}`,
      ],
    };
  };

  const createCalendarEvent = (sched: Schedule): calendar_v3.Schema$Event => {
    const eventInfo = {
      summary: `[${classData.section}] ${classData.course}`,
      description: classData.professor
        ? `Professor: ${toProperCase(classData.professor)}`
        : "",
      location: inferRoom(classData, sched),
    };

    // Handle all-day events
    if (sched.date && sched.start === sched.end && sched.date) {
      const formattedDate = format(
        new Date(`${sched.date}, ${nextSemesterYear}`),
        "yyyy-MM-dd"
      );

      return {
        ...eventInfo,
        start: {
          date: formattedDate,
        },
        end: {
          date: formattedDate,
        },
      };
    }

    // Convert time and create dates
    const startOffset = formatTime(sched.start);
    const endOffset = formatTime(sched.end);

    let startDate: Date, endDate: Date;

    // Handles one time events that have a time interval
    if (sched.date) {
      startDate = new Date(`${sched.date}, ${nextSemesterYear} ${startOffset}`);
      endDate = new Date(`${sched.date}, ${nextSemesterYear} ${endOffset}`);
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

    const eventConfig: calendar_v3.Schema$Event = {
      ...eventInfo,
      start: {
        dateTime: formatInTimeZone(
          startDate,
          "Asia/Manila",
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
        timeZone: "Asia/Manila",
      },
      end: {
        dateTime: formatInTimeZone(
          endDate,
          "Asia/Manila",
          "yyyy-MM-dd'T'HH:mm:ss"
        ),
        timeZone: "Asia/Manila",
      },
    };

    // Add repeating config for non-date based events
    if (!sched.date && sched.day !== "U") {
      eventConfig.recurrence = [
        `RRULE:FREQ=WEEKLY;COUNT=${SEMESTER_WEEKS};BYDAY=${convertToIcalDay(
          sched.day
        )}`,
      ];
    }

    return eventConfig;
  };

  if (hasDate) {
    classData.schedules.forEach((sched) =>
      events.push(createCalendarEvent(sched))
    );
  } else if (!hasUnknownDay) {
    Object.values(groupedSchedules).forEach((group) =>
      events.push(
        group.length > 1
          ? createSameTimeEvent(group)
          : createCalendarEvent(group[0])
      )
    );
  }

  return events;
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: calendar_v3.Schema$Event
) {
  const calendar = google.calendar({ version: "v3", auth: accessToken });

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return res.data;
}

export async function createBatchEvents(
  accessToken: string,
  calendarId: string,
  classes: Class[]
) {
  const calendar = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
  });

  const promises: GaxiosPromise<calendar_v3.Schema$Event>[] = [];

  try {
    // Process each class and create its events
    for (const classData of classes) {
      const events = convertClassToEvent(classData);

      // Create each event for the class
      for (const event of events) {
        try {
          const res = calendar.events.insert({
            calendarId,
            requestBody: event,
            oauth_token: accessToken,
          });
          promises.push(res);
        } catch (error) {
          console.error("Error creating event:", error);
        }
      }
    }

    await Promise.all(promises);

    return { data: "Success!", error: undefined };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { data: undefined, error: error.message };
    }
    return { data: undefined, error: "An unknown error occurred." };
  }
}

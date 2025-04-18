import { type ClassValue, clsx } from "clsx";
import { ICalWeekday } from "ical-generator";
import { twMerge } from "tailwind-merge";
import { Class, Schedule } from "./definitions";
import { ColorsEnum, DaysEnum } from "./enums";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function militaryTimeToMinutes(time: number): number {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return hours * 60 + minutes;
}

/**
 * Converts a given time to a formatted string representation.
 *
 * @param time - The time to format. This can be in military format (e.g., 1300 for 1:00 PM)
 *               or in minutes (e.g., 780 for 1:00 PM).
 * @param inputFormat - The format of the input time. Defaults to "military".
 *                      - "military": Time is provided in military format (e.g., 1300).
 *                      - "minutes": Time is provided in total minutes since midnight.
 * @returns A string representation of the time in a human-readable format.
 *
 * @example
 * ```typescript
 * formatTime(1300); // "1:00 PM"
 * formatTime(780, "minutes"); // "13:00"
 * ```
 */

export function formatTime(
  time: number,
  inputFormat: "military" | "minutes" = "military"
) {
  if (inputFormat === "military") {
    const hour = Math.floor(time / 100);
    const minutes = time % 100;

    return `${hour > 12 ? hour - 12 : hour}:${
      minutes > 10 ? "" : "0"
    }${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  }

  return `${Math.floor(time / 60)}:${time % 60}${time % 60 > 10 ? "" : "0"}`;
}

export function toProperCase(val: string) {
  return val
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/((?<=( |-)|^).)/g, (s) => s.toUpperCase());
}

export function getCardColors(color: ColorsEnum) {
  const cardColors = {
    ROSE: "bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100",
    PINK: "bg-pink-200 dark:bg-pink-900 text-pink-950 dark:text-pink-100",
    FUCHSIA:
      "bg-fuchsia-200 dark:bg-fuchsia-900 text-fuchsia-950 dark:text-fuchsia-100",
    PURPLE:
      "bg-purple-200 dark:bg-purple-900 text-purple-950 dark:text-purple-100",
    VIOLET:
      "bg-violet-200 dark:bg-violet-900 text-violet-950 dark:text-violet-100",
    INDIGO:
      "bg-indigo-200 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-100",
    BLUE: "bg-blue-200 dark:bg-blue-900 text-blue-950 dark:text-blue-100",
    SKY: "bg-sky-200 dark:bg-sky-900 text-sky-950 dark:text-sky-100",
    CYAN: "bg-cyan-200 dark:bg-cyan-900 text-cyan-950 dark:text-cyan-100",
    TEAL: "bg-teal-200 dark:bg-teal-900 text-teal-950 dark:text-teal-100",
    EMERALD:
      "bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-100",
    GREEN: "bg-green-200 dark:bg-green-900 text-green-950 dark:text-green-100",
    LIME: "bg-lime-200 dark:bg-lime-900 text-lime-950 dark:text-lime-100",
    YELLOW:
      "bg-yellow-200 dark:bg-yellow-900 text-yellow-950 dark:text-yellow-100",
    AMBER: "bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100",
    ORANGE:
      "bg-orange-200 dark:bg-orange-900 text-orange-950 dark:text-orange-100",
    RED: "bg-red-200 dark:bg-red-900 text-red-950 dark:text-red-100",
  };

  const cardBorders = {
    ROSE: "border-rose-300 dark:border-rose-700",
    PINK: "border-pink-300 dark:border-pink-700",
    FUCHSIA: "border-fuchsia-300 dark:border-fuchsia-700",
    PURPLE: "border-purple-300 dark:border-purple-700",
    VIOLET: "border-violet-300 dark:border-violet-700",
    INDIGO: "border-indigo-300 dark:border-indigo-700",
    BLUE: "border-blue-300 dark:border-blue-700",
    SKY: "border-sky-300 dark:border-sky-700",
    CYAN: "border-cyan-300 dark:border-cyan-700",
    TEAL: "border-teal-300 dark:border-teal-700",
    EMERALD: "border-emerald-300 dark:border-emerald-700",
    GREEN: "border-green-300 dark:border-green-700",
    LIME: "border-lime-300 dark:border-lime-700",
    YELLOW: "border-yellow-300 dark:border-yellow-700",
    AMBER: "border-amber-300 dark:border-amber-700",
    ORANGE: "border-orange-300 dark:border-orange-700",
    RED: "border-red-300 dark:border-red-700",
  };

  const cardShadows = {
    ROSE: "bg-rose-300 shadow-rose-300/50 dark:bg-rose-800 dark:shadow-rose-700/50",
    PINK: "bg-pink-300 shadow-pink-300/50 dark:bg-pink-800 dark:shadow-pink-700/50",
    FUCHSIA:
      "bg-fuchsia-300 shadow-fuchsia-300/50 dark:bg-fuchsia-800 dark:shadow-fuchsia-700/50",
    PURPLE:
      "bg-purple-300 shadow-purple-300/50 dark:bg-purple-800 dark:shadow-purple-700/50",
    VIOLET:
      "bg-violet-300 shadow-violet-300/50 dark:bg-violet-800 dark:shadow-violet-700/50",
    INDIGO:
      "bg-indigo-300 shadow-indigo-300/50 dark:bg-indigo-800 dark:shadow-indigo-700/50",
    BLUE: "bg-blue-300 shadow-blue-300/50 dark:bg-blue-800 dark:shadow-blue-700/50",
    SKY: "bg-sky-300 shadow-sky-300/50 dark:bg-sky-800 dark:shadow-sky-700/50",
    CYAN: "bg-cyan-300 shadow-cyan-300/50 dark:bg-cyan-800 dark:shadow-cyan-700/50",
    TEAL: "bg-teal-300 shadow-teal-300/50 dark:bg-teal-800 dark:shadow-teal-700/50",
    EMERALD:
      "bg-emerald-300 shadow-emerald-300/50 dark:bg-emerald-800 dark:shadow-emerald-700/50",
    GREEN:
      "bg-green-300 shadow-green-300/50 dark:bg-green-800 dark:shadow-green-700/50",
    LIME: "bg-lime-300 shadow-lime-300/50 dark:bg-lime-800 dark:shadow-lime-700/50",
    YELLOW:
      "bg-yellow-300 shadow-yellow-300/50 dark:bg-yellow-800 dark:shadow-yellow-700/50",
    AMBER:
      "bg-amber-300 shadow-amber-300/50 dark:bg-amber-800 dark:shadow-amber-700/50",
    ORANGE:
      "bg-orange-300 shadow-orange-300/50 dark:bg-orange-800 dark:shadow-orange-700/50",
    RED: "bg-red-300 shadow-red-300/50 dark:bg-red-800 dark:shadow-red-700/50",
  };

  return {
    color: cardColors[color],
    shadow: cardShadows[color],
    border: cardBorders[color],
  };
}

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

export function inferRoom(classData: Class, sched: Schedule): string {
  if (sched.room) return sched.room;

  if (
    classData.modality === "ONLINE" ||
    classData.modality === "PREDOMINANTLY ONLINE"
  ) {
    return "Online";
  }

  return "TBA";
}

export function convertToIcalDay(day: DaysEnum): ICalWeekday {
  switch (day) {
    case "M":
      return ICalWeekday.MO;
    case "T":
      return ICalWeekday.TU;
    case "W":
      return ICalWeekday.WE;
    case "H":
      return ICalWeekday.TH;
    case "F":
      return ICalWeekday.FR;
    case "S":
      return ICalWeekday.SA;
  }
}

export function addDaysToDate(date: Date, days: number | DaysEnum) {
  if (typeof days === "string") {
    const mapping: Record<DaysEnum, number> = {
      M: 0,
      T: 1,
      W: 2,
      H: 3,
      F: 4,
      S: 5,
    };
    days = mapping[days as DaysEnum];
  }

  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

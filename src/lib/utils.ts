import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Class, Course, CourseGroup, Filter, Schedule } from "./definitions";
import { ColorsEnum, ColorsEnumSchema, DaysEnum } from "./enums";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function doClassesOverlap(sched1: Schedule[], sched2: Schedule[]) {
  const doSchedsOverlap = (sched1: Schedule, sched2: Schedule) => {
    // 915 - 1045 vs 730 - 930
    return sched1.start <= sched2.end && sched2.start <= sched1.end;
  };

  for (const currSched1 of sched1) {
    for (const currSched2 of sched2) {
      if (currSched1.day !== currSched2.day) continue;

      const overlap = doSchedsOverlap(currSched1, currSched2);
      if (overlap) return true;
    }
  }

  return false;
}

export function filterInitialData(
  courses: Class[][],
  filter: Filter
): Class[][] {
  return courses.map((course) =>
    course.filter((courseClass) => {
      const isSchedInvalid = courseClass.schedules.some((sched) => {
        // If it's an unknown day, then we just let it pass through.
        if (sched.day === "U") return false;

        // If the day is F2F and the user doesn't want F2F on that day, remove it.
        if (!sched.isOnline && !filter.general.daysInPerson.includes(sched.day))
          return true;

        const { start, end, modalities } = filter.specific[sched.day];

        return (
          sched.start < start ||
          sched.end > end ||
          !modalities.includes(courseClass.modality)
        );
      });

      // Keep the class if it passes both the schedule and modality filters
      return !isSchedInvalid;
    })
  );
}

export function militaryTimeToMinutes(time: number): number {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return hours * 60 + minutes;
}

export function filterGeneratedSchedules(schedules: Class[][], filter: Filter) {
  return schedules.filter((sched) => {
    // 1. We reduce the scheds into a per day basis to do this easier.
    const deconstructed = sched.reduce<Record<DaysEnum, Schedule[]>>(
      (acc, curr) => {
        for (const classSched of curr.schedules) {
          if (classSched.day === "U") continue;
          acc[classSched.day].push(classSched);
        }
        return acc;
      },
      { M: [], T: [], W: [], H: [], F: [], S: [] }
    );

    // 2. We check each of the days one by one to see if any of them violate the
    // given filters.
    const isInvalid = Object.entries(deconstructed).some(([day, classes]) => {
      if (classes.length === 0) return false;

      const { maxPerDay, maxConsecutive } = filter.specific[day as DaysEnum];
      if (classes.length > maxPerDay) return true;
      if (classes.length < maxConsecutive) return false;

      let consecutive = 1;
      classes.sort((a, b) => a.start - b.start);

      for (let i = 1; i < classes.length; i++) {
        const remaining = classes.length - (i + 1);

        const previousEnd = militaryTimeToMinutes(classes[i - 1].end);
        const currentStart = militaryTimeToMinutes(classes[i].start);
        const timeDifference = currentStart - previousEnd;

        // If the time difference is LTE to 15, they're consecutive.
        // But if it's not, we reset back to 1 class.
        if (timeDifference <= 15) {
          consecutive += 1;
        } else {
          consecutive = 1;
        }

        if (consecutive > maxConsecutive) {
          return true;
        }

        // Early exit when there's not enough classes left to go over the maximum
        if (remaining + consecutive < maxConsecutive) return false;
      }

      return false;
    });

    return !isInvalid;
  });
}

/**
 * Generates all possible combinations of a given number of courses from a list.
 *
 * @param courses - The list of courses to choose from.
 * @param pick - The number of courses to pick for each combination.
 * @returns An array of course combinations, where each combination is an array of courses.
 */
function generateCombinations(courses: Course[], pick: number) {
  const combinations: Course[][] = [];

  if (courses.length < pick) return [courses];

  const stack: { index: number; current: Course[] }[] = [
    { index: 0, current: [] },
  ];

  while (stack.length > 0) {
    const { index, current } = stack.pop()!;

    if (current.length === pick) {
      // We've reached the pick amount, so we add it to the combinations.
      combinations.push([...current]);
    } else if (index < courses.length) {
      // Choose to keep current course.
      stack.push({ index: index + 1, current: [...current, courses[index]] });

      // Choose to skip current course.
      stack.push({ index: index + 1, current });
    }
  }
  return combinations;
}

/**
 * Computes the Cartesian product of multiple arrays.
 *
 * @template T - The type of elements in the input arrays.
 * @param  a - The arrays for which to compute the Cartesian product.
 * @returns The Cartesian product of the input arrays.
 *
 * @example
 * ```typescript
 * const result = getCartesianProduct([1, 2], ['a', 'b']);
 * // result is [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * ```
 */
function getCartesianProduct<T extends unknown[]>(
  ...a: { [K in keyof T]: T[K][] }
) {
  return a.reduce<T[]>(
    (b, c) => b.flatMap((d) => c.map((e) => [...d, e] as T)),
    [[]] as unknown as T[]
  );
}

export function createGroupedSchedules({
  groups,
  courses,
  filter,
}: {
  groups: CourseGroup[];
  courses: Course[];
  filter?: Filter;
}): [schedules: Class[][], colors: Record<string, ColorsEnum>] {
  const ungroupedCourses = courses.filter(
    (course) => !course.group || course.group === "Ungrouped"
  );

  // Generates possible combinations per group
  // Example: [SUBJ1, SUBJ2, SUBJ3] with pick 2 and [SUBJ4, SUBJ5] with pick 1
  // will generate: [[[SUBJ1, SUBJ2], [SUBJ1, SUBJ3], [SUBJ2, SUBJ3]], [[SUBJ4], [SUBJ5]]]
  // Dimensions: Groups -> Combinations -> Courses
  const groupedCombinations = groups
    .map((group) => {
      const groupCourses = courses.filter(
        (course) => course.group === group.name
      );

      if (groupCourses.length === 0) return [];

      const combinations = generateCombinations(groupCourses, group.pick);
      return combinations;
    })
    .filter((group) => group.length > 0);

  // Gets the Cartesian product of the combinations
  // Example: [[[SUBJ1, SUBJ2]], [[SUBJ4], [SUBJ5]]]
  // will generate: [[[SUBJ1, SUBJ2], [SUBJ4]], [[SUBJ1, SUBJ2], [SUBJ5]]]
  // Dimensions: Cartesian -> Groups -> Courses
  const groupsCartesianProduct = getCartesianProduct(...groupedCombinations);

  const generatedSchedules: Class[][] = [];
  let generatedColors: Record<string, ColorsEnum> = {};

  for (const cartesian of groupsCartesianProduct) {
    const flattenedCombination = cartesian.flat();
    const combinedCourses = [...ungroupedCourses, ...flattenedCombination].map(
      (course) => course.classes
    );
    const [schedules, colors] = createSchedules(combinedCourses, filter);

    if (schedules.length && schedules[0].length > 0) {
      generatedSchedules.push(...schedules);
      generatedColors = { ...generatedColors, ...colors };
    }
  }

  return [generatedSchedules, generatedColors];
}

export function createSchedules(
  courses: Class[][],
  filter?: Filter
): [schedules: Class[][], colors: Record<string, ColorsEnum>] {
  // This will store all currently made schedules.
  let createdScheds: Class[][] = [[]];

  if (filter) {
    courses = filterInitialData(courses, filter);
  }

  // First, iterate throughout all of the courses
  for (const course of courses) {
    // This will store the current combinations given the course and
    // currently created schedules.
    const newCombinations: Class[][] = [];

    // Iterate throughout all the created scheds so far.
    for (let i = createdScheds.length - 1; i >= 0; i--) {
      const currentSched = createdScheds[i];
      // This flag is to indicate that at least 1 combination exists.
      let schedExists = false;

      // Check if overlap between any of the classes inside the
      // combinations and the current course class.
      for (const courseClass of course) {
        const overlap = currentSched.some((schedClass) =>
          doClassesOverlap(courseClass.schedules, schedClass.schedules)
        );

        // If there's an overlap, we can't add it to the schedule.
        if (overlap) continue;

        // If there's no overlap, this schedule can continue as is.
        schedExists = true;
        newCombinations.push([...currentSched, courseClass]);
      }

      if (!schedExists) {
        createdScheds.splice(i, 1);
      }
    }

    createdScheds = newCombinations;
  }

  if (filter) createdScheds = filterGeneratedSchedules(createdScheds, filter);
  if (createdScheds.length === 0) return [[], {}];

  const courseNames = createdScheds[0].map((courseClass) => courseClass.course);
  const colors = getRandomColors(courseNames);

  return [createdScheds, colors];
}

export function convertTime(time: number) {
  const hour = Math.floor(time / 100);
  const minutes = time % 100;

  return `${hour > 12 ? hour - 12 : hour}:${
    minutes > 10 ? "" : "0"
  }${minutes} ${hour >= 12 ? "PM" : "AM"}`;
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

export function getRandomColors(courses: string[]): Record<string, ColorsEnum> {
  const availableColors = [...ColorsEnumSchema.options];
  const courseColors: Record<string, ColorsEnum> = {};

  courses.forEach((course) => {
    if (availableColors.length === 0) {
      throw new Error("Not enough unique colors to assign to all courses.");
    }

    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const color = availableColors.splice(randomIndex, 1)[0];
    courseColors[course] = color;
  });

  return courseColors;
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

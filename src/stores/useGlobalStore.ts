import { Class, Course, SavedSchedule, Schedule } from "@/lib/definitions";
import { hasOwnProperty } from "@/lib/utils";
import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { CourseStates, createCourseSlice } from "./courseSlice";
import { createIdSlice, IdStates } from "./idSlice";
import { createMiscSlice, MiscStates } from "./miscSlice";
import { createScheduleSlice, ScheduleStates } from "./scheduleSlice";
import { createTableSlice, TableStates } from "./tableSlice";

// Custom Storage to interface with IndexedDB
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

// Collection of all the states stored in the store
interface GlobalStates
  extends CourseStates,
    IdStates,
    TableStates,
    ScheduleStates,
    MiscStates {}

// Abstracted type for creating slices
export type Slice<T> = StateCreator<
  GlobalStates,
  [["zustand/persist", unknown]],
  [],
  T
>;

// Combine all slices into one global store
// This pattern is based on this link:
// https://zustand.docs.pmnd.rs/guides/slices-pattern#usage-with-typescript
export const useGlobalStore = create<GlobalStates>()(
  persist(
    (...a) => ({
      ...createCourseSlice(...a),
      ...createIdSlice(...a),
      ...createTableSlice(...a),
      ...createScheduleSlice(...a),
      ...createMiscSlice(...a),
    }),
    {
      name: "global-state",
      skipHydration: true,
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: (state) => {
        return () => {
          state.setHasHydrated(true);
        };
      },
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;

        if (
          version === 0 &&
          hasOwnProperty(persistedState, "courseGroups") &&
          !Array.isArray(persistedState["courseGroups"])
        ) {
          persistedState["courseGroups"] = Object.entries(
            persistedState["courseGroups"] as Record<string, number>
          ).map(([key, value]) => ({
            name: key,
            pick: value,
          }));
        }

        if (
          version < 2 &&
          hasOwnProperty(persistedState, "courses") &&
          hasOwnProperty(persistedState, "schedules") &&
          hasOwnProperty(persistedState, "savedSchedules")
        ) {
          const courses = persistedState["courses"] as Course[];

          const schedules = persistedState["schedules"] as Class[][];
          const savedSchedules = persistedState[
            "savedSchedules"
          ] as SavedSchedule[];

          const newCourses = courses.map((course) => ({
            ...course,
            classes: course.classes.map((classData) => {
              const schedules: Schedule[] = classData.schedules.map(
                (schedule, i) => ({
                  ...schedule,
                  room: classData?.rooms?.[i] ?? "",
                })
              );

              return {
                ...classData,
                schedules,
              };
            }),
          }));

          const newSchedules: Class[][] = schedules.map((classes) =>
            classes.map((classData) => ({
              ...classData,
              schedules: classData.schedules.map((schedule, i) => ({
                ...schedule,
                room: classData?.rooms?.[i] ?? "",
              })),
            }))
          );

          const newSavedSchedules: SavedSchedule[] = savedSchedules.map(
            ({ classes, ...prev }) => ({
              ...prev,
              classes: classes.map((classData) => ({
                ...classData,
                schedules: classData.schedules.map((schedule, i) => ({
                  ...schedule,
                  room: classData?.rooms?.[i] ?? "",
                })),
              })),
            })
          );

          persistedState["schedules"] = newSchedules;
          persistedState["savedSchedules"] = newSavedSchedules;
          persistedState["courses"] = newCourses;
        }

        return persistedState;
      },
    }
  )
);

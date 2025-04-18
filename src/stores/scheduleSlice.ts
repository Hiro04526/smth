import {
  defaultGeneralFilters,
  defaultSpecificFilters,
} from "@/components/FilterForm";
import { Class, Filter, UserSchedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { Slice } from "./useGlobalStore";

export interface ScheduleStates {
  courseColors: Record<string, ColorsEnum>;
  setCourseColors: (courseColors: Record<string, ColorsEnum>) => void;
  schedules: Class[][];
  setSchedules: (schedules: Class[][]) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  savedSchedules: UserSchedule[];
  addSavedSchedule: (schedule: UserSchedule) => void;
  deleteSavedSchedule: (name: string) => void;
  changeSavedColors: (name: string, colors: Record<string, ColorsEnum>) => void;
  setSavedSchedules: (schedules: UserSchedule[]) => void;
  randomizeColors: boolean;
  setRandomizeColors: (randomizeColors: boolean) => void;
}

export const createScheduleSlice: Slice<ScheduleStates> = (set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  courseColors: {},
  setCourseColors: (courseColors) => set({ courseColors }),
  filter: { general: defaultGeneralFilters, specific: defaultSpecificFilters },
  setFilter: (filter) => set({ filter }),
  savedSchedules: [],
  addSavedSchedule: (schedule) =>
    set((state) => ({ savedSchedules: [...state.savedSchedules, schedule] })),
  deleteSavedSchedule: (name) =>
    set((state) => ({
      savedSchedules: state.savedSchedules.filter((s) => s.name !== name),
    })),
  changeSavedColors: (name, colors) => {
    set((state) => {
      const savedSchedules = state.savedSchedules.map((s) => {
        if (s.name === name) {
          return { ...s, colors };
        }
        return s;
      });

      return { savedSchedules };
    });
  },
  setSavedSchedules: (schedules) => set({ savedSchedules: schedules }),
  randomizeColors: true,
  setRandomizeColors: (randomizeColors) => set({ randomizeColors }),
});

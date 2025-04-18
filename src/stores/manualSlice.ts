import { Class, UserSchedule } from "@/lib/definitions";
import { toast } from "sonner";
import { Slice } from "./useGlobalStore";

export interface ManualStates {
  manualSchedules: UserSchedule[];
}

export interface ManualActions {
  setManualSchedules: (classes: UserSchedule[]) => void;
  setManualSchedule: (index: number, schedule: UserSchedule) => void;
  addClassToManualSchedule: (newClass: Class, index: number) => void;
  removeClass: (code: number, index: number) => void;
}

export type ManualSlice = ManualStates & ManualActions;

export const createManualSlice: Slice<ManualSlice> = (set) => ({
  manualSchedules: [],
  setManualSchedule: (index, schedule) =>
    set((state) => {
      const updatedSchedules = [...state.manualSchedules];
      if (index >= updatedSchedules.length) {
        toast.error(
          "Invalid index for setting manual schedule. Please contact the developer."
        );
        return { manualSchedules: updatedSchedules };
      }
      updatedSchedules[index] = schedule;
      return { manualSchedules: updatedSchedules };
    }),

  setManualSchedules: (schedules) => set({ manualSchedules: schedules }),
  addClassToManualSchedule: (newClass, index) =>
    set((state) => {
      const updatedSchedule = [...state.manualSchedules];
      if (index >= updatedSchedule.length) {
        toast.error(
          "Invalid index for adding class to manual schedule. Please contact the developer."
        );
        return { manualSchedules: updatedSchedule };
      }

      updatedSchedule[index] = {
        ...updatedSchedule[index],
        classes: [...updatedSchedule[index].classes, newClass],
      };
      return { manualSchedules: updatedSchedule };
    }),
  removeClass: (code, index) =>
    set((state) => {
      const updatedSchedule = [...state.manualSchedules];
      if (index < updatedSchedule.length) {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          classes: updatedSchedule[index].classes.filter(
            (cls) => cls.code !== code
          ),
        };
      }
      return { manualSchedules: updatedSchedule };
    }),
});

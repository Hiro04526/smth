import { SavedSchedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { Slice } from "./useGlobalStore";

export interface ManualStates {
  manualSchedules: SavedSchedule[];
  addManualSchedule: (schedule: SavedSchedule) => void;
  deleteManualSchedule: (name: string) => void;
  setManualSchedules: (schedules: SavedSchedule[]) => void;
  setScheduleColors: (name: string, colors: Record<string, ColorsEnum>) => void;
}

export const createManualSlice: Slice<ManualStates> = (set) => ({
  manualSchedules: [],
  addManualSchedule: (schedule) =>
    set((state) => ({ savedSchedules: [...state.savedSchedules, schedule] })),
  deleteManualSchedule: (name) =>
    set((state) => ({
      savedSchedules: state.savedSchedules.filter((s) => s.name !== name),
    })),
  setScheduleColors: (name, colors) => {
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
  setManualSchedules: (schedules) => set({ savedSchedules: schedules }),
});

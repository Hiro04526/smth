import { Class } from "@/lib/definitions";
import { Slice } from "./useGlobalStore";

export interface ManualStates {
  manualSchedule: Class[];
  setManualSchedule: (classes: Class[]) => void;
  addClass: (newClass: Class) => void;
  removeClass: (code: number) => void;
}

export const createManualSlice: Slice<ManualStates> = (set) => ({
  manualSchedule: [],
  setManualSchedule: (classes) => set({ manualSchedule: classes }),
  addClass: (newClass) =>
    set((state) => ({ manualSchedule: [...state.manualSchedule, newClass] })),
  removeClass: (code) =>
    set((state) => ({
      manualSchedule: state.manualSchedule.filter((c) => c.code !== code),
    })),
});

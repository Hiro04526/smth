import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { CourseStates, createCourseSlice } from "./courseSlice";
import { createIdSlice, IdStates } from "./idSlice";
import { createMiscSlice, MiscStates } from "./miscSlice";
import { createScheduleSlice, ScheduleStates } from "./scheduleSlice";
import { createTableSlice, TableStates } from "./tableStates";

// Custom Storage to interface with IndexedDB
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, "has been deleted");
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
    }
  )
);

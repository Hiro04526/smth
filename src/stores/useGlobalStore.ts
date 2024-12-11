import { Course } from "@/lib/definitions";
import { RowSelectionState } from "@tanstack/react-table";
import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

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

interface CourseStates {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
}

interface IdStates {
  id: string;
  setId: (id: string) => void;
}

interface TableStates {
  selectedRows: Record<string, RowSelectionState>;
  setSelectedRows: (
    courseCode: string,
    rowSelection: RowSelectionState
  ) => void;
}

// Collection of all the states stored in the store
interface GlobalStates extends CourseStates, IdStates, TableStates {}

// Abstracted type for creating slices
type Slice<T> = StateCreator<
  GlobalStates,
  [["zustand/persist", unknown]],
  [],
  T
>;

const createCourseSlice: Slice<CourseStates> = (set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  removeCourse: (courseCode) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.courseCode !== courseCode),
    })),
});

const createIdSlice: Slice<IdStates> = (set) => ({
  id: "",
  setId: (id) => set({ id }),
});

const createTableSlice: Slice<TableStates> = (set) => ({
  selectedRows: {},
  setSelectedRows: (courseCode, rowSelection) =>
    set((state) => ({
      selectedRows: { ...state.selectedRows, [courseCode]: rowSelection },
    })),
});

// Combine all slices into one global store
// This pattern is based on this link:
// https://zustand.docs.pmnd.rs/guides/slices-pattern#usage-with-typescript
export const useGlobalStore = create<GlobalStates>()(
  persist(
    (...a) => ({
      ...createCourseSlice(...a),
      ...createIdSlice(...a),
      ...createTableSlice(...a),
    }),
    {
      name: "global-state",
      skipHydration: true,
      storage: createJSONStorage(() => storage),
    }
  )
);

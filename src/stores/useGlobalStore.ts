import {
  defaultGeneralFilters,
  defaultSpecificFilters,
} from "@/components/FilterForm";
import { Class, Course, Filter, SavedSchedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import {
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
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
  getSelectedData: () => Class[][];
  removeAllSelectedRows: () => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (columnVisibility: VisibilityState) => void;
  columnFilters: Record<string, ColumnFiltersState>;
  setColumnFilters: (
    courseCode: string,
    columnFilters: ColumnFiltersState
  ) => void;
}

interface ScheduleStates {
  courseColors: Record<string, ColorsEnum>;
  setCourseColors: (courseColors: Record<string, ColorsEnum>) => void;
  schedules: Class[][];
  setSchedules: (schedules: Class[][]) => void;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  savedSchedules: SavedSchedule[];
  addSavedSchedule: (schedule: SavedSchedule) => void;
  deleteSavedSchedule: (name: string) => void;
  setSavedSchedules: (schedules: SavedSchedule[]) => void;
}

// Collection of all the states stored in the store
interface GlobalStates
  extends CourseStates,
    IdStates,
    TableStates,
    ScheduleStates {}

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
    set((state) => {
      const { [courseCode]: _, ...remainingRows } = state.selectedRows;
      const { [courseCode]: __, ...remainingColors } = state.courseColors;
      return {
        courses: state.courses.filter((c) => c.courseCode !== courseCode),
        selectedRows: remainingRows,
        courseColors: remainingColors,
      };
    }),
});

const createIdSlice: Slice<IdStates> = (set) => ({
  id: "",
  setId: (id) => set({ id }),
});

const createTableSlice: Slice<TableStates> = (set, get) => ({
  selectedRows: {},
  setSelectedRows: (courseCode, rowSelection) =>
    set((state) => {
      const newSelectedRows = { ...state.selectedRows };

      Object.entries(newSelectedRows).forEach(([key, value]) => {
        // Removes any remaining empty objects in the selectedRows.
        // This is removable in the future, just here to clean up
        // any existing bugs.
        if (Object.entries(value).length === 0) {
          delete newSelectedRows[key];
        }
      });

      // Remove the object if it's empty
      if (Object.keys(rowSelection).length === 0) {
        delete newSelectedRows[courseCode];
      } else {
        newSelectedRows[courseCode] = rowSelection;
      }

      return { selectedRows: newSelectedRows };
    }),
  getSelectedData: () => {
    const selectedRows = get().selectedRows;
    const courses = get().courses;

    return Object.entries(selectedRows).map(([courseCode, selected]) => {
      const course = courses.find((course) => course.courseCode === courseCode);

      // If course is not found, return an empty array. Note that this will only
      // happen when there's a desync between the selectedRows and courses.
      if (!course) {
        return [];
      }

      return Object.keys(selected).map(
        (key) => course.classes[Number.parseInt(key)]
      );
    });
  },
  removeAllSelectedRows: () => set({ selectedRows: {} }),
  columnVisibility: {
    courseCode: false,
    modality: false,
    restriction: false,
    status: false,
  },
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  columnFilters: {},
  setColumnFilters: (courseCode, columnFilters) =>
    set((state) => {
      const newColumnFilters = { ...state.columnFilters };

      if (Object.keys(columnFilters).length === 0) {
        delete newColumnFilters[courseCode];
      } else {
        newColumnFilters[courseCode] = columnFilters;
      }

      return { columnFilters: newColumnFilters };
    }),
});

const createScheduleSlice: Slice<ScheduleStates> = (set) => ({
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
  setSavedSchedules: (schedules) => set({ savedSchedules: schedules }),
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
      ...createScheduleSlice(...a),
    }),
    {
      name: "global-state",
      skipHydration: true,
      storage: createJSONStorage(() => storage),
    }
  )
);

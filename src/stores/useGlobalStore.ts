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
  courseGroups: Record<string, number>;
  addCourseGroup: (groupName: string) => void;
  removeCourseGroup: (groupName: string) => void;
  setGroupPick: (groupName: string, pick: number) => void;
  moveCourseToGroup: (groupName: string, courseCode: string) => void;
  renameCourseGroup: (oldName: string, newName: string) => void;
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
  getColumnFilters: (courseCode: string) => ColumnFiltersState;
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
  changeSavedColors: (name: string, colors: Record<string, ColorsEnum>) => void;
  setSavedSchedules: (schedules: SavedSchedule[]) => void;
  randomizeColors: boolean;
  setRandomizeColors: (randomizeColors: boolean) => void;
}

interface MiscStates {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  hasSeenAnnouncement: string | null;
  setHasSeenAnnouncement: (hasSeenAnnouncement: string) => void;
}

// Collection of all the states stored in the store
interface GlobalStates
  extends CourseStates,
    IdStates,
    TableStates,
    ScheduleStates,
    MiscStates {}

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
    set((state) => ({
      courses: [...state.courses, course],
    })),
  removeCourse: (courseCode) =>
    set((state) => {
      const { [courseCode]: _, ...remainingRows } = state.selectedRows;
      const { [courseCode]: ___, ...remainingFilters } = state.columnFilters;
      return {
        courses: state.courses.filter((c) => c.courseCode !== courseCode),
        selectedRows: remainingRows,
        columnFilters: remainingFilters,
      };
    }),
  courseGroups: {},
  addCourseGroup: (groupName) =>
    set((state) => ({
      courseGroups: { ...state.courseGroups, [groupName]: 1 },
    })),
  moveCourseToGroup: (groupName, courseCode) => {
    set((state) => {
      const courses = state.courses.map((course) => {
        if (course.courseCode === courseCode) {
          return { ...course, group: groupName };
        }
        return course;
      });

      return { courses };
    });
  },
  removeCourseGroup: (groupName) =>
    set((state) => {
      const courses = state.courses.map((course) => {
        if (course.group === groupName) {
          return { ...course, group: undefined };
        }
        return course;
      });

      const { [groupName]: _, ...courseGroups } = state.courseGroups;

      return { courses, courseGroups };
    }),
  setGroupPick: (groupName, pick) => {
    set((state) => {
      const courseGroups = { ...state.courseGroups, [groupName]: pick };
      return { courseGroups };
    });
  },
  renameCourseGroup: (oldName, newName) => {
    set((state) => {
      const courses = state.courses.map((course) => {
        if (course.group === oldName) {
          return { ...course, group: newName };
        }
        return course;
      });

      const courseGroups = { ...state.courseGroups };
      courseGroups[newName] = courseGroups[oldName];
      delete courseGroups[oldName];

      return { courses, courseGroups };
    });
  },
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
  columnVisibility: {},
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  columnFilters: {},
  setColumnFilters: (courseCode, columnFilters) =>
    set((state) => ({
      columnFilters: { ...state.columnFilters, [courseCode]: columnFilters },
    })),
  getColumnFilters: (courseCode) => get().columnFilters[courseCode] ?? [],
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

const createMiscSlice: Slice<MiscStates> = (set) => ({
  _hasHydrated: false,
  setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  hasSeenAnnouncement: null,
  setHasSeenAnnouncement: (hasSeenAnnouncement) => set({ hasSeenAnnouncement }),
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
      ...createMiscSlice(...a),
    }),
    {
      name: "global-state",
      skipHydration: true,
      storage: createJSONStorage(() => storage),
    }
  )
);

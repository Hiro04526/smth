import { Course } from "@/lib/definitions";
import {
  ColumnFiltersState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
import { Slice } from "./useGlobalStore";

export interface TableStates {
  selectedRows: Record<string, RowSelectionState>;
  setSelectedRows: (
    courseCode: string,
    rowSelection: RowSelectionState
  ) => void;
  getSelectedData: () => Course[];
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

export const createTableSlice: Slice<TableStates> = (set, get) => ({
  selectedRows: {},
  setSelectedRows: (courseCode, rowSelection) =>
    set((state) => {
      const newSelectedRows = { ...state.selectedRows };

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
        return { classes: [], courseCode: "UNKNOWN", lastFetched: new Date() };
      }

      const courseData = Object.keys(selected).map(
        (key) => course.classes[Number.parseInt(key)]
      );

      return { ...course, classes: courseData };
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

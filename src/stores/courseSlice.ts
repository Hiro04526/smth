import { Course } from "@/lib/definitions";
import { Slice } from "./useGlobalStore";

export interface CourseStates {
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

export const createCourseSlice: Slice<CourseStates> = (set) => ({
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

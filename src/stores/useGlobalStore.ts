import { Course } from "@/lib/definitions";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CoursesState {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  id: string;
  setId: (id: string) => void;
}

export const useGlobalStore = create<CoursesState>()(
  persist(
    (set) => ({
      courses: [],
      setCourses: (courses) => set({ courses }),
      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),
      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
        })),
      id: "",
      setId: (id) => set({ id }),
    }),
    { name: "fetched-courses", skipHydration: true }
  )
);

import { Course } from "@/lib/definitions";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CoursesState {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set) => ({
      courses: [],
      setCourses: (courses) => set({ courses }),
    }),
    { name: "fetched-courses", skipHydration: true }
  )
);

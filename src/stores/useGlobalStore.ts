import { Course } from "@/lib/definitions";
import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create } from "zustand";
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

interface GlobalStates {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  id: string;
  setId: (id: string) => void;
}

export const useGlobalStore = create<GlobalStates>()(
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
    {
      name: "fetched-courses",
      skipHydration: true,
      storage: createJSONStorage(() => storage),
    }
  )
);

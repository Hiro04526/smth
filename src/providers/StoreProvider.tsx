"use client";

import { useCoursesStore } from "@/stores/coursesStore";
import { ReactNode, useEffect } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    useCoursesStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}

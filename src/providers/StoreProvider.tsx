"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import { ReactNode, useEffect } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    useGlobalStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}

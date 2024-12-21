import { Slice } from "./useGlobalStore";

export interface MiscStates {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  hasSeenAnnouncement: string | null;
  setHasSeenAnnouncement: (hasSeenAnnouncement: string) => void;
}

export const createMiscSlice: Slice<MiscStates> = (set) => ({
  _hasHydrated: false,
  setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  hasSeenAnnouncement: null,
  setHasSeenAnnouncement: (hasSeenAnnouncement) => set({ hasSeenAnnouncement }),
});

import { Slice } from "./useGlobalStore";

export interface IdStates {
  id: string;
  setId: (id: string) => void;
}

export const createIdSlice: Slice<IdStates> = (set) => ({
  id: "",
  setId: (id) => set({ id }),
});

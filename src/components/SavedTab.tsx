"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import { HeartCrack } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Calendar from "./Calendar";
import ScheduleBar from "./ScheduleBar";
import ScheduleOverview from "./ScheduleOverview";
import SavedTabSkeleton from "./skeletons/SavedTabSkeleton";
import { Card } from "./ui/card";

const SavedTab = () => {
  const { schedules, hasHydrated } = useGlobalStore(
    useShallow((state) => ({
      schedules: state.savedSchedules,
      hasHydrated: state._hasHydrated,
    }))
  );
  const [active, setActive] = useState<number>(0);

  if (!hasHydrated) {
    return <SavedTabSkeleton />;
  }

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <div className="flex flex-col gap-4 grow">
        <ScheduleBar
          active={active}
          setActive={setActive}
          type="saved"
          schedules={schedules}
          colors={schedules[active].colors}
        />
        {schedules[active] ? (
          <Calendar
            classes={schedules[active].classes}
            colors={schedules[active].colors}
          />
        ) : (
          <Card className="p-6 w-full grow items-center flex flex-col justify-center text-muted-foreground gap-2">
            <HeartCrack size={100} />
            No schedules saved yet.
          </Card>
        )}
      </div>
      {schedules[active] ? (
        <ScheduleOverview
          activeSchedule={schedules[active].classes}
          colors={schedules[active].colors}
        />
      ) : (
        <Card className="w-[20%] p-6"></Card>
      )}
    </div>
  );
};

export default SavedTab;

"use client";

import Calendar from "@/components/Calendar";
import ScheduleBar from "@/components/ScheduleBar";
import ScheduleOverview from "@/components/ScheduleOverview";
import useManualSchedule from "@/hooks/useManualSchedule";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useState } from "react";

interface Props {}
export default function ManualPage({}: Props) {
  const [active, setActive] = useState<number>(0);

  const schedules = useGlobalStore((state) => state.manualSchedules);
  const setSchedules = useGlobalStore((state) => state.setManualSchedules);
  const activeSched = schedules[active];
  const manualProps = useManualSchedule(active);

  if (!activeSched) {
    setSchedules([{ name: "New Schedule ", classes: [], colors: {} }]);
    return null;
  }

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <ScheduleBar
        active={active}
        setActive={setActive}
        colors={activeSched.colors}
        schedules={schedules}
        type="saved"
      />
      <Calendar
        classes={activeSched.classes}
        colors={activeSched.colors}
        manualProps={manualProps}
        activeIndex={active}
      />
      <ScheduleOverview
        activeSchedule={activeSched.classes}
        colors={activeSched.colors}
      />
    </div>
  );
}

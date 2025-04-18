"use client";

import Calendar from "@/components/Calendar";
import ScheduleOverview from "@/components/ScheduleOverview";
import useManualSchedule from "@/hooks/useManualSchedule";
import { ColorsEnum } from "@/lib/enums";
import { useGlobalStore } from "@/stores/useGlobalStore";

interface Props {}
export default function ManualPage({}: Props) {
  const classes = useGlobalStore((state) => state.manualSchedule);
  const colors = classes.reduce<Record<string, ColorsEnum>>((acc, course) => {
    acc[course.course] = "EMERALD";

    return acc;
  }, {});

  const manualProps = useManualSchedule();

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <Calendar classes={classes} colors={colors} manualProps={manualProps} />
      <ScheduleOverview activeSchedule={classes} colors={colors} />
    </div>
  );
}

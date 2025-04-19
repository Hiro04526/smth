"use client";

import { createGroupedSchedules } from "@/lib/schedules";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { CalendarPlus2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import Calendar from "./Calendar";
import FilterSettings from "./FilterSettings";
import ScheduleBar from "./ScheduleBar";
import ScheduleOverview from "./ScheduleOverview";
import ScheduleTabSkeleton from "./skeletons/ScheduleTabSkeleton";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const ScheduleTab = () => {
  const {
    schedules,
    setSchedules,
    colors,
    setColors,
    getSelectedData,
    filter,
    randomizeColors,
    groups,
    hasHydrated,
  } = useGlobalStore(
    useShallow((state) => ({
      schedules: state.schedules,
      setSchedules: state.setSchedules,
      colors: state.courseColors,
      setColors: state.setCourseColors,
      getSelectedData: state.getSelectedData,
      filter: state.filter,
      randomizeColors: state.randomizeColors,
      groups: state.courseGroups,
      hasHydrated: state._hasHydrated,
    }))
  );
  const [active, setActive] = useState<number>(0);
  const activeSchedule = schedules[active];
  const activeScheduleClasses = activeSchedule?.classes ?? [];

  if (!hasHydrated) {
    return <ScheduleTabSkeleton />;
  }

  const handleGenerate = () => {
    const selectedData = getSelectedData();

    if (!selectedData.length) {
      toast.error("No rows selected...", {
        description:
          "No schedule can be made because you haven't selected any classes yet.",
      });
      return;
    }

    const {
      schedules: newSchedules,
      colors: newColors,
      error,
    } = createGroupedSchedules({
      groups,
      courses: selectedData,
      filter,
    });

    if (error === "overflow") {
      toast.error("Uh oh! You hit the max schedules limit.", {
        description:
          "Try selecting fewer classes, making more groups, or adjusting the filters.",
      });
      return;
    } else if (error) {
      toast.error("Uh oh! No schedules could be generated.", {
        description: (
          <div>
            <div className="mb-1">
              The most likely culprits are the following:
            </div>
            <div className="flex flex-col gap-1 p-2 bg-red-200 text-red-900 rounded-lg dark:bg-red-950 dark:text-red-100">
              {error.map((err, index) => (
                <p key={index}>
                  {index + 1}. {err}
                </p>
              ))}
            </div>
          </div>
        ),
      });
      return;
    }

    // If no error occurs, just set schedules as normal.
    setSchedules(newSchedules);

    // Check if colors should be randomized
    if (randomizeColors) {
      setColors(newColors);
    } else {
      // Remove any colors that are not in the new colors and keep the old ones
      const refinedColors = Object.keys(newColors).reduce((acc, course) => {
        acc[course] = colors[course] ?? newColors[course];
        return acc;
      }, {} as typeof colors);

      setColors(refinedColors);
    }

    setActive(0);
    toast.success("Sucessfully generated schedules!", {
      description: `A total of ${newSchedules.length} were successfully generated.`,
    });
  };

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <div className="flex flex-col gap-4 grow">
        <ScheduleBar
          active={active}
          setActive={setActive}
          schedules={schedules}
          colors={colors}
          isGenerated
        >
          <Button onClick={handleGenerate}>Generate Schedules</Button>
          <FilterSettings />
        </ScheduleBar>
        {schedules[active] ? (
          <Calendar classes={activeScheduleClasses} colors={colors} />
        ) : (
          <Card className="p-6 w-full grow items-center flex flex-row justify-center text-muted-foreground gap-2">
            <CalendarPlus2 size={100} strokeWidth={1.25} />
            <span className="flex flex-col gap-2">
              <span className="font-bold text-xl">
                No schedules generated yet
              </span>
              <span>Try clicking the Generate Schedules Button!</span>
            </span>
          </Card>
        )}
      </div>
      <ScheduleOverview
        activeSchedule={activeScheduleClasses}
        colors={colors}
      />
    </div>
  );
};

export default ScheduleTab;

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSchedules } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { CalendarPlus2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FixedSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";
import Calendar from "./Calendar";
import DownloadScheduleButton from "./DownloadScheduleButton";
import FilterSettings from "./FilterSettings";
import SaveButton from "./SaveButton";
import ScheduleOverview from "./ScheduleOverview";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "./ui/use-toast";

const ScheduleTab = () => {
  const {
    schedules,
    setSchedules,
    colors,
    setColors,
    getSelectedData,
    filter,
  } = useGlobalStore(
    useShallow((state) => ({
      schedules: state.schedules,
      setSchedules: state.setSchedules,
      colors: state.courseColors,
      setColors: state.setCourseColors,
      getSelectedData: state.getSelectedData,
      filter: state.filter,
    }))
  );
  const [active, setActive] = useState<number>(0);

  const handleGenerate = () => {
    const selectedData = getSelectedData();
    console.log(selectedData);

    if (!selectedData.length) {
      toast({
        title: "No rows selected...",
        description:
          "No schedule can be made because you haven't selected any classes yet.",
        variant: "destructive",
      });
      return;
    }

    const [newSchedules, newColors] = createSchedules(selectedData, filter);

    if (newSchedules.length === 0) {
      toast({
        title: "Uh oh! No schedules could be generated.",
        description:
          "Try selecting more classes that don't conflict with each other.",
        variant: "destructive",
      });
      return;
    } else if (newSchedules.length >= 2048) {
      toast({
        title: "Uh oh! Too many classes will be generated.",
        description:
          "Narrow down your options and select less classes, then generate again.",
        variant: "destructive",
      });
      return;
    }

    // If no error occurs, just set schedules as normal.
    setSchedules(newSchedules);
    setColors(newColors);
    setActive(0);
    toast({
      title: "Sucessfully generated schedules!",
      description: `A total of ${newSchedules.length} were successfully generated.`,
    });
  };

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <div className="flex flex-col gap-4 grow">
        <Card className="flex flex-row gap-4 p-4">
          <div className="flex flex-row gap-2">
            <Button
              onClick={() => setActive(active - 1)}
              disabled={active <= 0}
              variant="outline"
              size="icon"
            >
              <ChevronLeft />
            </Button>
            <Select
              value={`${active}`}
              onValueChange={(val) => setActive(Number(val))}
              disabled={schedules.length === 0}
            >
              <SelectTrigger className="w-64">
                <SelectValue
                  placeholder={`${
                    schedules.length !== 0 ? `Schedule ${active + 1}` : "-"
                  }`}
                >
                  Schedule {active + 1}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <FixedSizeList
                  width={`100%`}
                  height={Math.min(350, 35 * schedules.length)}
                  itemCount={schedules.length}
                  itemSize={35}
                >
                  {({ index, style }) => (
                    <SelectItem
                      key={index}
                      value={`${index}`}
                      style={{ ...style }}
                    >
                      Schedule {index + 1}
                    </SelectItem>
                  )}
                </FixedSizeList>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setActive(active + 1)}
              disabled={active >= schedules.length - 1}
              variant="outline"
              size="icon"
            >
              <ChevronRight />
            </Button>
          </div>
          <Button onClick={() => handleGenerate()}>Generate Schedules</Button>
          <FilterSettings />
          {schedules[active] && (
            <SaveButton activeSched={schedules[active]} colors={colors} />
          )}
          {schedules[active] && (
            <DownloadScheduleButton
              classes={schedules[active]}
              colors={colors}
            />
          )}
        </Card>
        {schedules[active] ? (
          <Calendar courses={schedules[active]} colors={colors} />
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
      <ScheduleOverview activeSchedule={schedules[active]} colors={colors} />
    </div>
  );
};

export default ScheduleTab;

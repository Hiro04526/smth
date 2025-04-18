"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { ChevronLeft, ChevronRight, HeartCrack } from "lucide-react";
import { useState } from "react";
import { FixedSizeList } from "react-window";
import { useShallow } from "zustand/react/shallow";
import Calendar from "./Calendar";
import CourseColorsDialog from "./CourseColorsDialog";
import DownloadScheduleButton from "./DownloadScheduleButton";
import ExportButton from "./ExportButton";
import RenameButton from "./RenameButton";
import SaveButton from "./SaveButton";
import ScheduleOverview from "./ScheduleOverview";
import SavedTabSkeleton from "./skeletons/SavedTabSkeleton";
import { Button } from "./ui/button";
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
              disabled={!Object.keys(schedules).length}
            >
              <SelectTrigger className="w-64">
                <SelectValue
                  placeholder={`${
                    !!Object.keys(schedules).length
                      ? schedules[active].name
                      : "-"
                  }`}
                >
                  {schedules[active] ? schedules[active].name : "-"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <FixedSizeList
                  width={`100%`}
                  height={Math.min(350, 35 * Object.keys(schedules).length)}
                  itemCount={Object.keys(schedules).length}
                  itemSize={35}
                >
                  {({ index, style }) => (
                    <SelectItem
                      key={index}
                      value={`${index}`}
                      style={{ ...style }}
                    >
                      {schedules[index].name}
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
          {schedules[active] && (
            <div className="ml-auto flex flex-row gap-2">
              <RenameButton activeSched={schedules[active]} />
              <SaveButton
                activeSched={schedules[active].classes}
                colors={schedules[active].colors}
              />
              <CourseColorsDialog savedSchedule={schedules[active]} />
              <ExportButton classes={schedules[active].classes} />
              <DownloadScheduleButton
                classes={schedules[active].classes}
                colors={schedules[active].colors}
              />
            </div>
          )}
        </Card>
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

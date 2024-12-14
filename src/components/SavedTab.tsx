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
import Calendar from "./Calendar";
import DownloadScheduleButton from "./DownloadScheduleButton";
import SaveButton from "./SaveButton";
import ScheduleOverview from "./ScheduleOverview";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const SavedTab = () => {
  const schedules = useGlobalStore((state) => state.savedSchedules);
  const [active, setActive] = useState<number>(0);

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
            <>
              <SaveButton
                activeSched={schedules[active].classes}
                colors={schedules[active].colors}
              />
              <DownloadScheduleButton
                classes={schedules[active].classes}
                colors={schedules[active].colors}
              />
            </>
          )}
        </Card>
        {schedules[active] ? (
          <Calendar
            courses={schedules[active].classes}
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

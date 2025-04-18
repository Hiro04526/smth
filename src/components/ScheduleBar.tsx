"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class, UserSchedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FixedSizeList } from "react-window";
import CourseColorsDialog from "./CourseColorsDialog";
import DownloadScheduleButton from "./DownloadScheduleButton";
import ExportButton from "./ExportButton";
import RenameButton from "./RenameButton";
import SaveButton from "./SaveButton";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface BaseScheduleBarProps {
  active: number;
  setActive: (val: number) => void;
  children?: React.ReactNode;
  colors: Record<string, ColorsEnum>;
}

interface SavedSchedulesProps extends BaseScheduleBarProps {
  type: "saved";
  schedules: UserSchedule[];
  changeColors: (name: string, colors: Record<string, ColorsEnum>) => void;
}

interface UnsavedSchedulesProps extends BaseScheduleBarProps {
  type: "unsaved";
  schedules: Class[][];

  // Temporary, will transition all schedules to use UserSchedule
  changeColors?: undefined;
}

type ScheduleBarProps = SavedSchedulesProps | UnsavedSchedulesProps;
export default function ScheduleBar({
  schedules,
  active,
  setActive,
  children,
  colors,
  type,
  ...props
}: ScheduleBarProps) {
  const isSavedSchedule = type === "saved";

  const activeScheduleClasses = isSavedSchedule
    ? schedules[active].classes
    : schedules[active];

  return (
    <Card className="flex flex-row gap-4 p-4">
      <div className="flex flex-row gap-2">
        <Button
          onClick={() => setActive(active - 1)}
          disabled={active <= 0}
          variant="outline"
          size="icon"
          suppressHydrationWarning
        >
          <ChevronLeft />
        </Button>
        <Select
          value={`${active}`}
          onValueChange={(val) => setActive(Number(val))}
          disabled={schedules.length === 0}
        >
          <SelectTrigger className="w-64" suppressHydrationWarning>
            <SelectValue>
              {isSavedSchedule
                ? schedules[active].name
                : `Schedule ${active + 1}`}
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
                <SelectItem key={index} value={`${index}`} style={{ ...style }}>
                  {isSavedSchedule
                    ? schedules[active].name
                    : `Schedule ${index + 1}`}
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
          suppressHydrationWarning
        >
          <ChevronRight />
        </Button>
      </div>
      {children}
      {activeScheduleClasses && (
        <div className="ml-auto flex gap-2">
          {isSavedSchedule && <RenameButton activeSched={schedules[active]} />}
          <SaveButton activeSched={activeScheduleClasses} colors={colors} />
          <CourseColorsDialog
            savedSchedule={isSavedSchedule ? schedules[active] : undefined}
            changeColors={props.changeColors}
          />
          <ExportButton classes={activeScheduleClasses} />
          <DownloadScheduleButton
            classes={activeScheduleClasses}
            colors={colors}
          />
        </div>
      )}
    </Card>
  );
}

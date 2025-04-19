"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserSchedule } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { ChevronLeft, ChevronRight, Eraser } from "lucide-react";
import { FixedSizeList } from "react-window";
import CopyToManualButton from "./CopyToManualButton";
import CourseColorsDialog from "./CourseColorsDialog";
import DownloadScheduleButton from "./DownloadScheduleButton";
import ExportButton from "./ExportButton";
import ManualHelp from "./ManualHelpDialog";
import RenameButton from "./RenameButton";
import SaveButton from "./SaveButton";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ScheduleBarProps {
  active: number;
  setActive: (val: number) => void;
  children?: React.ReactNode;
  colors: Record<string, ColorsEnum>;
  schedules: UserSchedule[];
  onColorChange?: (colors: Record<string, ColorsEnum>) => void;
  isGenerated?: boolean;
  hasRename?: boolean;
  isManual?: boolean;
}

export default function ScheduleBar({
  schedules,
  active,
  setActive,
  children,
  colors,
  isGenerated = false,
  onColorChange,
  hasRename: isSaved = false,
  isManual = false,
}: ScheduleBarProps) {
  const activeSchedule = schedules[active];
  const activeScheduleClasses = activeSchedule?.classes ?? [];
  const setManualSchedule = useGlobalStore((state) => state.setManualSchedule);

  return (
    <Card className="flex flex-row gap-4 p-4 px-6">
      {!isManual ? (
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
                {activeSchedule ? schedules[active].name : "No schedules found"}
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
            suppressHydrationWarning
          >
            <ChevronRight />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-bold">How to Use Smart Manual Mode?</span>{" "}
          <ManualHelp />
        </div>
      )}
      {children}
      {activeScheduleClasses && (
        <div className="ml-auto flex gap-2">
          <SaveButton
            activeSched={activeScheduleClasses}
            colors={colors}
            disabled={!activeScheduleClasses.length}
          />
          <CourseColorsDialog
            changeColors={onColorChange}
            activeSched={isGenerated ? undefined : activeSchedule}
            disabled={!activeScheduleClasses.length}
          />
          {isSaved && (
            <>
              <RenameButton activeSched={schedules[active]} />
              <CopyToManualButton activeSchedule={schedules[active]} />
            </>
          )}
          {isManual && (
            <Button
              onClick={() =>
                setManualSchedule({ name: "Manual", classes: [], colors: {} })
              }
              variant="outline"
              disabled={!activeScheduleClasses.length}
            >
              <Eraser className="size-4 mr-2" />
              Clear
            </Button>
          )}
          <ExportButton
            classes={activeScheduleClasses}
            disabled={!activeScheduleClasses.length}
          />
          <DownloadScheduleButton
            classes={activeScheduleClasses}
            colors={colors}
            disabled={!activeScheduleClasses.length}
          />
        </div>
      )}
    </Card>
  );
}

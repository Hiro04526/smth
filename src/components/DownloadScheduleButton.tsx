import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useToPng } from "@hugocxl/react-to-image";
import { Download } from "lucide-react";
import Calendar from "./Calendar";
import ScheduleOverview from "./ScheduleOverview";
import { Button } from "./ui/button";

interface DownloadScheduleButtonProps {
  classes: Class[];
  colors: Record<string, ColorsEnum>;
}

/**
 * Component for rendering a button that allows users to download their schedule as a PNG image.
 *
 * @component
 * @param classes - An array of classes to be displayed in the schedule calendar.
 * @param colors - A record mapping classes to their respective colors.
 *
 * @returns The rendered DownloadScheduleButton component.
 *
 * @example
 * <DownloadScheduleButton classes={classes} colors={colors} />
 */
export default function DownloadScheduleButton({
  classes,
  colors,
}: DownloadScheduleButtonProps) {
  const [_, convert, ref] = useToPng<HTMLDivElement>({
    quality: 1,
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "schedule.png";
      link.href = data;
      link.click();
    },
  });

  return (
    <div className="relative">
      <Button onClick={convert}>
        <Download className="mr-2 size-4" />
        Download
      </Button>
      <div className="w-[2300px] h-[1000px] absolute -left-[9999px] -top-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 w-full bg-primary dark:bg-secondary p-8"
          ref={ref}
        >
          <Calendar courses={classes} colors={colors} />
          <ScheduleOverview
            activeSchedule={classes}
            colors={colors}
            columns={2}
            className="w-[35%]"
          />
        </div>
      </div>
    </div>
  );
}

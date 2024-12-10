import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useToPng } from "@hugocxl/react-to-image";
import { Download } from "lucide-react";
import Calendar from "./Calendar";
import ScheduleOverview from "./ScheduleOverview";
import { Button } from "./ui/button";

interface PrintScheduleButtonProps {
  classes: Class[];
  colors: Record<string, ColorsEnum>;
}

/**
 * Component for rendering a button that allows users to download their schedule as a PNG image.
 *
 * @component
 * @param {Class[]} classes - An array of classes to be displayed in the schedule calendar.
 * @param {Record<string, ColorsEnum>} colors - A record mapping classes to their respective colors.
 *
 * @returns {JSX.Element} The rendered PrintScheduleButton component.
 *
 * @example
 * <PrintScheduleButton classes={classes} colors={colors} />
 */
export default function PrintScheduleButton({
  classes,
  colors,
}: PrintScheduleButtonProps) {
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
      <div className="w-[2000px] h-[1000px] absolute -left-[9999px] -top-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 w-full bg-accent p-8"
          ref={ref}
        >
          <Calendar courses={classes} colors={colors} />
          <ScheduleOverview
            activeSchedule={classes}
            colors={colors}
            className="w-[30%]"
          />
        </div>
      </div>
    </div>
  );
}

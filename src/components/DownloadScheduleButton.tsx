import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useToPng } from "@hugocxl/react-to-image";
import { Download, Monitor, Smartphone } from "lucide-react";
import Calendar from "./Calendar";
import Dropdown, { DropdownItems } from "./common/Dropdown";
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
  const [_, convertDesktop, desktopRef] = useToPng<HTMLDivElement>({
    quality: 1,
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "Schedaddle.png";
      link.href = data;
      link.click();
    },
  });

  const [__, convertPhone, mobileRef] = useToPng<HTMLDivElement>({
    quality: 1,
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "Schedaddle-Mobile.png";
      link.href = data;
      link.click();
    },
  });

  const dropdownItems: DropdownItems[] = [
    {
      name: "Desktop",
      Icon: Monitor,
      onClick: convertDesktop,
    },
    {
      name: "Mobile",
      Icon: Smartphone,
      onClick: convertPhone,
    },
  ];

  return (
    <div className="relative">
      <Dropdown items={dropdownItems} className="dropdown-content-width-full">
        <Button variant="default" className="w-full px-5">
          <Download className="mr-2 size-4" /> Download
        </Button>
      </Dropdown>
      <div className="w-[2560px] h-[1440px] absolute -left-[9999px] -top-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 h-full w-full bg-primary dark:bg-accent p-8"
          ref={desktopRef}
        >
          <Calendar
            courses={classes}
            colors={colors}
            cellHeight="h-20"
            cellSizePx={80}
          />
          <ScheduleOverview
            activeSchedule={classes}
            colors={colors}
            columns={2}
            className="w-[35%]"
          />
        </div>
      </div>
      <div className="w-[1080px] h-[2160px] absolute -top-[9999px] -left-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 h-full items-center w-full bg-primary dark:bg-accent p-8"
          ref={mobileRef}
        >
          <div className="w-full">
            <Calendar
              courses={classes}
              colors={colors}
              cellHeight="h-28"
              cellSizePx={112}
              isMobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

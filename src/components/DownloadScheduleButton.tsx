import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useToPng } from "@hugocxl/react-to-image";
import { Download, Monitor, Smartphone } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import Calendar from "./Calendar";
import Dropdown, { DropdownItems } from "./common/Dropdown";
import SchedaddleLogo from "./SchedaddleLogo";
import ScheduleOverview from "./ScheduleOverview";
import { Button, ButtonProps } from "./ui/button";

interface DownloadScheduleButtonProps extends ButtonProps {
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
  ...props
}: DownloadScheduleButtonProps) {
  const toastId = useRef<string | null | number>(null);
  const [_, convertDesktop, desktopRef] = useToPng<HTMLDivElement>({
    quality: 1,
    pixelRatio: 2,
    onLoading: () => {
      toastId.current = toast.loading("Generating image...");
    },
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "Schedaddle.png";
      link.href = data;
      link.click();

      toast.dismiss(toastId.current as string | number);
      toast.success("Image generated successfully!");
    },
  });

  const [__, convertPhone, mobileRef] = useToPng<HTMLDivElement>({
    quality: 1,
    pixelRatio: 2,
    onLoading: () => {
      toastId.current = toast.loading("Generating image...");
    },
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "Schedaddle-Mobile.png";
      link.href = data;
      link.click();

      toast.dismiss(toastId.current as string | number);
      toast.success("Image generated successfully!");
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
        <Button variant="default" className="w-full px-5" {...props}>
          <Download className="mr-2 size-4" /> Download
        </Button>
      </Dropdown>
      <div className="w-[2560px] h-[1440px] absolute -left-[9999px] -top-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 h-full w-full bg-[url(/SchedaddleBG.Desktop.png)] p-8 bg-cover"
          ref={desktopRef}
        >
          <Calendar
            classes={classes}
            colors={colors}
            cellHeight="h-20"
            cellSizePx={80}
            className="shadow-[0_0_30px_20px_rgba(0,0,0,0.2)] border-none"
          />
          <ScheduleOverview
            activeSchedule={classes}
            colors={colors}
            columns={2}
            className="w-[35%] bg-background/30 dark:bg-background/40 border-none backdrop-blur-lg shadow-[0_0_20px_10px_rgba(0,0,0,0.2)]"
          />
          <div className="p-2 bg-accent rounded-lg flex justify-center pl-3 max-w-[40px] absolute right-16 bottom-16">
            <SchedaddleLogo
              width={24}
              height={24}
              className="text-accent-foreground"
            />
          </div>
        </div>
      </div>
      <div className="w-[1080px] h-[2160px] absolute -top-[9999px] -left-[9999px]">
        <div
          className="flex flex-row gap-8 min-h-0 h-full items-center w-full bg-[url(/SchedaddleBG.Mobile.png)] p-8"
          ref={mobileRef}
        >
          <div className="w-full">
            <Calendar
              classes={classes}
              colors={colors}
              cellHeight="h-28"
              cellSizePx={112}
              className="drop-shadow-xl border-none"
              isMobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

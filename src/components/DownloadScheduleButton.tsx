import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { useToJpeg } from "@hugocxl/react-to-image";
import { Download, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Calendar from "./Calendar";
import SchedaddleLogo from "./SchedaddleLogo";
import ScheduleOverview from "./ScheduleOverview";
import { Button, ButtonProps } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="default"
        className="w-full px-5"
        onClick={() => setOpen(true)}
        {...props}
      >
        <Download className="mr-2 size-4" /> Download
      </Button>
      <DownloadDialog
        open={open}
        setOpen={setOpen}
        classes={classes}
        colors={colors}
      />
    </div>
  );
}

interface DownloadDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  classes: Class[];
  colors: Record<string, ColorsEnum>;
}

function DownloadDialog({
  open,
  setOpen,
  colors,
  classes,
}: DownloadDialogProps) {
  const [aspectRatio, setAspectRatio] = useState<[number, number]>([
    2560, 1440,
  ]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isMobile = aspectRatio[0] <= aspectRatio[1];

  const [{ isLoading }, convert, ref] = useToJpeg<HTMLDivElement>({
    quality: 1,
    pixelRatio: isMobile ? 3 : 2,
    onLoading: () => {
      toast.loading("Generating image...");
    },
    onSuccess: (data) => {
      const link = document.createElement("a");
      const isMobile = aspectRatio[0] <= aspectRatio[1];

      link.download = isMobile ? "Schedaddle-Mobile.png" : "Schedaddle.png";
      link.href = data;
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("Downloaded Image successfully!");
      setImageUrl(null);
      setOpen(false);
      setAspectRatio([2560, 1440]);
    },
  });

  const dropdownItems = {
    landscape: [
      {
        name: "Desktop (16:9)",
        Icon: Monitor,
        value: [2560, 1440],
      },
      {
        name: "Tablet (4:3)",
        Icon: Tablet,
        value: [2048, 1536],
      },
    ],
    portrait: [
      {
        name: "Phone (16:9)",
        Icon: Smartphone,
        value: [1080, 1920],
      },
      {
        name: "Tall Phone (21:9)",
        Icon: Smartphone,
        value: [1080, 2520],
      },
      {
        name: "Tablet (3:4)",
        Icon: Tablet,
        value: [1536, 2048],
      },
    ],
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Download Schedule</DialogTitle>
          <DialogDescription>
            Choose between mobile or desktop view. You can also upload your own
            image to use as a background.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[fit-content(30%)_auto] gap-2 items-center">
          <Label htmlFor="aspectRatio" className="text-nowrap">
            Aspect Ratio
          </Label>
          <Select
            name="aspectRatio"
            onValueChange={(value) => {
              const selectedItem = [
                ...dropdownItems.landscape,
                ...dropdownItems.portrait,
              ].find((item) => item.name === value);
              if (selectedItem) {
                setAspectRatio([selectedItem.value[0], selectedItem.value[1]]);
              }
            }}
            defaultValue="Desktop (16:9)"
          >
            <SelectTrigger className="w-full">
              <div className="ml-2">
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectGroup>
                <SelectLabel>Landscape</SelectLabel>
                {dropdownItems.landscape.map((item, index) => (
                  <SelectItem key={`landscape-${index}`} value={item.name}>
                    <div className="flex items-center gap-2">
                      {item.Icon && (
                        <item.Icon
                          className="size-4 shrink-0"
                          strokeWidth={2.5}
                        />
                      )}
                      {item.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Portrait</SelectLabel>
                {dropdownItems.portrait.map((item, index) => (
                  <SelectItem key={`portrait-${index}`} value={item.name}>
                    <div className="flex items-center gap-2">
                      {item.Icon && (
                        <item.Icon
                          className="size-4 shrink-0"
                          strokeWidth={2.5}
                        />
                      )}
                      {item.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Label htmlFor="fileUpload" className="text-nowrap">
            Custom BG
          </Label>
          <Input name="fileUpload" type="file" onChange={handleImageUpload} />
        </div>
        <DialogFooter>
          <Button onClick={convert} disabled={isLoading}>
            <Download className="size-4 mr-2" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
      <div className="relative">
        <Wallpaper
          ref={ref}
          imageUrl={imageUrl}
          classes={classes}
          colors={colors}
          aspectRatio={aspectRatio}
        />
      </div>
    </Dialog>
  );
}

interface WallpaperProps {
  imageUrl: string | null;
  classes: Class[];
  colors: Record<string, ColorsEnum>;
  aspectRatio: [width: number, height: number];
  ref: (node: HTMLDivElement) => void;
}

function Wallpaper({
  imageUrl,
  classes,
  colors,
  aspectRatio,
  ref,
}: WallpaperProps) {
  const isMobile = aspectRatio[0] <= aspectRatio[1];
  console.log(isMobile);
  console.log(aspectRatio);
  const [width, height] = aspectRatio;
  const cellSize = Math.min(height / (17.5 + (isMobile ? 4 : 0)), 0.7 * height);

  return (
    <div
      className="absolute -left-[9999px] -top-[1000px]"
      style={{ width, height }}
    >
      <div
        className={cn(
          "flex flex-row gap-8 min-h-0 h-full w-full p-8 bg-cover bg-center overflow-hidden items-center justify-center",
          isMobile && "p-20 py-[12.5%]"
        )}
        style={{
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : isMobile
            ? `url(/SchedaddleBG.Mobile.png)`
            : `url(/SchedaddleBG.Desktop.png)`,
        }}
        id="wallpaper"
        ref={ref}
      >
        <Calendar
          classes={classes}
          colors={colors}
          cellSizePx={cellSize}
          className="h-max shadow-[0_0_30px_20px_rgba(0,0,0,0.2)] border-none"
          isMobile={isMobile}
        />
        {!isMobile && (
          <ScheduleOverview
            activeSchedule={classes}
            colors={colors}
            columns={2}
            className="w-[45%] bg-background/30 dark:bg-background/40 border-none backdrop-blur-lg shadow-[0_0_20px_10px_rgba(0,0,0,0.2)]"
          />
        )}
        <div
          className={cn(
            "p-2 bg-accent rounded-lg flex justify-center pl-3 absolute w-max",
            isMobile ? "bottom-6 left-0 right-0 mx-auto" : "right-12 bottom-12"
          )}
        >
          <SchedaddleLogo
            width={32}
            height={32}
            className="text-accent-foreground"
          />
        </div>
      </div>
    </div>
  );
}

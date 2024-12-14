"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import TooltipButton from "./common/TooltipButton";
import { StepCard } from "./HelpDialog";

export default function Announcement() {
  const [open, setOpen] = useState(false);
  const { hasSeenAnnouncement, setHasSeenAnnouncement } = useGlobalStore(
    useShallow((state) => ({
      hasSeenAnnouncement: state.hasSeenAnnouncement,
      setHasSeenAnnouncement: state.setHasSeenAnnouncement,
    }))
  );

  const hasHydrated = useGlobalStore.persist.hasHydrated();

  const title = "Quality of Life Update!";
  const description = "We have added some new features to our website!";
  const patchDate = "2024-12-14";

  const updates = [
    {
      title: "Customizable Colors",
      description:
        "Course Colors are now customizable in Schedules! You can also now set if you want to randomize colors.",
    },
    {
      title: "Selected Rows Indicator",
      description:
        "You can now see how many rows have been selected for a specific course on the course list.",
    },
    {
      title: "Clear Selected Rows",
      description:
        "All rows can now be cleared on the click of one button! You can see it near the Course List.",
    },
    {
      title: "Toggle Columns",
      description:
        "Table Columns can now be hidden/shown using the 'View' button at the top-right corner of the table.",
    },
  ];

  useEffect(() => {
    if (hasHydrated && hasSeenAnnouncement !== patchDate) {
      setOpen(true);
      setHasSeenAnnouncement(patchDate);
    }
  }, [hasHydrated, hasSeenAnnouncement, setHasSeenAnnouncement]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton variant="outline" tooltip="Announcement" size="icon">
          <Megaphone className="size-5" />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="max-h-[75%] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          {updates.map(({ title, description }, i) => (
            <StepCard
              key={i}
              step={i + 1}
              description={description}
              title={title}
            />
          ))}
        </div>
        <DialogFooter className="sm:justify-start">
          <p className="text-sm text-muted-foreground">
            Patch Date: {patchDate}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

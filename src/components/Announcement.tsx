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
import { StepCard } from "./HelpDialog";
import { Button } from "./ui/button";

export default function Announcement() {
  const [open, setOpen] = useState(false);
  const { hasSeenAnnouncement, setHasSeenAnnouncement } = useGlobalStore(
    useShallow((state) => ({
      hasSeenAnnouncement: state.hasSeenAnnouncement,
      setHasSeenAnnouncement: state.setHasSeenAnnouncement,
    }))
  );

  const hasHydrated = useGlobalStore.persist.hasHydrated();

  const title = "Slight Update!";
  const description =
    "We have added some a couple of new features to the website!";
  const patchDate = "2024-12-16";

  const updates = [
    {
      title: "New Filters",
      description:
        "New filters have been added to the classes table! You can now filter by professor, section, and even remarks!",
    },
    {
      title: "Change Saved Schedule Colors",
      description:
        "You can now change the colors of your saved schedules! Click on the Palette Button near the Download button to change it.",
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
        <Button variant="outline" size="icon">
          <Megaphone className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
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

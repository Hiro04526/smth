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

  const title = "Big Update!";
  const description =
    "We have added some a couple of new features to the website!";
  const patchDate = "2024-12-22";

  const updates = [
    {
      title: "Grouped Courses",
      description:
        "Courses can now be grouped! Groups allow you to make your schedules more flexible by allowing only a specific amount of courses from a specific group.",
    },
    {
      title: "Custom Courses & Classes",
      description:
        "You can now add custom courses and classes! You can add a custom course by clicking the 'Add Course' button.",
    },
    {
      title: "New QOL Functions",
      description:
        "You can now remove all courses with the click of one button. Click the '...' button near Course List to view the functions!",
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

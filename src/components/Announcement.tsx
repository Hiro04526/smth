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
import { ScrollArea } from "./ui/scroll-area";

export default function Announcement() {
  const [open, setOpen] = useState(false);
  const {
    hasSeenAnnouncement,
    setHasSeenAnnouncement,
    _hasHydrated: hasHydrated,
  } = useGlobalStore(
    useShallow((state) => ({
      hasSeenAnnouncement: state.hasSeenAnnouncement,
      setHasSeenAnnouncement: state.setHasSeenAnnouncement,
      _hasHydrated: state._hasHydrated,
    }))
  );

  const title = "The Calendar Update!";
  const description = "I've updated some things in the website!";
  const patchDate = "April 18, 2025";

  const updates = [
    {
      title: "Export to Calendar",
      description:
        "You can now export your schedule as an .ics file! Click the 'Export' button near the download button. Thanks for the suggestion @Ed*****oded!",
    },
    {
      title: "Edit & Delete Classes",
      description:
        "Classes can now be edited and deleted! Check the '...' button at the end of the class in the table.",
    },
    {
      title: "Drag & Drop Classes to create a new group",
      description:
        "You can now drag and drop classes to create a new group! Just drag the class to the 'Create New Group' box.",
    },
    {
      title: "Better pop-up notifications",
      description:
        "Toasts, or pop-up notifications, are now more consistent and better looking. They also provide more information now.",
    },
    {
      title: "A bunch of bug fixes",
      description:
        "Issues such as LASARE3 dates becoming days (e.g. `MAY1 -> M`), selected rows and filters not being removed, and more have been fixed. Hopefully this makes the app better to use!",
    },
    {
      title: "Call for suggestions",
      description:
        "If you have any more suggestions, please let me know! You can do so through Reddit DM or on GitHub. I will try to implement them as soon as possible.",
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
        <ScrollArea className="max-h-[500px] w-full">
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
        </ScrollArea>
        <DialogFooter className="sm:justify-start">
          <p className="text-sm text-muted-foreground">
            Patch Date: {patchDate}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

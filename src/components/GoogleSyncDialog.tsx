"use client";

import useGoogleCalendar from "@/hooks/useGoogleCalendar";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface GoogleSyncProps {
  hookProps: Omit<ReturnType<typeof useGoogleCalendar>, "handleClick">;
}

export default function GoogleSyncDialog({ hookProps }: GoogleSyncProps) {
  const {
    calendars,
    open,
    setOpen,
    selectedCalendar,
    setSelectedCalendar,
    handleExport,
    importing,
  } = hookProps;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Calendar</DialogTitle>
          <DialogDescription>
            The calendar is where the schedule will be exported to.
          </DialogDescription>
        </DialogHeader>
        <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
          <SelectTrigger>
            <SelectValue placeholder="Select a calendar" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {calendars.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id}>
                  {calendar.summary}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            onClick={handleExport}
            variant="outline"
            disabled={!selectedCalendar || importing}
          >
            {importing && <Loader2 className="size-4 animate-spin mr-2" />}
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

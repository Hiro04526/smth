"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import { ArrowUpDown, LoaderCircle, Megaphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function MigrateDataDialog() {
  const idNumber = localStorage.getItem("id_number");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (idNumber) {
      setOpen(true);
    }
  }, [idNumber]);

  const {
    setCourseColors,
    setCourses,
    setSavedSchedules,
    setFilter,
    setSchedules,
    setSelectedRows,
    setId,
  } = useGlobalStore((state) => state);

  const removeLocalStorage = () => {
    localStorage.removeItem("id_number");
    localStorage.removeItem("courses");
    localStorage.removeItem("saved_schedules");
    localStorage.removeItem("filter_options");
    localStorage.removeItem("schedules");
    localStorage.removeItem("course_colors");
    localStorage.removeItem("selected_data");
    localStorage.removeItem("selected_rows");
  };
  const handleMigrate = () => {
    setIsLoading(true);
    const courses = JSON.parse(localStorage.getItem("courses") || "[]");
    const savedSchedules = JSON.parse(
      localStorage.getItem("saved_schedules") || "[]"
    );
    const filter = JSON.parse(localStorage.getItem("filter_options") || "{}");
    const schedules = JSON.parse(localStorage.getItem("schedules") || "[]");
    const selectedRows = JSON.parse(
      localStorage.getItem("selected_rows") || "{}"
    );
    const colors = JSON.parse(localStorage.getItem("course_colors") || "{}");

    setCourseColors(colors);
    setCourses(courses);
    setSavedSchedules(savedSchedules);
    if (Object.keys(filter).length) {
      setFilter(filter);
    }
    setSchedules(schedules);

    Object.entries(selectedRows).forEach(([courseCode, selected]) => {
      setSelectedRows(courseCode, selected as Record<string, boolean>);
    });

    removeLocalStorage();

    setId(idNumber ?? "");
    setIsLoading(false);
  };

  if (!idNumber) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="inline-flex items-center animate-pulse"
          variant="secondary"
        >
          <Megaphone className="size-4 mr-2" /> Announcement!
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Announcement!</DialogTitle>
          <DialogDescription>{"We've made some changes."}</DialogDescription>
        </DialogHeader>
        <div className="text-justify mb-2 font-normal">
          {
            "We've made some improvements to the site! We've changed how we store data, so you'll have to migrate your data. Choose what we should do with your old data."
          }
        </div>
        <DialogFooter>
          <Button
            className="inline-flex items-center"
            onClick={removeLocalStorage}
            variant="destructive"
          >
            {isLoading ?
              <LoaderCircle className="size-4 animate-spin" />
            : <>
                <Trash2 className="size-4 mr-2" /> Remove Old Data
              </>
            }
          </Button>
          <Button className="inline-flex items-center" onClick={handleMigrate}>
            {isLoading ?
              <LoaderCircle className="size-4 animate-spin" />
            : <>
                <ArrowUpDown className="size-4 mr-2" /> Migrate Data
              </>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

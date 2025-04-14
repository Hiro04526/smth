"use client";

import { cn } from "@/lib/utils";
import { CalendarRange, Heart, TableProperties } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Announcement from "./Announcement";
import HelpDialog from "./HelpDialog";
import IDInput from "./IDInput";
import { ModeToggle } from "./ModeToggle";
import SchedaddleLogo from "./SchedaddleLogo";
import { buttonVariants } from "./ui/button";

const MigrateDataDialog = dynamic(() => import("./MigrateDataDialog"), {
  ssr: false,
});

const NavigationBar = () => {
  const pathName = usePathname();

  const normalButton = cn(
    buttonVariants({
      variant: "ghost",
    }),
    "flex gap-2 items-center"
  );

  const activeButton = cn(
    buttonVariants({
      variant: "default",
    }),
    "flex gap-2 items-center"
  );

  return (
    <div className="p-4 flex items-center justify-between gap-2 w-full border-b px-16 bg-background">
      <Link href="/" className="flex gap-2 font-extrabold text-lg items-center">
        <div className="p-2 bg-accent rounded-lg flex justify-center pl-3 max-w-[40px]">
          <SchedaddleLogo
            className="text-accent-foreground"
            width={24}
            height={24}
          />
        </div>
        Schedaddle
      </Link>
      <div className="flex gap-2">
        <Link
          href="/"
          className={pathName === "/" ? activeButton : normalButton}
        >
          <TableProperties strokeWidth={1.5} size={22} />
          Courses
        </Link>
        <Link
          href="/schedules"
          className={pathName === "/schedules" ? activeButton : normalButton}
        >
          <CalendarRange strokeWidth={1.5} size={22} />
          Schedules
        </Link>
        <Link
          href="/saved"
          className={pathName === "/saved" ? activeButton : normalButton}
        >
          <Heart strokeWidth={1.5} size={22} />
          Saved
        </Link>
      </div>
      <div className="flex flex-row gap-2">
        <MigrateDataDialog />
        <Announcement />
        <IDInput />
        <ModeToggle />
        <HelpDialog />
      </div>
    </div>
  );
};

export default NavigationBar;

"use client";

import Calendar from "@/components/Calendar";
import useManualSchedule from "@/hooks/useManualSchedule";
import { Class } from "@/lib/definitions";
import { ColorsEnum } from "@/lib/enums";
import { useState } from "react";

interface Props {}
export default function ManualPage({}: Props) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [colors, setColors] = useState<Record<string, ColorsEnum>>({});

  const manualProps = useManualSchedule();

  return (
    <div className="flex flex-row w-full min-h-0 py-8 px-16 gap-4 h-full">
      <Calendar classes={classes} colors={colors} manualProps={manualProps} />
    </div>
  );
}

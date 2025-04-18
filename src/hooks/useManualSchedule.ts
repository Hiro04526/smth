import { DaysEnum } from "@/lib/enums";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

interface useManualScheduleProps {
  leftOffset: number;
  topOffset: number;
  cellSizePx: number;
  calculateHeight: (
    start: number,
    end: number,
    type?: "military" | "minutes"
  ) => number;
}

export default function useManualSchedule({
  leftOffset,
  topOffset,
  cellSizePx,
  calculateHeight,
}: useManualScheduleProps) {
  const [dragging, setDragging] = useState(false);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
    day: DaysEnum;
  } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const xPos = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const yPos = e.clientY - e.currentTarget.getBoundingClientRect().top;

    if (xPos < leftOffset || yPos < topOffset) return; // Ignore clicks in the time column or extra space

    const sizePerColumn = Math.floor(
      (e.currentTarget.getBoundingClientRect().width - leftOffset) / 6
    );

    const column = Math.floor((xPos - leftOffset) / sizePerColumn);
    const timeSlot = Math.floor((yPos - topOffset) / (cellSizePx / 4));

    const startTime = 7 * 60 + 15 * timeSlot; // 7:00 AM + 15 minutes per slot

    setDragging(true);
    setSelection({
      start: startTime,
      end: startTime + 15,
      day: ["M", "T", "W", "H", "F", "S"][column] as DaysEnum,
    });

    console.log(formatTime(startTime, "minutes"));
  };

  const handleMouseUp = (e: MouseEvent) => {
    setDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !selection) return;

    const yPos = e.clientY - e.currentTarget.getBoundingClientRect().top;

    if (yPos < topOffset) return; // Ignore clicks in the time column or extra space

    const timeSlot = Math.floor((yPos - topOffset) / (cellSizePx / 4));

    const rawEnd = 7 * 60 + 15 * timeSlot; // 7:00 AM + 15 minutes per slot

    // If the card is going down, we need to make it add +15 minutes since that's the minimum time slot
    const slotOffset = selection.start <= rawEnd ? 15 : 0;

    const endTime = rawEnd + slotOffset;

    setSelection({
      ...selection,
      end: endTime,
    });
    console.log(calculateHeight(420, selection.start, "minutes"));
  };

  useEffect(() => {
    if (window === undefined) return;

    if (dragging) {
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return {
    dragging,
    selection,
    onMouseDown,
    onMouseMove,
    setSelection,
  };
}

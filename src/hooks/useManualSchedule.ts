import { CELL_SIZE_PX, LEFT_OFFSET, TOP_OFFSET } from "@/components/Calendar";
import { DaysEnum } from "@/lib/enums";
import { useEffect, useState } from "react";

export default function useManualSchedule() {
  const days = ["M", "T", "W", "H", "F", "S"] as const;
  const [dragging, setDragging] = useState(false);
  const [selection, setSelection] = useState<{
    baseStart: number;
    baseEnd: number;
    start: number;
    end: number;
    day: DaysEnum;
  } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const xPos = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const yPos = e.clientY - e.currentTarget.getBoundingClientRect().top;

    if (xPos < LEFT_OFFSET || yPos < TOP_OFFSET) return; // Ignore clicks in the time column or extra space

    const sizePerColumn = Math.floor(
      (e.currentTarget.getBoundingClientRect().width - LEFT_OFFSET) / 6
    );

    const column = Math.floor((xPos - LEFT_OFFSET) / sizePerColumn);
    const timeSlot = Math.floor((yPos - TOP_OFFSET) / (CELL_SIZE_PX / 4));

    const startTime = 7 * 60 + 15 * timeSlot; // 7:00 AM + 15 minutes per slot

    if (selection) {
      const isInsideCard =
        selection.day === (days[column] as DaysEnum) &&
        selection.start <= startTime &&
        selection.end >= startTime + 15;

      console.log(isInsideCard);

      if (!isInsideCard) {
        setDragging(false);
        setSelection(null);
      }
      return;
    }

    setDragging(true);
    setSelection({
      baseStart: startTime,
      baseEnd: startTime + 15,
      start: startTime,
      end: startTime + 15,
      day: days[column] as DaysEnum,
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    setDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !selection) return;

    const yPos = e.clientY - e.currentTarget.getBoundingClientRect().top;

    if (yPos < TOP_OFFSET) return; // Ignore clicks in the time column or extra space

    const timeSlot = Math.floor((yPos - TOP_OFFSET) / (CELL_SIZE_PX / 4));

    const rawEnd = 7 * 60 + 15 * timeSlot; // 7:00 AM + 15 minutes per slot

    const endTime = rawEnd;

    if (rawEnd < selection.baseEnd) {
      setSelection({
        ...selection,
        start: endTime,
        end: selection.baseEnd,
      });

      return;
    }

    console.log(selection.baseStart, endTime);
    setSelection({
      ...selection,
      start: selection.baseStart,
      end: endTime + 15,
    });
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

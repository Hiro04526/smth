import React from "react";

const CalendarSkeleton = () => {
  const timeSlots = Array.from({ length: 13 }, (_, i) => i); // 8am-9pm
  const days = ["M", "T", "W", "H", "F", "S"];

  return (
    <div className="bg-card rounded-lg border p-2 h-full w-full overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[3.5rem,repeat(6,1fr)] gap-2 mb-4">
        <div className="h-14 bg-muted animate-pulse rounded-md" />
        {days.map((day) => (
          <div key={day} className="h-14 bg-muted animate-pulse rounded-md" />
        ))}
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-[3.5rem,repeat(6,1fr)] gap-2">
        {timeSlots.map((slot) => (
          <React.Fragment key={`row-${slot}`}>
            {/* Time label column */}
            <div className="h-20 bg-muted/20 animate-pulse rounded-md" />
            {/* Day columns */}
            {days.map((day) => (
              <div
                key={`${day}-${slot}`}
                className="h-20 bg-muted/20 animate-pulse rounded-md"
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Column } from "@tanstack/react-table";
import { Clock, X } from "lucide-react";
import React from "react";

interface DataTableNumericRangeFilterProps<TData, TValue> {
  label: string;
  column: Column<TData, TValue> | undefined;
}

const DEFAULT_MIN = -1;
const DEFAULT_MAX = 99999999999;

export default function RangeFilter<TData, TValue>({
  label,
  column,
}: DataTableNumericRangeFilterProps<TData, TValue>) {
  const [min, max] = (column?.getFilterValue() as number[]) ?? [
    DEFAULT_MIN,
    DEFAULT_MAX,
  ];

  let formattedValue = null;

  if (min !== DEFAULT_MIN && max !== DEFAULT_MAX) {
    formattedValue = min === max ? `${min}` : `${min} - ${max}`;
  } else if (min !== DEFAULT_MIN) {
    formattedValue = `>${min}`;
  } else if (max !== DEFAULT_MAX) {
    formattedValue = `<${max}`;
  }

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newMin = value === "" ? DEFAULT_MIN : Number(value);
    if (!isNaN(newMin)) {
      column?.setFilterValue([newMin, max]);
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newMax = value === "" ? DEFAULT_MAX : Number(value);
    if (!isNaN(newMax)) {
      column?.setFilterValue([min, newMax]);
    }
  };

  const isSet = DEFAULT_MIN !== min || DEFAULT_MAX !== max;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-8 ${!isSet && "text-muted-foreground"}`}
        >
          <Clock className="text-muted-foreground size-4 mr-2" />
          {label}
          {formattedValue && (
            <Badge className="ml-2" variant="secondary">
              {formattedValue}
            </Badge>
          )}
          <div
            onClick={() => {
              column?.setFilterValue(undefined);
            }}
            className="ml-2 rounded-lg text-muted-foreground transition-all hover:text-destructive"
          >
            <X className="size-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="flex w-full flex-row items-center gap-2">
          <Input
            value={min === DEFAULT_MIN ? "" : min}
            onChange={handleMinChange}
            className="h-8"
            placeholder="Min"
            pattern="[0-9]*" // Allow empty input
          />
          {" - "}
          <Input
            value={max === DEFAULT_MAX ? "" : max}
            onChange={handleMaxChange}
            className="h-8"
            placeholder="Max"
            pattern="[0-9]*" // Allow empty input
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

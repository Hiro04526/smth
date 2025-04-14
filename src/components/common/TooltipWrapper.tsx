import { TooltipProps } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TooltipWrapperProps extends TooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export default function TooltipWrapper({
  children,
  content,
  ...props
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

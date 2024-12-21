import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Ellipsis } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DropdownItems {
  name: string;
  onClick?: () => void;
}

interface DropdownProps extends DropdownMenuContentProps {
  title?: string;
  children?: ReactNode;
  items: DropdownItems[];
}

export default function Dropdown({
  title = "Options",
  children,
  items,
}: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <Button size="icon" variant="ghost" className="size-8">
            <Ellipsis className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item, index) => (
          <DropdownMenuItem key={index} onClick={item?.onClick}>
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

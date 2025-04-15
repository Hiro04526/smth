import { cn } from "@/lib/utils";

interface ButtonSkeletonProps {
  className?: string;
  isIcon?: boolean;
}

const ButtonSkeleton = ({ className, isIcon }: ButtonSkeletonProps) => {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded-md",
        isIcon ? "h-10 w-10" : "h-10 w-24",
        className
      )}
    />
  );
};

export default ButtonSkeleton;

import { cn } from "@/lib/utils";

/**
 * @ai-context Shimmer skeleton component for loading states.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md skeleton-shimmer", className)}
      {...props}
    />
  );
}

export { Skeleton };

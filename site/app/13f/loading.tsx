import { Skeleton } from "@/components/ui/skeleton";

export default function ThirteenFLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

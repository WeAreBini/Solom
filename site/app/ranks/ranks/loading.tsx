import { Skeleton } from "@/components/ui/skeleton";

export default function RanksLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[500px] rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );
}

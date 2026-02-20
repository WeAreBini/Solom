import { Skeleton } from "@/components/ui/skeleton";

export default function InsiderSenateLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

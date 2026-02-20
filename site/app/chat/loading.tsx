import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full animate-fade-in">
      <div className="space-y-2 pb-4 border-b mb-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-lg`} />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 rounded-lg mt-auto" />
    </div>
  );
}

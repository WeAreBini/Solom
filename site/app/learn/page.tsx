import { Metadata } from "next";
import { CourseList } from "@/components/learn/CourseList";
import { GraduationCap, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn to Earn | Solom",
  description: "Complete educational modules to earn paper trading balance.",
};

export default function LearnPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Learn to Earn
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Master the markets with our interactive educational modules. Complete courses to earn paper trading balance and improve your trading skills.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border">
          <div className="flex flex-col items-center justify-center px-4 border-r">
            <span className="text-2xl font-bold text-primary">4</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Modules</span>
          </div>
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-2xl font-bold text-amber-500 flex items-center">
              <Trophy className="h-5 w-5 mr-1" />
              $2,750
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Rewards</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <CourseList />
      </div>
    </div>
  );
}

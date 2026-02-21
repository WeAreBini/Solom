"use client";

/**
 * @ai-context Component to display educational modules and handle completion.
 * @ai-related app/learn/page.tsx, app/api/learn/complete/route.ts
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
}

const MODULES: Module[] = [
  {
    id: "intro-to-options",
    title: "Intro to Options",
    description: "Learn the basics of call and put options, strike prices, and expiration dates.",
    duration: "15 min",
  },
  {
    id: "risk-management",
    title: "Risk Management",
    description: "Understand position sizing, stop losses, and how to protect your capital.",
    duration: "20 min",
  },
  {
    id: "technical-analysis-101",
    title: "Technical Analysis 101",
    description: "Master support, resistance, moving averages, and basic chart patterns.",
    duration: "30 min",
  },
  {
    id: "fundamental-analysis",
    title: "Fundamental Analysis",
    description: "Learn how to read balance sheets, income statements, and evaluate company health.",
    duration: "45 min",
  },
];

export function CourseList() {
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("educational_progress")
          .select("module_id")
          .eq("user_id", user.id)
          .eq("status", "completed");

        if (error) throw error;

        if (data) {
          setCompletedModules(new Set(data.map((d) => d.module_id)));
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setFetching(false);
      }
    }

    fetchProgress();
  }, [supabase]);

  const handleComplete = async (moduleId: string) => {
    setLoading(moduleId);
    try {
      const response = await fetch("/api/learn/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moduleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete module");
      }

      setCompletedModules((prev) => new Set(prev).add(moduleId));
      
      toast.success("Module Completed! 🎉", {
        description: "You've successfully completed this module.",
      });
    } catch (error: unknown) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(null);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {MODULES.map((mod) => {
        const isCompleted = completedModules.has(mod.id);
        const isLoading = loading === mod.id;

        return (
          <Card key={mod.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{mod.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {mod.duration}
                    </span>
                  </CardDescription>
                </div>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{mod.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end items-center border-t pt-4">
              <Button
                onClick={() => handleComplete(mod.id)}
                disabled={isCompleted || isLoading}
                variant={isCompleted ? "outline" : "default"}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCompleted ? "Completed" : "Mark as Complete"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

"use client";

/**
 * @ai-context Component to display the top users by paper_balance.
 * @ai-related app/community/page.tsx, app/api/community/leaderboard/route.ts
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Loader2, TrendingUp } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  paper_balance: number;
  avatar_url?: string;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/community/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/10">
        <p>Error loading leaderboard: {error}</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Top Traders</CardTitle>
        <CardDescription>
          The most profitable paper traders in the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {users.map((user, index) => {
            const isTop3 = index < 3;
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  isTop3 ? "bg-muted/50 border" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 font-bold text-lg">
                    {index === 0 ? (
                      <Medal className="h-6 w-6 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="h-6 w-6 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="h-6 w-6 text-amber-700" />
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <Avatar className={isTop3 ? "h-12 w-12 border-2 border-background shadow-sm" : "h-10 w-10"}>
                    <AvatarImage src={user.avatar_url} alt={user.username} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">{user.username || "Anonymous Trader"}</p>
                    {isTop3 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Top Performer
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg tracking-tight">
                    ${Number(user.paper_balance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">Portfolio Value</p>
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No traders found. Be the first to start trading!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Metadata } from "next";
import { Leaderboard } from "@/components/community/Leaderboard";
import { Users, MessageSquare, Share2, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Community | Solom",
  description: "Join the Solom trading community, share ideas, and compete on the leaderboard.",
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          Community
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with other traders, share your strategies, and see how you stack up against the best on the platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Compete
            </CardTitle>
            <CardDescription>Climb the ranks and prove your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our leaderboard tracks the top paper trading portfolios. Make smart trades, manage your risk, and earn your spot at the top.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Discuss
            </CardTitle>
            <CardDescription>Share ideas and learn from others</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join the conversation in our community forums. Discuss market trends, analyze stocks, and get feedback on your trading ideas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-500" />
              Share
            </CardTitle>
            <CardDescription>Showcase your best trades</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Easily share your portfolio performance and individual trades with the community or on your favorite social networks.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-8 border-t">
        <Leaderboard />
      </div>
    </div>
  );
}

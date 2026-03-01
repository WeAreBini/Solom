"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaCard, IdeaCardSkeleton } from "@/components/social/IdeaCard";
import { useFeed, useCreateIdea, useToggleLike, useToggleBookmark } from "@/lib/hooks/use-social";
import type { FeedType, Timeframe, TradeDirection, Visibility } from "@/lib/types/social";
import {
  Sparkles,
  Plus,
  TrendingUp,
  Users,
  Zap,
  Bell,
  Search,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";

// Simple icons as components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function SocialPage() {
  const [feedType, setFeedType] = useState<FeedType>('trending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tickerFilter, setTickerFilter] = useState<string>('');

  const { data, isLoading, refetch, isFetching } = useFeed(feedType, tickerFilter || undefined);
  const createIdea = useCreateIdea();
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();

  const ideas = data?.ideas ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">Solom</span>
            <Badge variant="secondary" className="ml-2">
              Social
            </Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                Markets
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Trading</h1>
            <p className="mt-2 text-muted-foreground">
              Discover trade ideas, follow top traders, and share your insights
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>

        {/* Feed Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={feedType} onValueChange={(v) => setFeedType(v as FeedType)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="trending" className="gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-1.5">
                <Users className="h-4 w-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="foryou" className="gap-1.5">
                <Zap className="h-4 w-4" />
                For You
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter by ticker..."
                value={tickerFilter}
                onChange={(e) => setTickerFilter(e.target.value.toUpperCase())}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Feed */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IdeaCardSkeleton key={i} />
                ))}
              </div>
            ) : ideas.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No ideas yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feedType === 'following'
                    ? "Follow some traders to see their ideas here!"
                    : "Be the first to share a trade idea!"}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Share Your First Idea
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onLike={() => toggleLike.mutate({ ideaId: idea.id, isLiked: idea.isLiked })}
                    onBookmark={() => toggleBookmark.mutate({ ideaId: idea.id, isBookmarked: idea.isBookmarked })}
                  />
                ))}
                {data?.hasMore && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {}}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ideas Today</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Traders</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Live Discussions</span>
                  <span className="font-semibold">45</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Tickers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trending Tickers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['NVDA', 'TSLA', 'AAPL', 'META', 'AMZN', 'GOOGL', 'MSFT', 'AMD'].map((ticker) => (
                    <Badge
                      key={ticker}
                      variant={tickerFilter === ticker ? 'default' : 'secondary'}
                      className="cursor-pointer font-mono"
                      onClick={() => setTickerFilter(tickerFilter === ticker ? '' : ticker)}
                    >
                      ${ticker}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Traders */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Traders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Sarah Chen', winRate: 78, ideas: 42 },
                  { name: 'Mike Johnson', winRate: 72, ideas: 38 },
                  { name: 'Alex Rivera', winRate: 68, ideas: 55 },
                ].map((trader, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{trader.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {trader.winRate}% win rate · {trader.ideas} ideas
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm mb-2">About Social Trading</h4>
                <p className="text-xs text-muted-foreground">
                  Share trade ideas with the community. Get verified by connecting your brokerage
                  to build trust. Remember: all content is for informational purposes only and
                  does not constitute financial advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Idea Modal */}
      {showCreateModal && (
        <CreateIdeaModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => {
            createIdea.mutate(data, {
              onSuccess: () => {
                setShowCreateModal(false);
                refetch();
              },
            });
          }}
          isLoading={createIdea.isPending}
        />
      )}

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Solom. Built with ❤️ by WeAreBini</p>
        </div>
      </footer>
    </div>
  );
}

// Create Idea Modal Component
interface CreateIdeaModalProps {
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    tickers: string[];
    title?: string;
    entryPrice?: number;
    targetPrice?: number;
    stopLoss?: number;
    timeframe?: Timeframe;
    direction?: TradeDirection;
    thesis?: string;
    visibility?: Visibility;
  }) => void;
  isLoading: boolean;
}

function CreateIdeaModal({ onClose, onSubmit, isLoading }: CreateIdeaModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [tickerInput, setTickerInput] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe | ''>('');
  const [direction, setDirection] = useState<TradeDirection | ''>('');
  const [thesis, setThesis] = useState('');

  const handleAddTicker = () => {
    const ticker = tickerInput.toUpperCase().trim();
    if (ticker && !tickers.includes(ticker) && tickers.length < 10) {
      setTickers([...tickers, ticker]);
      setTickerInput('');
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter((t) => t !== ticker));
  };

  const handleSubmit = () => {
    if (!content.trim() || tickers.length === 0) return;

    onSubmit({
      content: content.trim(),
      tickers,
      title: title.trim() || undefined,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      timeframe: timeframe || undefined,
      direction: direction || undefined,
      thesis: thesis.trim() || undefined,
      visibility: 'PUBLIC',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Share a Trade Idea</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tickers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tickers <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AAPL"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase().slice(0, 5))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTicker}>
                Add
              </Button>
            </div>
            {tickers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tickers.map((ticker) => (
                  <Badge key={ticker} variant="secondary" className="gap-1">
                    ${ticker}
                    <button onClick={() => handleRemoveTicker(ticker)} className="ml-1 hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              placeholder="Brief headline for your idea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Analysis <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Share your analysis, setup, or trade thesis..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000
            </p>
          </div>

          {/* Direction & Timeframe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Direction</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={direction === 'LONG' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDirection(direction === 'LONG' ? '' : 'LONG')}
                >
                  ↑ Long
                </Button>
                <Button
                  type="button"
                  variant={direction === 'SHORT' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDirection(direction === 'SHORT' ? '' : 'SHORT')}
                >
                  ↓ Short
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <div className="flex gap-2">
                {(['INTRADAY', 'SWING', 'POSITION'] as const).map((tf) => (
                  <Button
                    key={tf}
                    type="button"
                    variant={timeframe === tf ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setTimeframe(timeframe === tf ? '' : tf)}
                  >
                    {tf.charAt(0) + tf.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Entry Price</label>
              <Input
                type="number"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Price</label>
              <Input
                type="number"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stop Loss</label>
              <Input
                type="number"
                placeholder="0.00"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>
          </div>

          {/* Thesis */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment Thesis (optional)</label>
            <Textarea
              placeholder="Why this trade makes sense..."
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> Trade ideas are for educational purposes only and do not
            constitute financial advice. Always do your own research before making investment decisions.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || tickers.length === 0 || isLoading}
            >
              {isLoading ? 'Posting...' : 'Post Idea'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
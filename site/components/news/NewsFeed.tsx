"use client";

/**
 * @ai-context NewsFeed component displaying market news with sentiment indicators.
 * @ai-related app/trade/page.tsx
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMarketNews } from "@/hooks/use-fmp";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "bullish" | "bearish" | "neutral";
  url: string;
}

export function NewsFeed({ symbol }: { symbol?: string }) {
  const { data: newsData, isLoading, isError } = useMarketNews(symbol);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{symbol ? `${symbol} News` : "Market News"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="flex flex-col divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : isError || !newsData ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Failed to load news.
              </div>
            ) : newsData.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No news available.
              </div>
            ) : (
              newsData.map((article) => (
                <a
                  key={article.url || article.title}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-2 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm font-medium leading-snug line-clamp-2">
                      {article.title}
                    </h4>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{article.site}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <SentimentBadge sentiment="neutral" />
                  </div>
                </a>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: NewsArticle["sentiment"] }) {
  switch (sentiment) {
    case "bullish":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
          <TrendingUp className="h-3 w-3" /> Bullish
        </Badge>
      );
    case "bearish":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1">
          <TrendingDown className="h-3 w-3" /> Bearish
        </Badge>
      );
    case "neutral":
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20 gap-1">
          <Minus className="h-3 w-3" /> Neutral
        </Badge>
      );
  }
}

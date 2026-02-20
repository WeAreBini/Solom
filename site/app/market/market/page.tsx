/**
 * @ai-context Market Overview — gainers, losers, most active with clickable rows.
 * Server Component with Suspense streaming.
 */
import React, { Suspense } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { GainLossBadge } from "@/components/finance/GainLossBadge";
import { getMarketGainers, getMarketLosers, getMarketActives } from "@/app/actions/fmp";

export const metadata = { title: "Market" };

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
}

function MarketTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-40 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

function MarketTable({ stocks }: { stocks: MarketStock[] }) {
  if (stocks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data available.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">% Change</TableHead>
          <TableHead className="text-right">Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.slice(0, 20).map((stock) => (
          <TableRow key={stock.symbol} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <TableCell>
              <Link
                href={`/ticker/${stock.symbol}`}
                className="font-mono font-semibold text-primary hover:underline"
              >
                {stock.symbol}
              </Link>
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {stock.name}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium">
              ${(stock.price ?? 0).toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <GainLossBadge value={stock.change ?? 0} size="sm" />
            </TableCell>
            <TableCell className="text-right">
              <GainLossBadge value={stock.changesPercentage ?? 0} isPercentage size="sm" />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {(stock.volume ?? 0).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function MarketContent() {
  let gainers: MarketStock[] = [];
  let losers: MarketStock[] = [];
  let actives: MarketStock[] = [];
  let error: string | null = null;

  try {
    [gainers, losers, actives] = await Promise.all([
      getMarketGainers(),
      getMarketLosers(),
      getMarketActives(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load market data.";
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="gainers" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="gainers" className="gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Gainers
        </TabsTrigger>
        <TabsTrigger value="losers" className="gap-1.5">
          <TrendingDown className="h-3.5 w-3.5" />
          Losers
        </TabsTrigger>
        <TabsTrigger value="actives" className="gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Most Active
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gainers">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
            <CardDescription>Stocks with the highest percentage increase today.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <MarketTable stocks={gainers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="losers">
        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
            <CardDescription>Stocks with the highest percentage decrease today.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <MarketTable stocks={losers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="actives">
        <Card>
          <CardHeader>
            <CardTitle>Most Active</CardTitle>
            <CardDescription>Stocks with the highest trading volume today.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <MarketTable stocks={actives} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function MarketPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground">
          Real-time market movers — gainers, losers, and most active stocks.
        </p>
      </div>
      <Suspense fallback={<MarketTableSkeleton />}>
        <MarketContent />
      </Suspense>
    </div>
  );
}

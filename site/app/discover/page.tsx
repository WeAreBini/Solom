import { getMarketActives, getMarketGainers, getMarketLosers } from "@/app/actions/fmp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Flame, TrendingDown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Discover | Solom",
  description: "Discover trending stocks, top gainers, and market movers.",
};

export default async function DiscoverPage() {
  const [actives, gainers, losers] = await Promise.all([
    getMarketActives(),
    getMarketGainers(),
    getMarketLosers(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discover</h2>
          <p className="text-muted-foreground">
            Explore trending stocks, top gainers, and market movers.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {actives.slice(0, 5).map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                <Link href={`/ticker/${stock.symbol}`} key={stock.symbol}>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium leading-none">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate w-32">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">${stock.price?.toFixed(2)}</p>
                      <p className={`text-xs flex items-center justify-end mt-1 ${stock.changesPercentage >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {stock.changesPercentage >= 0 ? (
                          <ArrowUpIcon className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(stock.changesPercentage || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {gainers.slice(0, 5).map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                <Link href={`/ticker/${stock.symbol}`} key={stock.symbol}>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium leading-none">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate w-32">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">${stock.price?.toFixed(2)}</p>
                      <p className="text-xs flex items-center justify-end mt-1 text-emerald-500">
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                        {Math.abs(stock.changesPercentage || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {losers.slice(0, 5).map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                <Link href={`/ticker/${stock.symbol}`} key={stock.symbol}>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium leading-none">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate w-32">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">${stock.price?.toFixed(2)}</p>
                      <p className="text-xs flex items-center justify-end mt-1 text-rose-500">
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                        {Math.abs(stock.changesPercentage || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

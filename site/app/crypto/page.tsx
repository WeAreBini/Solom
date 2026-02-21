import { getCryptoQuotes } from "@/app/actions/fmp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, Bitcoin } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Crypto | Solom",
  description: "Top cryptocurrencies and market trends.",
};

export default async function CryptoPage() {
  const cryptoQuotes = await getCryptoQuotes();

  return (
    <div className="flex-1 space-y-6 p-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crypto</h2>
          <p className="text-muted-foreground">
            Real-time cryptocurrency prices and market trends.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cryptoQuotes.slice(0, 4).map((crypto: { symbol: string; name: string; price: number; changesPercentage: number }) => (
          <Card key={crypto.symbol} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {crypto.name} ({crypto.symbol.replace("USD", "")})
              </CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">
                ${crypto.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
              <p className={`text-xs flex items-center mt-1 ${crypto.changesPercentage >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {crypto.changesPercentage >= 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(crypto.changesPercentage || 0).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Top Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cryptoQuotes.map((crypto: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                <Link href={`/ticker/${crypto.symbol}`} key={crypto.symbol}>
                  <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {crypto.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{crypto.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">
                        ${crypto.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </p>
                      <p className={`text-sm flex items-center justify-end mt-1 ${crypto.changesPercentage >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {crypto.changesPercentage >= 0 ? (
                          <ArrowUpIcon className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(crypto.changesPercentage || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Total Market Cap</p>
                  <p className="text-sm text-muted-foreground">
                    Global cryptocurrency market cap
                  </p>
                </div>
                <div className="ml-auto font-medium tabular-nums">
                  $2.4T
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">24h Volume</p>
                  <p className="text-sm text-muted-foreground">
                    Total trading volume in 24h
                  </p>
                </div>
                <div className="ml-auto font-medium tabular-nums">
                  $84.2B
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">BTC Dominance</p>
                  <p className="text-sm text-muted-foreground">
                    Bitcoin market share
                  </p>
                </div>
                <div className="ml-auto font-medium tabular-nums">
                  52.4%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

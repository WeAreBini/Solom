import React, { Suspense } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bitcoin,
  BriefcaseBusiness,
  CalendarClock,
  Globe,
  Newspaper,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  getCryptoQuotes,
  getEarningsCalendar,
  getEconomicIndicator,
  getForm13F,
  getHistoricalPrices,
  getInsiderTrades,
  getMarketActives,
  getMarketGainers,
  getMarketLosers,
  getMarketNews,
  getQuote,
  getSectorPerformance,
} from "@/app/actions/fmp";
import { GainLossBadge } from "@/components/finance/GainLossBadge";
import { MarketIndicesStrip } from "@/components/finance/MarketIndicesStrip";
import { NewsCard } from "@/components/finance/NewsCard";
import { StockChart } from "@/components/finance/StockChart";
import { SectionCoverageGrid } from "@/components/overview/SectionCoverageGrid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { primarySections } from "@/lib/navigation";

/**
 * @ai-context Unified overview page for Solom's expanded market-intelligence coverage.
 * Uses existing market, macro, flows, crypto, and news data to expose the full product surface.
 * @ai-related app/actions/fmp.ts, components/overview/SectionCoverageGrid.tsx
 */

export const metadata = { title: "Overview" };

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

interface EarningsEvent {
  date: string;
  symbol: string;
  time: string;
}

interface MacroPoint {
  date: string;
  value: number;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function MarketList({
  title,
  icon: Icon,
  stocks,
}: {
  title: string;
  icon: React.ElementType;
  stocks: MarketMover[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        <h3>{title}</h3>
      </div>
      <div className="space-y-2">
        {stocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          stocks.map((stock) => (
            <Link
              key={stock.symbol}
              href={`/ticker/${stock.symbol}`}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{stock.symbol}</p>
                <p className="truncate text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${stock.price?.toFixed(2)}</p>
                <GainLossBadge value={stock.changesPercentage} isPercentage size="sm" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default async function Home() {
  const [
    actives,
    gainers,
    losers,
    spyHistory,
    spyQuote,
    sectorPerformance,
    cryptoQuotes,
    earningsCalendar,
    gdpSeries,
    inflationSeries,
    unemploymentSeries,
    marketNews,
    thirteenFHoldings,
    insiderTrades,
  ] = await Promise.all([
    getMarketActives().catch(() => []),
    getMarketGainers().catch(() => []),
    getMarketLosers().catch(() => []),
    getHistoricalPrices("SPY").catch(() => []),
    getQuote("SPY").catch(() => null),
    getSectorPerformance().catch(() => []),
    getCryptoQuotes().catch(() => []),
    getEarningsCalendar().catch(() => []),
    getEconomicIndicator("GDP").catch(() => []),
    getEconomicIndicator("inflationRate").catch(() => []),
    getEconomicIndicator("unemploymentRate").catch(() => []),
    getMarketNews(6).catch(() => []),
    getForm13F().catch(() => []),
    getInsiderTrades().catch(() => []),
  ]);

  const topActives = actives.slice(0, 5);
  const topGainers = gainers.slice(0, 5);
  const topLosers = losers.slice(0, 5);
  const topCrypto = cryptoQuotes.slice(0, 4) as MarketMover[];
  const upcomingEarnings = earningsCalendar.slice(0, 5) as EarningsEvent[];

  const parsedSectors = sectorPerformance.map(
    (sector: { sector: string; changesPercentage: string }) =>
      Number.parseFloat(sector.changesPercentage.replace("%", ""))
  );
  const advancingSectors = parsedSectors.filter((value: number) => value > 0).length;

  const macroCards = [
    {
      title: "GDP",
      description: "Nominal output",
      latest: gdpSeries[0] as MacroPoint | undefined,
      previous: gdpSeries[4] as MacroPoint | undefined,
      formatter: (value: number) => formatCompactCurrency(value * 1_000_000_000),
    },
    {
      title: "Inflation",
      description: "Consumer prices",
      latest: inflationSeries[0] as MacroPoint | undefined,
      previous: inflationSeries[12] as MacroPoint | undefined,
      formatter: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: "Unemployment",
      description: "Labor market slack",
      latest: unemploymentSeries[0] as MacroPoint | undefined,
      previous: unemploymentSeries[12] as MacroPoint | undefined,
      formatter: (value: number) => `${value.toFixed(2)}%`,
    },
  ];

  const overviewStats = [
    {
      label: "Routes surfaced",
      value: `${primarySections.reduce((count, section) => count + section.items.length, 0)}`,
      detail: "linked product views",
    },
    {
      label: "Advancing sectors",
      value: `${advancingSectors}/${parsedSectors.length || 0}`,
      detail: "current breadth",
    },
    {
      label: "Upcoming earnings",
      value: `${upcomingEarnings.length}`,
      detail: "near-term reports",
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Suspense fallback={<div className="h-10 border-b bg-surface/50" />}>
        <MarketIndicesStrip />
      </Suspense>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:p-8">
        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-8 overflow-hidden border-border/70 bg-card/90">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    Unified market intelligence
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Solom Overview
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                      Equities, macro, flows, digital assets, and portfolio tooling in one
                      finance-native shell.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {overviewStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                      >
                        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{stat.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/dashboard">
                      Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/trade">Launch Simulator</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 p-4 xl:grid-cols-[minmax(0,1.35fr)_340px]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Benchmark tape
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      S&amp;P 500 proxy
                    </h2>
                    {spyQuote ? (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-3xl font-bold tracking-tight">
                          ${spyQuote.price?.toFixed(2)}
                        </span>
                        <GainLossBadge
                          value={spyQuote.changesPercentage ?? 0}
                          isPercentage
                          size="md"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Benchmark pricing unavailable.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        Most active
                      </p>
                      <p className="mt-2 text-lg font-semibold">{topActives.length}</p>
                      <p className="text-xs text-muted-foreground">live names surfaced</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        13F snapshot
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {thirteenFHoldings.length || "--"}
                      </p>
                      <p className="text-xs text-muted-foreground">positions in filing view</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        Insider tape
                      </p>
                      <p className="mt-2 text-lg font-semibold">{insiderTrades.length || "--"}</p>
                      <p className="text-xs text-muted-foreground">recent disclosures loaded</p>
                    </div>
                  </div>
                </div>

                <div className="h-[360px] overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-3">
                  {spyHistory.length > 0 ? (
                    <StockChart
                      data={spyHistory.slice(0, 120).reverse()}
                      className="h-full w-full border-none bg-transparent dark:bg-transparent"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground">
                      Benchmark chart unavailable.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Product map
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Six-section coverage model
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The shell now mirrors the actual breadth of Solom across overview,
                    markets, macro, flows, digital assets, and portfolio tooling.
                  </p>
                </div>
                <SectionCoverageGrid variant="compact" />
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-4 flex flex-col gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-border/60 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Flows Radar
                </CardTitle>
                <CardDescription>
                  Institutional and insider activity attached to dedicated routes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <Link
                  href="/13f"
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-semibold">13F Holdings</p>
                    <p className="text-xs text-muted-foreground">
                      Berkshire filing with {thirteenFHoldings.length || 0} visible positions.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/insider-senate"
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                >
                  <div>
                    <p className="text-sm font-semibold">Insider &amp; Congress</p>
                    <p className="text-xs text-muted-foreground">
                      {insiderTrades.length || 0} recent transactions available right now.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="border-b border-border/60 bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock className="h-4 w-4" />
                  On Deck
                </CardTitle>
                <CardDescription>
                  Near-term catalysts and scheduled reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {upcomingEarnings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                    No near-term earnings loaded.
                  </div>
                ) : (
                  upcomingEarnings.map((event) => (
                    <Link
                      key={`${event.symbol}-${event.date}`}
                      href={`/ticker/${event.symbol}`}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                    >
                      <div>
                        <p className="font-mono text-sm font-semibold">{event.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date)} • {event.time || "TBD"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-5 glass-card">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Markets
              </CardTitle>
              <CardDescription>
                Movers, momentum, and active tape from the markets stack.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 md:grid-cols-3">
              <MarketList title="Top Gainers" icon={TrendingUp} stocks={topGainers} />
              <MarketList title="Top Losers" icon={TrendingDown} stocks={topLosers} />
              <MarketList title="Most Active" icon={Activity} stocks={topActives} />
            </CardContent>
          </Card>

          <Card className="xl:col-span-3 glass-card">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Macro Pulse
              </CardTitle>
              <CardDescription>
                High-level economic context without leaving the overview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {macroCards.map((item) => {
                const delta =
                  item.latest && item.previous
                    ? Number((item.latest.value - item.previous.value).toFixed(2))
                    : null;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      {delta !== null && (
                        <GainLossBadge
                          value={item.title === "Unemployment" || item.title === "Inflation" ? -delta : delta}
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {item.latest ? item.formatter(item.latest.value) : "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.latest ? `Latest release ${formatDate(item.latest.date)}` : "Series unavailable"}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 glass-card">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Digital Assets
              </CardTitle>
              <CardDescription>
                Crypto pricing exposed as a first-class section, not a hidden route.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {topCrypto.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                  Crypto coverage unavailable.
                </div>
              ) : (
                topCrypto.map((asset) => (
                  <Link
                    key={asset.symbol}
                    href={`/ticker/${asset.symbol}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                  >
                    <div>
                      <p className="text-sm font-semibold">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${asset.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </p>
                      <GainLossBadge value={asset.changesPercentage} isPercentage size="sm" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-4 glass-card">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <CardTitle>Section Coverage</CardTitle>
              <CardDescription>
                Major product pillars reorganized into one consistent model.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <SectionCoverageGrid showChildren className="md:grid-cols-1 xl:grid-cols-1" />
            </CardContent>
          </Card>

          <Card className="xl:col-span-8 glass-card">
            <CardHeader className="border-b border-border/60 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Market Headlines
              </CardTitle>
              <CardDescription>
                News and catalysts aligned with the new overview shell.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {marketNews.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No headlines available.
                </div>
              ) : (
                marketNews.map((article, index) => (
                  <NewsCard
                    key={`${article.url}-${index}`}
                    title={article.title}
                    source={article.site}
                    publishedDate={article.publishedDate}
                    url={article.url}
                    image={article.image}
                    symbol={article.symbol}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

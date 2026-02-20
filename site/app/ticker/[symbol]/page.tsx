/**
 * @ai-context Ticker Detail Page — comprehensive stock view with chart, stats, profile, ratings, news.
 * Server Component with Suspense streaming. Dynamic metadata for SEO.
 * @ai-related components/finance/TradingViewChart.tsx, components/finance/PriceDisplay.tsx
 * @ai-related components/finance/GainLossBadge.tsx, components/finance/NewsCard.tsx
 * @ai-related app/actions/fmp.ts
 */
import React, { Suspense } from 'react';
import { PriceDisplay } from '@/components/finance/PriceDisplay';
import { TradingViewChart } from '@/components/finance/TradingViewChart';
import { GainLossBadge } from '@/components/finance/GainLossBadge';
import { NewsCard } from '@/components/finance/NewsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  getQuote,
  getHistoricalPrices,
  getCompanyProfile,
  getAnalystRatings,
  getPriceTarget,
  getTickerNews,
} from '@/app/actions/fmp';
import { Building2, Globe, TrendingUp, Target, Newspaper } from 'lucide-react';

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return { title: symbol.toUpperCase() };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a large number into a human-readable string (T / B / M).
 * @ai-context Pure utility — no side effects.
 */
function formatLargeNumber(value: number | null | undefined): string {
  if (value == null || value === 0) return 'N/A';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

// ---------------------------------------------------------------------------
// Loading skeleton — shown inside <Suspense fallback={...}>
// ---------------------------------------------------------------------------

function TickerSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-12 w-36" />
      </div>
      <Skeleton className="w-full h-[400px] rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Reusable stat card with label + value. */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

/** Horizontal bar for analyst rating breakdowns. */
function AnalystBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground w-20">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-8 text-right">{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main data-fetching async component
// ---------------------------------------------------------------------------

/**
 * Fetches and renders all ticker data.
 * @ai-warning Core quote failure renders "Symbol not found". All other sections
 *             degrade gracefully via .catch().
 * @ai-mutates None — pure read / render.
 */
async function TickerContent({ symbol }: { symbol: string }) {
  // Fetch all data in parallel
  const [quote, historicalData, profile, ratings, priceTarget, news] = await Promise.all([
    getQuote(symbol).catch(() => null),
    getHistoricalPrices(symbol).catch(() => []),
    getCompanyProfile(symbol).catch(() => null),
    getAnalystRatings(symbol).catch(() => null),
    getPriceTarget(symbol).catch(() => null),
    getTickerNews(symbol, 6).catch(() => []),
  ]);

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6">
        <h1 className="text-2xl font-bold">Symbol not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find any data for &ldquo;{symbol}&rdquo;.
        </p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = (historicalData as any[]).map((h: any) => ({ time: h.date, value: h.close }));
  const companyName: string = quote.name || symbol;
  const currentPrice: number = quote.price ?? 0;
  const previousPrice: number = quote.previousClose ?? 0;

  const ratingsTotal = ratings
    ? (ratings.strongBuy ?? 0) + (ratings.buy ?? 0) + (ratings.hold ?? 0) + (ratings.sell ?? 0) + (ratings.strongSell ?? 0)
    : 0;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* ----------------------------------------------------------------- */}
      {/* Header — company name, symbol badge, price */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{companyName}</h1>
            {profile?.sector && (
              <Badge variant="secondary" className="text-xs">{profile.sector}</Badge>
            )}
          </div>
          <p className="text-muted-foreground font-mono text-lg">{symbol}</p>
        </div>
        <PriceDisplay
          price={currentPrice}
          previousPrice={previousPrice}
          className="items-end"
          priceClassName="text-4xl"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Chart */}
      {/* ----------------------------------------------------------------- */}
      <Card className="w-full h-[400px] p-4">
        <TradingViewChart data={chartData} type="line" />
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Key Statistics */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Key Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Market Cap" value={formatLargeNumber(quote.marketCap)} />
          <StatCard label="P/E Ratio" value={quote.pe != null ? (quote.pe as number).toFixed(2) : 'N/A'} />
          <StatCard label="EPS" value={quote.eps != null ? `$${(quote.eps as number).toFixed(2)}` : 'N/A'} />
          <StatCard label="Shares Out" value={formatLargeNumber(quote.sharesOutstanding)} />
          <StatCard label="Open" value={quote.open != null ? `$${(quote.open as number).toFixed(2)}` : 'N/A'} />
          <StatCard label="Prev Close" value={quote.previousClose != null ? `$${(quote.previousClose as number).toFixed(2)}` : 'N/A'} />
          <StatCard label="Day Range" value={`${quote.dayLow?.toFixed(2) ?? '—'} / ${quote.dayHigh?.toFixed(2) ?? '—'}`} />
          <StatCard label="52W Range" value={`${quote.yearLow?.toFixed(2) ?? '—'} / ${quote.yearHigh?.toFixed(2) ?? '—'}`} />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Main content: Profile + Ratings | News */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile + Ratings — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {profile.description}
                  </p>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {profile.ceo && (
                    <div>
                      <p className="text-muted-foreground">CEO</p>
                      <p className="font-medium">{profile.ceo}</p>
                    </div>
                  )}
                  {profile.industry && (
                    <div>
                      <p className="text-muted-foreground">Industry</p>
                      <p className="font-medium">{profile.industry}</p>
                    </div>
                  )}
                  {profile.fullTimeEmployees && (
                    <div>
                      <p className="text-muted-foreground">Employees</p>
                      <p className="font-medium">{Number(profile.fullTimeEmployees).toLocaleString()}</p>
                    </div>
                  )}
                  {profile.website && (
                    <div>
                      <p className="text-muted-foreground">Website</p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyst Ratings + Price Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ratings && ratingsTotal > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analyst Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnalystBar label="Strong Buy" count={ratings.strongBuy} total={ratingsTotal} color="bg-positive" />
                  <AnalystBar label="Buy" count={ratings.buy} total={ratingsTotal} color="bg-positive/70" />
                  <AnalystBar label="Hold" count={ratings.hold} total={ratingsTotal} color="bg-chart-4" />
                  <AnalystBar label="Sell" count={ratings.sell} total={ratingsTotal} color="bg-negative/70" />
                  <AnalystBar label="Strong Sell" count={ratings.strongSell} total={ratingsTotal} color="bg-negative" />
                </CardContent>
              </Card>
            )}

            {priceTarget && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Price Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Consensus</p>
                      <p className="text-2xl font-bold tabular-nums">${priceTarget.targetConsensus.toFixed(2)}</p>
                      {currentPrice > 0 && (
                        <GainLossBadge
                          value={((priceTarget.targetConsensus - currentPrice) / currentPrice) * 100}
                          isPercentage
                          size="sm"
                        />
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-muted-foreground">Low</p>
                        <p className="font-bold tabular-nums">${priceTarget.targetLow.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Median</p>
                        <p className="font-bold tabular-nums">${priceTarget.targetMedian.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">High</p>
                        <p className="font-bold tabular-nums">${priceTarget.targetHigh.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trading Info */}
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Exchange</dt>
                  <dd className="font-semibold">{quote.exchange || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Volume</dt>
                  <dd className="font-semibold tabular-nums">{quote.volume?.toLocaleString() ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg Volume</dt>
                  <dd className="font-semibold tabular-nums">{quote.avgVolume?.toLocaleString() ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Change</dt>
                  <dd>
                    <GainLossBadge value={quote.change ?? 0} size="sm" />
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right column: News — 1/3 width */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Latest News
          </h2>
          {news && news.length > 0 ? (
            <Card>
              <CardContent className="p-0 divide-y">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {news.map((article: any, i: number) => (
                  <NewsCard
                    key={i}
                    title={article.title}
                    source={article.site}
                    publishedDate={article.publishedDate}
                    url={article.url}
                    image={article.image}
                    symbol={symbol}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No recent news for {symbol}.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page entry point — wraps TickerContent in Suspense for streaming
// ---------------------------------------------------------------------------

export default async function TickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  return (
    <Suspense fallback={<TickerSkeleton />}>
      <TickerContent symbol={upperSymbol} />
    </Suspense>
  );
}


/**
 * @ai-context Earnings Calendar page — async Server Component.
 * Fetches upcoming earnings reports for the next 30 days from FMP.
 * Groups results by date and renders a Card per date with a table of reports.
 * EPS beat/miss badge: green if eps > epsEstimated, red if eps < epsEstimated.
 * @ai-related app/actions/fmp.ts, components/ui/card.tsx, components/ui/badge.tsx
 * @ai-warning eps and epsEstimated may be null for future (unconfirmed) reports.
 */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEarningsCalendar } from "@/app/actions/fmp";

export const metadata = { title: 'Earnings Calendar' };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EarningsItem {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  time: string;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding: string;
  updatedFromDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO date string (YYYY-MM-DD) as "Monday, Feb 24".
 * Uses UTC to avoid timezone-offset day shifting.
 */
function formatDateHeading(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Formats a number as a compact currency string (e.g. $1.23B, $456M).
 */
function fmtRevenue(n: number | null): string {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

/**
 * Formats EPS with $ sign and 2 decimal places, or "—" for null.
 */
function fmtEps(n: number | null): string {
  if (n === null || n === undefined) return '—';
  return `$${n.toFixed(2)}`;
}

/**
 * Maps FMP time codes to human-readable strings.
 * @param time "bmo" = Before Market Open, "amc" = After Market Close
 */
function formatTime(time: string): string {
  if (!time) return 'TBD';
  const t = time.toLowerCase();
  if (t === 'bmo') return 'Before Market';
  if (t === 'amc') return 'After Market';
  return time;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EarningsPage() {
  // ─── Fetch with isolated error boundary ──────────────────────────────────
  const grouped: Record<string, EarningsItem[]> = {};
  let fetchError: string | null = null;

  try {
    const items = await getEarningsCalendar();

    // Group by date key (YYYY-MM-DD), preserving chronological order
    for (const item of items) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
  }

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Earnings Calendar</h1>
        <p className="text-muted-foreground">
          Upcoming earnings reports for the next 30 days.
        </p>
      </div>

      {/* ─── Error state ─────────────────────────────────────────────────── */}
      {fetchError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load earnings calendar: {fetchError}
        </div>
      )}

      {/* ─── Empty state ─────────────────────────────────────────────────── */}
      {!fetchError && sortedDates.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">
              No earnings events found for the next 30 days.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Date cards ──────────────────────────────────────────────────── */}
      {sortedDates.map((date) => {
        const events = grouped[date];
        return (
          <Card key={date}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {formatDateHeading(date)}
              </CardTitle>
              <CardDescription>
                {events.length} {events.length === 1 ? 'company' : 'companies'} reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Symbol</th>
                    <th className="px-4 py-3 text-right font-medium">EPS Est.</th>
                    <th className="px-4 py-3 text-right font-medium">EPS Actual</th>
                    <th className="px-4 py-3 text-right font-medium">Rev. Est.</th>
                    <th className="px-4 py-3 text-right font-medium">Rev. Actual</th>
                    <th className="px-4 py-3 text-center font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.map((event, i) => {
                    // Determine beat/miss only when both values are non-null
                    const hasBeatMiss =
                      event.eps !== null && event.epsEstimated !== null;
                    const beat = hasBeatMiss && event.eps! > event.epsEstimated!;
                    const miss = hasBeatMiss && event.eps! < event.epsEstimated!;

                    const hasRevBeatMiss =
                      event.revenue !== null && event.revenueEstimated !== null;
                    const revBeat =
                      hasRevBeatMiss && event.revenue! > event.revenueEstimated!;
                    const revMiss =
                      hasRevBeatMiss && event.revenue! < event.revenueEstimated!;

                    return (
                      <tr
                        key={`${event.symbol}-${i}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Symbol */}
                        <td className="px-4 py-3">
                          <Link href={`/ticker/${event.symbol}`} className="font-mono font-semibold text-primary hover:underline">{event.symbol}</Link>
                        </td>

                        {/* EPS Estimated */}
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {fmtEps(event.epsEstimated)}
                        </td>

                        {/* EPS Actual with beat/miss badge */}
                        <td className="px-4 py-3 text-right">
                          {event.eps !== null ? (
                            <span className="flex items-center justify-end gap-2">
                              <span className="tabular-nums">{fmtEps(event.eps)}</span>
                              {hasBeatMiss && (
                                <Badge
                                  variant={beat ? 'default' : 'destructive'}
                                  className={
                                    beat
                                      ? 'bg-positive/15 text-positive border-positive/30 text-xs'
                                      : miss
                                      ? 'bg-negative/15 text-negative border-negative/30 text-xs'
                                      : 'bg-muted text-muted-foreground text-xs'
                                  }
                                >
                                  {beat ? 'Beat' : miss ? 'Miss' : 'Met'}
                                </Badge>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Revenue Estimated */}
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {fmtRevenue(event.revenueEstimated)}
                        </td>

                        {/* Revenue Actual with beat/miss badge */}
                        <td className="px-4 py-3 text-right">
                          {event.revenue !== null ? (
                            <span className="flex items-center justify-end gap-2">
                              <span className="tabular-nums">{fmtRevenue(event.revenue)}</span>
                              {hasRevBeatMiss && (
                                <Badge
                                  variant={revBeat ? 'default' : 'destructive'}
                                  className={
                                    revBeat
                                      ? 'bg-positive/15 text-positive border-positive/30 text-xs'
                                      : revMiss
                                      ? 'bg-negative/15 text-negative border-negative/30 text-xs'
                                      : 'bg-muted text-muted-foreground text-xs'
                                  }
                                >
                                  {revBeat ? 'Beat' : revMiss ? 'Miss' : 'Met'}
                                </Badge>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Reporting time */}
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(event.time)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

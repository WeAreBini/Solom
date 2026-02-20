/**
 * @ai-context Economic Indicators page — async Server Component.
 * Fetches 6 macro indicators in parallel via getEconomicIndicator() from /v4/economic.
 * YoY comparison: quarterly indicators (GDP, realGDP) use index 4; monthly use index 12.
 * Badge sign is flipped for indicators where lower = better (unemployment, inflation, etc.)
 * @ai-related app/actions/fmp.ts, components/finance/GainLossBadge.tsx
 */
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata = { title: "Economic Indicators" };
import { GainLossBadge } from "@/components/finance/GainLossBadge";
import { getEconomicIndicator } from "@/app/actions/fmp";
import {
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Landmark,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndicatorConfig {
  id: string;
  label: string;
  description: string;
  /** API name passed to getEconomicIndicator */
  apiName: string;
  /** Index of the data point ~1 year ago (4 = quarterly, 12 = monthly) */
  yoyIndex: number;
  /** Formatter for the raw numeric value */
  format: (v: number) => string;
  /** true = rising is good (GDP), false = falling is good (unemployment) */
  isGoodWhenHigher: boolean;
  icon: React.ElementType;
}

interface RenderedIndicator {
  id: string;
  label: string;
  description: string;
  latestFormatted: string;
  /** Raw YoY delta (positive means value rose) */
  yoyChangeRaw: number;
  /** Sign-adjusted for GainLossBadge: positive always means "good" */
  yoyChangeBadge: number;
  asOf: string;
  icon: React.ElementType;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const INDICATORS: IndicatorConfig[] = [
  {
    id: "gdp",
    label: "GDP",
    description: "Nominal Gross Domestic Product",
    apiName: "GDP",
    yoyIndex: 4,
    format: (v) => `$${(v / 1000).toFixed(2)}T`,
    isGoodWhenHigher: true,
    icon: DollarSign,
  },
  {
    id: "realGdp",
    label: "Real GDP",
    description: "Inflation-adjusted GDP (annualised)",
    apiName: "realGDP",
    yoyIndex: 4,
    format: (v) => `$${(v / 1000).toFixed(2)}T`,
    isGoodWhenHigher: true,
    icon: TrendingUp,
  },
  {
    id: "cpi",
    label: "CPI",
    description: "Consumer Price Index",
    apiName: "CPI",
    yoyIndex: 12,
    format: (v) => v.toFixed(2),
    isGoodWhenHigher: false,
    icon: BarChart3,
  },
  {
    id: "inflation",
    label: "Inflation Rate",
    description: "Year-over-year change in consumer prices",
    apiName: "inflationRate",
    yoyIndex: 12,
    format: (v) => `${v.toFixed(2)}%`,
    isGoodWhenHigher: false,
    icon: Activity,
  },
  {
    id: "unemployment",
    label: "Unemployment Rate",
    description: "% of labour force unemployed",
    apiName: "unemploymentRate",
    yoyIndex: 12,
    format: (v) => `${v.toFixed(2)}%`,
    isGoodWhenHigher: false,
    icon: Users,
  },
  {
    id: "fed",
    label: "Federal Funds Rate",
    description: "Target overnight rate set by the Fed",
    apiName: "federalFunds",
    yoyIndex: 12,
    format: (v) => `${v.toFixed(2)}%`,
    isGoodWhenHigher: false,
    icon: Landmark,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

async function fetchRenderedIndicator(
  cfg: IndicatorConfig
): Promise<RenderedIndicator | null> {
  try {
    const data = await getEconomicIndicator(cfg.apiName);
    if (!data || data.length < 2) return null;

    const latest = data[0];
    // Clamp yoyIndex to the last available entry if series is short
    const yoyEntry = data[Math.min(cfg.yoyIndex, data.length - 1)];
    const yoyChangeRaw = Number((latest.value - yoyEntry.value).toFixed(4));

    return {
      id: cfg.id,
      label: cfg.label,
      description: cfg.description,
      latestFormatted: cfg.format(latest.value),
      yoyChangeRaw,
      // @ai-context Flip sign so GainLossBadge colours green = "good direction"
      yoyChangeBadge: cfg.isGoodWhenHigher ? yoyChangeRaw : -yoyChangeRaw,
      asOf: formatDate(latest.date),
      icon: cfg.icon,
    };
  } catch (err) {
    console.error(`[Economic] Failed to fetch ${cfg.apiName}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EconomicPage() {
  const results = await Promise.all(INDICATORS.map(fetchRenderedIndicator));
  const indicators = results.filter(
    (ind): ind is RenderedIndicator => ind !== null
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Economic Indicators</h1>
        <p className="text-muted-foreground">
          Key macro-economic data points that influence market behaviour.
        </p>
      </div>

      {/* Error / empty state */}
      {indicators.length === 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load economic indicators. Please try again later.
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          return (
            <Card key={ind.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {ind.label}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {ind.description}
                  </CardDescription>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {/* Latest value */}
                <div className="text-2xl font-bold tracking-tight">
                  {ind.latestFormatted}
                </div>

                {/* YoY change: badge (green = good) + raw delta text */}
                <div className="flex items-center justify-between">
                  <GainLossBadge value={ind.yoyChangeBadge} isPercentage={false} />
                  <span className="text-xs text-muted-foreground">
                    YoY&#8239;&#916;&#8239;{ind.yoyChangeRaw >= 0 ? "+" : ""}{ind.yoyChangeRaw.toFixed(2)}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                  <span>As of {ind.asOf}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

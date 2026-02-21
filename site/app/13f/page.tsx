/**
 * @ai-context 13F Institutional Holdings page — async Server Component.
 * Fetches Berkshire Hathaway (CIK 0001067983) 13F data from FMP.
 * Delegates filtering/search to ThirteenFFilter client component.
 * FMP returns `value` in thousands of USD; multiply by 1000 for real dollar figures.
 * @ai-related app/actions/fmp.ts, components/13f/thirteen-f-filter.tsx
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getForm13F } from "@/app/actions/fmp";

export const metadata = { title: '13F Institutional Holdings' };
import {
  ThirteenFFilter,
  type ThirteenFHolding,
} from "@/components/13f/thirteen-f-filter";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_CIK = "0001067983"; // Berkshire Hathaway
const DEFAULT_NAME = "Berkshire Hathaway Inc.";

function formatTotal(dollars: number): string {
  if (dollars >= 1_000_000_000_000) return `$${(dollars / 1_000_000_000_000).toFixed(2)}T`;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(2)}B`;
  return `$${(dollars / 1_000_000).toFixed(2)}M`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ThirteenFPage() {
  let holdings: ThirteenFHolding[] = [];
  let totalDollars = 0;
  let error: string | null = null;
  let filingDate = "";

  try {
    const raw = await getForm13F(DEFAULT_CIK);

    if (raw.length > 0) {
      filingDate = raw[0].fillingDate ?? raw[0].date ?? "";
    }

    // FMP value field is in thousands of USD
    totalDollars = raw.reduce((sum, r) => sum + (r.value ?? 0) * 1000, 0);

    holdings = raw
      .filter((r) => r.tickercusip && r.nameOfIssuer)
      .map((r) => ({
        tickercusip: r.tickercusip,
        nameOfIssuer: r.nameOfIssuer,
        shares: r.shares ?? 0,
        value: r.value ?? 0, // still in thousands here; ThirteenFFilter multiplies
        portfolioPct:
          totalDollars > 0 ? ((r.value ?? 0) * 1000 * 100) / totalDollars : 0,
      }))
      // Sort largest holding first
      .sort((a, b) => b.value - a.value);
  } catch (err) {
    console.error("[13F] Failed to fetch 13F data:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">13F Institutional Holdings</h1>
        <p className="text-muted-foreground">
          Portfolio snapshot for {DEFAULT_NAME}{filingDate ? ` — filed ${filingDate}` : ""}.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load 13F data: {error}
        </div>
      )}

      {/* Holdings card */}
      {!error && (
        <Card className="glass-card">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle>Portfolio Holdings</CardTitle>
            <CardDescription>
              {holdings.length} positions &bull; Total AUM:{" "}
              <span className="font-semibold text-foreground">
                {formatTotal(totalDollars)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No holdings data available.
              </p>
            ) : (
              <ThirteenFFilter
                holdings={holdings}
                totalFormatted={formatTotal(totalDollars)}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

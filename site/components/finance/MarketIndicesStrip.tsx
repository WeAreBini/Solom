/**
 * @ai-context Horizontal scrolling strip showing major market indices.
 * Fetches live quotes for SPY, QQQ, DIA, IWM, BTC-USD from FMP.
 * Server Component — renders above the main content.
 * @ai-related app/actions/fmp.ts
 */
import { getQuotes } from '@/app/actions/fmp';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const INDICES = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'NASDAQ' },
  { symbol: 'DIA', label: 'DOW' },
  { symbol: 'IWM', label: 'Russell 2K' },
  { symbol: 'BTCUSD', label: 'Bitcoin' },
];

export async function MarketIndicesStrip() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let quotes: Record<string, any>[] = [];

  try {
    quotes = await getQuotes(INDICES.map((i) => i.symbol));
  } catch {
    // Silently fail — strip just won't show
    return null;
  }

  if (!quotes.length) return null;

  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b bg-surface/50 px-4 py-2 text-xs no-scrollbar">
      {INDICES.map(({ symbol, label }) => {
        const q = quoteMap.get(symbol);
        if (!q) return null;

        const price = q.price ?? 0;
        const changePct = q.changesPercentage ?? 0;
        const isPositive = changePct > 0;
        const isNegative = changePct < 0;

        return (
          <div key={symbol} className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-foreground">{label}</span>
            <span className="tabular-nums font-medium">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center gap-0.5 font-medium ${
                isPositive
                  ? 'text-glow-positive'
                  : isNegative
                  ? 'text-glow-negative'
                  : 'text-muted-foreground'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {isPositive ? '+' : ''}
              {changePct.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

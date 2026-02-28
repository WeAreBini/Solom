'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  StockChart, 
  IndicatorControls, 
  DEFAULT_INDICATOR_SETTINGS,
  type IndicatorSettings,
  type IndicatorData
} from '@/components/charts';
import { 
  Sparkles, 
  ArrowLeft,
  TrendingUp,
  Activity,
  RefreshCcw
} from 'lucide-react';
import { useHistoricalData } from '@/lib/api';

// Available stocks for demo
const DEMO_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];

export default function StockChartDemoPage() {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [period, setPeriod] = useState<string>('1Y');
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(DEFAULT_INDICATOR_SETTINGS);

  // Fetch historical data with indicators
  const { data, isLoading, error, refetch } = useHistoricalData(symbol, period as '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y');

  // Build indicator data from API response
  const indicatorData: IndicatorData | undefined = data?.indicators ? {
    sma: data.indicators.sma,
    ema: data.indicators.ema,
    rsi: data.indicators.rsi,
    macd: data.indicators.macd,
    volume: data.indicators.volume,
  } : undefined;

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard/finance" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">Solom</span>
            <Badge variant="secondary" className="ml-2">Stock Charts</Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/finance">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Technical Indicators Demo</h1>
          <p className="mt-2 text-muted-foreground">
            Interactive stock charts with SMA, EMA, RSI, and MACD indicators
          </p>
        </div>

        {/* Stock selector */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Select Stock:</span>
          <div className="flex flex-wrap gap-2">
            {DEMO_STOCKS.map(stock => (
              <Button
                key={stock}
                variant={symbol === stock ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSymbol(stock)}
              >
                {stock}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main chart area */}
          <div className="lg:col-span-3 space-y-6">
            <StockChart
              symbol={symbol}
              data={data?.candlestick || []}
              indicators={indicatorData}
              isLoading={isLoading}
              error={error?.message || null}
              showVolume={true}
              showSMA={indicatorSettings.sma.enabled}
              showEMA={indicatorSettings.ema.enabled}
              showRSI={indicatorSettings.rsi.enabled}
              showMACD={indicatorSettings.macd.enabled}
              smaPeriod={indicatorSettings.sma.period}
              emaPeriod={indicatorSettings.ema.period}
              rsiPeriod={indicatorSettings.rsi.period}
              onRefresh={handleRefresh}
              onPeriodChange={handlePeriodChange}
              selectedPeriod={period}
            />

            {/* Quick stats */}
            {data?.candlestick && data.candlestick.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Latest Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${data.candlestick[data.candlestick.length - 1]?.close.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.candlestick[data.candlestick.length - 1]?.date}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4" />
                      Day Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      ${data.candlestick[data.candlestick.length - 1]?.low.toFixed(2)} - ${data.candlestick[data.candlestick.length - 1]?.high.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <RefreshCcw className="h-4 w-4" />
                      Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {(data.candlestick[data.candlestick.length - 1]?.volume / 1000000).toFixed(2)}M
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Data Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{data.candlestick.length}</p>
                    <p className="text-sm text-muted-foreground">{period} period</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Indicator explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Technical Indicators Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-600">SMA - Simple Moving Average</h4>
                    <p className="text-sm text-muted-foreground">
                      Average closing price over N periods. Useful for identifying trends and support/resistance levels.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-600">EMA - Exponential Moving Average</h4>
                    <p className="text-sm text-muted-foreground">
                      Weighted average giving more importance to recent prices. Reacts faster to price changes than SMA.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-600">RSI - Relative Strength Index</h4>
                    <p className="text-sm text-muted-foreground">
                      Momentum oscillator from 0-100. Values above 70 suggest overbought, below 30 oversold.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">MACD</h4>
                    <p className="text-sm text-muted-foreground">
                      Momentum indicator showing relationship between two EMAs. Crossovers of MACD and signal line can indicate trend changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indicator controls sidebar */}
          <div className="lg:col-span-1">
            <IndicatorControls
              settings={indicatorSettings}
              onChange={setIndicatorSettings}
            />
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Solom. Stock data is simulated for demonstration purposes.</p>
        </div>
      </footer>
    </div>
  );
}
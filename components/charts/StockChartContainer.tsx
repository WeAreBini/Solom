'use client';

import { useState, useMemo, useCallback } from 'react';
import { StockChart, IndicatorControls, DEFAULT_INDICATOR_SETTINGS } from '@/components/charts';
import type { IndicatorSettings, ChartType } from '@/components/charts';
import type { HistoricalCandle, IndicatorData } from '@/components/charts';
import { useHistoricalData } from '@/lib/api';
import { useRealTimePrice } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export interface StockChartContainerProps {
  symbol: string;
  className?: string;
  enableRealtime?: boolean;
  showIndicatorControls?: boolean;
  defaultChartType?: ChartType;
  defaultPeriod?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';
  height?: number;
}

export function StockChartContainer({
  symbol,
  className,
  enableRealtime = true,
  showIndicatorControls = true,
  defaultChartType = 'candlestick',
  defaultPeriod = '1Y',
  height = 400,
}: StockChartContainerProps) {
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y'>(defaultPeriod);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(DEFAULT_INDICATOR_SETTINGS);

  // Build indicator list for API request
  const activeIndicators = useMemo(() => {
    const indicators: string[] = ['volume'];
    if (indicatorSettings.sma.enabled) {
      indicators.push('sma');
    }
    if (indicatorSettings.ema.enabled) {
      indicators.push('ema');
    }
    if (indicatorSettings.rsi.enabled) {
      indicators.push('rsi');
    }
    if (indicatorSettings.macd.enabled) {
      indicators.push('macd');
    }
    return indicators;
  }, [indicatorSettings]);

  // Fetch historical data with indicators
  const {
    data: chartData,
    isLoading,
    error,
    refetch,
  } = useHistoricalData(symbol, period, {
    indicators: activeIndicators,
    smaPeriod: indicatorSettings.sma.period,
    emaPeriod: indicatorSettings.ema.period,
    rsiPeriod: indicatorSettings.rsi.period,
    macdFast: indicatorSettings.macd.fastPeriod,
    macdSlow: indicatorSettings.macd.slowPeriod,
    macdSignal: indicatorSettings.macd.signalPeriod,
  });

  // Real-time price updates
  const { price: realtimePrice, isWebSocket } = useRealTimePrice(symbol, {
    enabled: enableRealtime,
    pollingInterval: 10000,
  });

  // Transform data for StockChart component
  const candlestickData = useMemo((): HistoricalCandle[] => {
    if (!chartData?.candlestick) return [];
    return chartData.candlestick.map((c: { date: string; open: number; high: number; low: number; close: number; volume: number }) => ({
      date: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));
  }, [chartData]);

  const indicatorData = useMemo((): IndicatorData => {
    if (!chartData?.indicators) {
      return {
        sma: [],
        ema: [],
        rsi: [],
        macd: [],
        volume: [],
      };
    }
    return {
      sma: chartData.indicators.sma,
      ema: chartData.indicators.ema,
      rsi: chartData.indicators.rsi,
      macd: chartData.indicators.macd,
      volume: chartData.indicators.volume,
    };
  }, [chartData]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod as typeof period);
  }, []);

  const handleChartTypeChange = useCallback((newType: ChartType) => {
    setChartType(newType);
  }, []);

  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load chart data' : null;

  // Prepare real-time price data for the chart
  const realtimePriceData = realtimePrice && enableRealtime
    ? {
        price: realtimePrice.price,
        timestamp: realtimePrice.timestamp,
      }
    : null;

  return (
    <div className={className}>
      {/* Connection status badge */}
      {enableRealtime && (
        <div className="mb-2 flex items-center justify-end">
          <Badge
            variant={isWebSocket ? 'success' : 'secondary'}
            className="flex items-center gap-1 text-xs"
          >
            {isWebSocket ? (
              <>
                <Wifi className="h-3 w-3" />
                Real-time
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Polling
              </>
            )}
          </Badge>
        </div>
      )}

      <StockChart
        symbol={symbol}
        data={candlestickData}
        indicators={indicatorData}
        isLoading={isLoading}
        error={errorMessage}
        showVolume={true}
        showSMA={indicatorSettings.sma.enabled}
        showEMA={indicatorSettings.ema.enabled}
        showRSI={indicatorSettings.rsi.enabled}
        showMACD={indicatorSettings.macd.enabled}
        smaPeriod={indicatorSettings.sma.period}
        emaPeriod={indicatorSettings.ema.period}
        rsiPeriod={indicatorSettings.rsi.period}
        chartType={chartType}
        onRefresh={handleRefresh}
        onPeriodChange={handlePeriodChange}
        onChartTypeChange={handleChartTypeChange}
        selectedPeriod={period}
        realtimePrice={realtimePriceData}
        height={height}
      />

      {showIndicatorControls && (
        <IndicatorControls
          settings={indicatorSettings}
          onChange={setIndicatorSettings}
        />
      )}
    </div>
  );
}

export default StockChartContainer;
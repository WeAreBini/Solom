'use client';

import { useState, useMemo, useCallback } from 'react';
import { StockChart, IndicatorControls, DEFAULT_INDICATOR_SETTINGS } from '@/components/charts';
import type { IndicatorSettings } from '@/components/charts';
import type { HistoricalCandle, IndicatorData } from '@/components/charts';
import { useHistoricalData } from '@/lib/api';

export interface StockChartContainerProps {
  symbol: string;
  className?: string;
}

export function StockChartContainer({ symbol, className }: StockChartContainerProps) {
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y'>('1Y');
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
    refetch 
  } = useHistoricalData(symbol, period, {
    indicators: activeIndicators,
    smaPeriod: indicatorSettings.sma.period,
    emaPeriod: indicatorSettings.ema.period,
    rsiPeriod: indicatorSettings.rsi.period,
    macdFast: indicatorSettings.macd.fastPeriod,
    macdSlow: indicatorSettings.macd.slowPeriod,
    macdSignal: indicatorSettings.macd.signalPeriod,
  });

  // Transform data for StockChart component
  const candlestickData = useMemo((): HistoricalCandle[] => {
    if (!chartData?.candlestick) return [];
    return chartData.candlestick.map(c => ({
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

  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load chart data' : null;

  return (
    <div className={className}>
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
        onRefresh={handleRefresh}
        onPeriodChange={handlePeriodChange}
        selectedPeriod={period}
      />
      <IndicatorControls
        settings={indicatorSettings}
        onChange={setIndicatorSettings}
      />
    </div>
  );
}

export default StockChartContainer;
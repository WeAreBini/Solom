'use client';

import { useEffect, useRef, useCallback } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  ColorType,
  CrosshairMode,
  Time,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  AreaSeries,
  AreaData
} from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCcw
} from 'lucide-react';

// Types
export interface HistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandData {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

export interface IndicatorData {
  sma?: { time: string; value: number }[];
  ema?: { time: string; value: number }[];
  rsi?: { time: string; value: number }[];
  macd?: { time: string; macd: number; signal: number; histogram: number }[];
  bollingerBands?: BollingerBandData[];
  volume?: { time: string; value: number }[];
}

export interface StockChartProps {
  symbol: string;
  data: HistoricalCandle[];
  indicators?: IndicatorData;
  isLoading?: boolean;
  error?: string | null;
  showVolume?: boolean;
  showSMA?: boolean;
  showEMA?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  showBollingerBands?: boolean;
  smaPeriod?: number;
  emaPeriod?: number;
  rsiPeriod?: number;
  bollingerPeriod?: number;
  bollingerStdDev?: number;
  onRefresh?: () => void;
  onPeriodChange?: (period: string) => void;
  selectedPeriod?: string;
}

// Color scheme for indicators
const COLORS = {
  up: '#22c55e',
  down: '#ef4444',
  sma: '#3b82f6',
  ema: '#8b5cf6',
  rsi: '#f59e0b',
  macdLine: '#3b82f6',
  macdSignal: '#ef4444',
  macdHistogram: '#22c55e',
  bollingerUpper: '#3b82f6',
  bollingerMiddle: '#6b7280',
  bollingerLower: '#3b82f6',
  bollingerFill: 'rgba(59, 130, 246, 0.1)',
  volume: '#6b7280',
  background: '#ffffff',
  grid: '#e5e7eb',
  text: '#374151',
};

const PERIODS = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
];

export function StockChart({
  symbol,
  data,
  indicators = {},
  isLoading = false,
  error = null,
  showVolume = true,
  showSMA = false,
  showEMA = false,
  showRSI = false,
  showMACD = false,
  showBollingerBands = false,
  smaPeriod = 20,
  emaPeriod = 20,
  rsiPeriod = 14,
  bollingerPeriod = 20,
  bollingerStdDev = 2,
  onRefresh,
  onPeriodChange,
  selectedPeriod = '1Y',
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const macdChartContainerRef = useRef<HTMLDivElement>(null);
  
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick', Time> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram', Time> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const macdLineRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<'Line', Time> | null>(null);
  const macdHistogramRef = useRef<ISeriesApi<'Histogram', Time> | null>(null);

  // Convert data to lightweight-charts format
  const convertToCandlestickData = useCallback((candles: HistoricalCandle[]): CandlestickData<Time>[] => {
    return candles.map(c => ({
      time: c.date as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
  }, []);

  const convertToVolumeData = useCallback((candles: HistoricalCandle[]): HistogramData<Time>[] => {
    return candles.map(c => ({
      time: c.date as Time,
      value: c.volume,
      color: c.close >= c.open ? COLORS.up : COLORS.down,
    }));
  }, []);

  const convertToLineData = useCallback((points: { time: string; value: number }[]): LineData<Time>[] => {
    return points.map(p => ({
      time: p.time as Time,
      value: p.value,
    }));
  }, []);

  // Initialize main chart
  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.background },
        textColor: COLORS.text,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: COLORS.grid,
      },
      timeScale: {
        borderColor: COLORS.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: showRSI || showMACD ? 280 : 400,
    });

    chartRef.current = chart;

    // Create candlestick series using v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.up,
      downColor: COLORS.down,
      borderUpColor: COLORS.up,
      borderDownColor: COLORS.down,
      wickUpColor: COLORS.up,
      wickDownColor: COLORS.down,
    });
    candlestickSeriesRef.current = candlestickSeries;
    candlestickSeries.setData(convertToCandlestickData(data));

    // Add volume if enabled
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: COLORS.volume,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
      volumeSeries.setData(convertToVolumeData(data));
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, showVolume, showRSI, showMACD, convertToCandlestickData, convertToVolumeData]);

  // Handle SMA indicator
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    if (showSMA && indicators.sma?.length) {
      if (!smaSeriesRef.current) {
        const smaSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.sma,
          lineWidth: 2,
          title: `SMA(${smaPeriod})`,
        });
        smaSeriesRef.current = smaSeries;
      }
      smaSeriesRef.current.setData(convertToLineData(indicators.sma));
    } else if (!showSMA && smaSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(smaSeriesRef.current);
      } catch (e) {
        // Series may have been removed already
      }
      smaSeriesRef.current = null;
    }
  }, [showSMA, indicators.sma, smaPeriod, convertToLineData]);

  // Handle EMA indicator
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    if (showEMA && indicators.ema?.length) {
      if (!emaSeriesRef.current) {
        const emaSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.ema,
          lineWidth: 2,
          title: `EMA(${emaPeriod})`,
        });
        emaSeriesRef.current = emaSeries;
      }
      emaSeriesRef.current.setData(convertToLineData(indicators.ema));
    } else if (!showEMA && emaSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(emaSeriesRef.current);
      } catch (e) {
        // Series may have been removed already
      }
      emaSeriesRef.current = null;
    }
  }, [showEMA, indicators.ema, emaPeriod, convertToLineData]);

  // Initialize RSI sub-chart
  useEffect(() => {
    if (!rsiChartContainerRef.current || !showRSI || !indicators.rsi?.length) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
      return;
    }

    // Clean up existing chart
    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current = null;
    }

    const rsiChart = createChart(rsiChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.background },
        textColor: COLORS.text,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: COLORS.grid,
      },
      timeScale: {
        borderColor: COLORS.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      width: rsiChartContainerRef.current.clientWidth,
      height: 100,
    });

    rsiChartRef.current = rsiChart;

    // Add RSI line
    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: COLORS.rsi,
      lineWidth: 2,
      title: `RSI(${rsiPeriod})`,
    });
    rsiSeriesRef.current = rsiSeries;
    rsiSeries.setData(convertToLineData(indicators.rsi));

    // Fit content
    rsiChart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (rsiChartContainerRef.current) {
        rsiChart.applyOptions({ width: rsiChartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      rsiChart.remove();
      rsiChartRef.current = null;
    };
  }, [showRSI, indicators.rsi, rsiPeriod, convertToLineData]);

  // Initialize MACD sub-chart
  useEffect(() => {
    if (!macdChartContainerRef.current || !showMACD || !indicators.macd?.length) {
      if (macdChartRef.current) {
        macdChartRef.current.remove();
        macdChartRef.current = null;
      }
      return;
    }

    // Clean up existing chart
    if (macdChartRef.current) {
      macdChartRef.current.remove();
      macdChartRef.current = null;
    }

    const macdChart = createChart(macdChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.background },
        textColor: COLORS.text,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: COLORS.grid,
      },
      timeScale: {
        borderColor: COLORS.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      width: macdChartContainerRef.current.clientWidth,
      height: 120,
    });

    macdChartRef.current = macdChart;

    // Add MACD histogram
    const histogramSeries = macdChart.addSeries(HistogramSeries, {
      color: COLORS.macdHistogram,
      priceFormat: {
        type: 'price',
      },
      title: 'Histogram',
    });
    macdHistogramRef.current = histogramSeries;
    histogramSeries.setData(
      indicators.macd.map(d => ({
        time: d.time as Time,
        value: d.histogram,
        color: d.histogram >= 0 ? COLORS.up : COLORS.down,
      }))
    );

    // Add MACD line
    const macdLineSeries = macdChart.addSeries(LineSeries, {
      color: COLORS.macdLine,
      lineWidth: 2,
      title: 'MACD',
    });
    macdLineRef.current = macdLineSeries;
    macdLineSeries.setData(
      indicators.macd.map(d => ({ time: d.time as Time, value: d.macd }))
    );

    // Add Signal line
    const signalLineSeries = macdChart.addSeries(LineSeries, {
      color: COLORS.macdSignal,
      lineWidth: 2,
      title: 'Signal',
    });
    macdSignalRef.current = signalLineSeries;
    signalLineSeries.setData(
      indicators.macd.map(d => ({ time: d.time as Time, value: d.signal }))
    );

    // Fit content
    macdChart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (macdChartContainerRef.current) {
        macdChart.applyOptions({ width: macdChartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      macdChart.remove();
      macdChartRef.current = null;
    };
  }, [showMACD, indicators.macd]);

  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      timeScale.fitContent();
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const handleReset = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
    if (rsiChartRef.current) {
      rsiChartRef.current.timeScale().fitContent();
    }
    if (macdChartRef.current) {
      macdChartRef.current.timeScale().fitContent();
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-destructive">
            <p className="font-medium">Failed to load chart</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {symbol} Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Time period selector */}
            <div className="flex items-center gap-1 rounded-lg border p-1">
              {PERIODS.map(period => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onPeriodChange?.(period.value)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            {/* Chart controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              {onRefresh && (
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Indicator badges */}
        {(showSMA || showEMA || showRSI || showMACD || showBollingerBands) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {showSMA && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                SMA({smaPeriod})
              </Badge>
            )}
            {showEMA && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                EMA({emaPeriod})
              </Badge>
            )}
            {showBollingerBands && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                BB({bollingerPeriod},{bollingerStdDev})
              </Badge>
            )}
            {showRSI && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                RSI({rsiPeriod})
              </Badge>
            )}
            {showMACD && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                MACD(12,26,9)
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data.length ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <>
            {/* Main price chart */}
            <div ref={chartContainerRef} className="w-full" style={{ height: showRSI || showMACD ? 280 : 400 }} />
            
            {/* RSI sub-chart */}
            {showRSI && indicators.rsi?.length && (
              <div className="mt-2">
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span>RSI({rsiPeriod})</span>
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-500">Oversold: 30</span>
                    <span className="text-red-500">Overbought: 70</span>
                  </span>
                </div>
                <div ref={rsiChartContainerRef} className="w-full" style={{ height: 100 }} />
              </div>
            )}
            
            {/* MACD sub-chart */}
            {showMACD && indicators.macd?.length && (
              <div className="mt-2">
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span>MACD(12,26,9)</span>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      MACD
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Signal
                    </span>
                  </span>
                </div>
                <div ref={macdChartContainerRef} className="w-full" style={{ height: 120 }} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StockChart;
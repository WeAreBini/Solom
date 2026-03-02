'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  Time,
  CandlestickData,
  LineData,
  AreaData,
  HistogramData,
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
  RefreshCcw,
  CandlestickChart,
  TrendingUp,
  AreaChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export interface HistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandValue {
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
  bollingerBands?: BollingerBandValue[];
  volume?: { time: string; value: number }[];
}

export type ChartType = 'candlestick' | 'line' | 'area';

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
  chartType?: ChartType;
  onRefresh?: () => void;
  onPeriodChange?: (period: string) => void;
  onChartTypeChange?: (type: ChartType) => void;
  selectedPeriod?: string;
  realtimePrice?: {
    price: number;
    timestamp: number;
  } | null;
  className?: string;
  height?: number;
}

// Color scheme
const COLORS = {
  up: '#22c55e',
  down: '#ef4444',
  line: '#3b82f6',
  area: '#3b82f6',
  areaFill: 'rgba(59, 130, 246, 0.2)',
  sma: '#3b82f6',
  ema: '#8b5cf6',
  rsi: '#f59e0b',
  rsiOverbought: '#ef4444',
  rsiOversold: '#22c55e',
  macdLine: '#3b82f6',
  macdSignal: '#ef4444',
  macdHistogram: '#22c55e',
  bollingerUpper: '#06b6d4',
  bollingerMiddle: '#6b7280',
  bollingerLower: '#06b6d4',
  bollingerFill: 'rgba(6, 182, 212, 0.1)',
  volume: '#6b7280',
  background: 'transparent',
  grid: 'rgba(75, 85, 99, 0.3)',
  text: '#9ca3af',
};

const PERIODS = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
];

const CHART_TYPES: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: 'candlestick', label: 'Candlestick', icon: <CandlestickChart className="h-4 w-4" /> },
  { value: 'line', label: 'Line', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'area', label: 'Area', icon: <AreaChart className="h-4 w-4" /> },
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
  chartType = 'candlestick',
  onRefresh,
  onPeriodChange,
  onChartTypeChange,
  selectedPeriod = '1Y',
  realtimePrice,
  className,
  height = 400,
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const macdChartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  // Main series refs - using 'any' to handle different series types
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdHistogramRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate responsive height based on container
  const chartHeight = useMemo(() => {
    const baseHeight = height;
    const subChartHeight = showRSI ? 100 : 0;
    const macdHeight = showMACD ? 120 : 0;
    return baseHeight;
  }, [height, showRSI, showMACD]);

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

  const convertToLineData = useCallback((candles: HistoricalCandle[]): LineData<Time>[] => {
    return candles.map(c => ({
      time: c.date as Time,
      value: c.close,
    }));
  }, []);

  const convertToAreaData = useCallback((candles: HistoricalCandle[]): AreaData<Time>[] => {
    return candles.map(c => ({
      time: c.date as Time,
      value: c.close,
    }));
  }, []);

  const convertToVolumeData = useCallback((candles: HistoricalCandle[]): HistogramData<Time>[] => {
    return candles.map(c => ({
      time: c.date as Time,
      value: c.volume,
      color: c.close >= c.open ? COLORS.up : COLORS.down,
    }));
  }, []);

  const convertIndicatorToLineData = useCallback((points: { time: string; value: number }[]): LineData<Time>[] => {
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
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      bollingerUpperRef.current = null;
      bollingerMiddleRef.current = null;
      bollingerLowerRef.current = null;
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
      height: chartHeight,
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // Create main series based on chart type
    let mainSeries: ISeriesApi<'Candlestick' | 'Line' | 'Area'>;

    if (chartType === 'candlestick') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderUpColor: COLORS.up,
        borderDownColor: COLORS.down,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
      });
      mainSeries.setData(convertToCandlestickData(data) as CandlestickData<Time>[]);
    } else if (chartType === 'line') {
      mainSeries = chart.addSeries(LineSeries, {
        color: COLORS.line,
        lineWidth: 2,
      });
      mainSeries.setData(convertToLineData(data) as LineData<Time>[]);
    } else {
      // area
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: COLORS.area,
        bottomColor: COLORS.areaFill,
        lineColor: COLORS.area,
        lineWidth: 2,
      });
      mainSeries.setData(convertToAreaData(data) as AreaData<Time>[]);
    }

    mainSeriesRef.current = mainSeries;

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
      volumeSeries.setData(convertToVolumeData(data) as HistogramData<Time>[]);
      
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

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, showVolume, chartType, chartHeight, convertToCandlestickData, convertToLineData, convertToAreaData, convertToVolumeData]);

  // Handle SMA indicator
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current) return;

    if (showSMA && indicators.sma?.length) {
      if (!smaSeriesRef.current) {
        const smaSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.sma,
          lineWidth: 2,
          title: `SMA(${smaPeriod})`,
        });
        smaSeriesRef.current = smaSeries;
      }
      smaSeriesRef.current?.setData(convertIndicatorToLineData(indicators.sma) as LineData<Time>[]);
    } else if (!showSMA && smaSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(smaSeriesRef.current as ISeriesApi<'Line'>);
      } catch (e) {
        // Series may have already been removed
      }
      smaSeriesRef.current = null;
    }
  }, [showSMA, indicators.sma, smaPeriod, convertIndicatorToLineData]);

  // Handle EMA indicator
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current) return;

    if (showEMA && indicators.ema?.length) {
      if (!emaSeriesRef.current) {
        const emaSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.ema,
          lineWidth: 2,
          title: `EMA(${emaPeriod})`,
        });
        emaSeriesRef.current = emaSeries;
      }
      emaSeriesRef.current?.setData(convertIndicatorToLineData(indicators.ema) as LineData<Time>[]);
    } else if (!showEMA && emaSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(emaSeriesRef.current as ISeriesApi<'Line'>);
      } catch (e) {
        // Series may have already been removed
      }
      emaSeriesRef.current = null;
    }
  }, [showEMA, indicators.ema, emaPeriod, convertIndicatorToLineData]);

  // Handle Bollinger Bands indicator
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current) return;

    if (showBollingerBands && indicators.bollingerBands?.length) {
      // Add upper band
      if (!bollingerUpperRef.current) {
        const upperSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.bollingerUpper,
          lineWidth: 1,
          title: 'BB Upper',
          lineStyle: 2, // Dashed
        });
        bollingerUpperRef.current = upperSeries;
      }
      bollingerUpperRef.current?.setData(
        indicators.bollingerBands.map(b => ({ time: b.time as Time, value: b.upper })) as LineData<Time>[]
      );

      // Add middle band (SMA)
      if (!bollingerMiddleRef.current) {
        const middleSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.bollingerMiddle,
          lineWidth: 1,
          title: `BB(${bollingerPeriod})`,
          lineStyle: 1,
        });
        bollingerMiddleRef.current = middleSeries;
      }
      bollingerMiddleRef.current?.setData(
        indicators.bollingerBands.map(b => ({ time: b.time as Time, value: b.middle })) as LineData<Time>[]
      );

      // Add lower band
      if (!bollingerLowerRef.current) {
        const lowerSeries = chartRef.current.addSeries(LineSeries, {
          color: COLORS.bollingerLower,
          lineWidth: 1,
          title: 'BB Lower',
          lineStyle: 2, // Dashed
        });
        bollingerLowerRef.current = lowerSeries;
      }
      bollingerLowerRef.current?.setData(
        indicators.bollingerBands.map(b => ({ time: b.time as Time, value: b.lower })) as LineData<Time>[]
      );
    } else if (!showBollingerBands && chartRef.current) {
      if (bollingerUpperRef.current) {
        try {
          chartRef.current.removeSeries(bollingerUpperRef.current as ISeriesApi<'Line'>);
        } catch (e) {}
        bollingerUpperRef.current = null;
      }
      if (bollingerMiddleRef.current) {
        try {
          chartRef.current.removeSeries(bollingerMiddleRef.current as ISeriesApi<'Line'>);
        } catch (e) {}
        bollingerMiddleRef.current = null;
      }
      if (bollingerLowerRef.current) {
        try {
          chartRef.current.removeSeries(bollingerLowerRef.current as ISeriesApi<'Line'>);
        } catch (e) {}
        bollingerLowerRef.current = null;
      }
    }
  }, [showBollingerBands, indicators.bollingerBands, bollingerPeriod]);

  // Initialize RSI sub-chart
  useEffect(() => {
    if (!rsiChartContainerRef.current || !showRSI || !indicators.rsi?.length) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
        rsiSeriesRef.current = null;
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
    rsiSeries.setData(convertIndicatorToLineData(indicators.rsi) as LineData<Time>[]);

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
  }, [showRSI, indicators.rsi, rsiPeriod, convertIndicatorToLineData]);

  // Initialize MACD sub-chart
  useEffect(() => {
    if (!macdChartContainerRef.current || !showMACD || !indicators.macd?.length) {
      if (macdChartRef.current) {
        macdChartRef.current.remove();
        macdChartRef.current = null;
        macdLineRef.current = null;
        macdSignalRef.current = null;
        macdHistogramRef.current = null;
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
      })) as HistogramData<Time>[]
    );

    // Add MACD line
    const macdLineSeries = macdChart.addSeries(LineSeries, {
      color: COLORS.macdLine,
      lineWidth: 2,
      title: 'MACD',
    });
    macdLineRef.current = macdLineSeries;
    macdLineSeries.setData(
      indicators.macd.map(d => ({ time: d.time as Time, value: d.macd })) as LineData<Time>[]
    );

    // Add Signal line
    const signalLineSeries = macdChart.addSeries(LineSeries, {
      color: COLORS.macdSignal,
      lineWidth: 2,
      title: 'Signal',
    });
    macdSignalRef.current = signalLineSeries;
    signalLineSeries.setData(
      indicators.macd.map(d => ({ time: d.time as Time, value: d.signal })) as LineData<Time>[]
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

  // Handle real-time price updates
  useEffect(() => {
    if (!mainSeriesRef.current || !realtimePrice || !data.length) return;

    const lastCandle = data[data.length - 1];
    const currentTime = lastCandle.date;

    // Create update data based on chart type
    if (chartType === 'candlestick') {
      // For candlestick, we update the last candle with the new close price
      const updatedCandle: CandlestickData<Time> = {
        time: currentTime as Time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, realtimePrice.price),
        low: Math.min(lastCandle.low, realtimePrice.price),
        close: realtimePrice.price,
      };
      (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update(updatedCandle as CandlestickData<Time>);
    } else {
      // For line and area charts, just update the close price
      const update: LineData<Time> | AreaData<Time> = {
        time: currentTime as Time,
        value: realtimePrice.price,
      };
      (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).update(update as LineData<Time>);
    }
  }, [realtimePrice, data, chartType]);

  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      if (visibleRange) {
        const { from, to } = visibleRange as { from: string; to: string };
        const fromTime = new Date(from).getTime();
        const toTime = new Date(to).getTime();
        const midTime = (fromTime + toTime) / 2;
        const range = (toTime - fromTime) / 3;
        timeScale.setVisibleRange({
          from: new Date(midTime - range).toISOString().split('T')[0] as Time,
          to: new Date(midTime + range).toISOString().split('T')[0] as Time,
        });
      }
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const handleToggleFullscreen = () => {
    if (!chartContainerRef.current?.parentElement) return;

    if (!document.fullscreenElement) {
      chartContainerRef.current.parentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
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
      <Card className={className}>
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
    <Card className={cn('overflow-hidden', className, isFullscreen && 'bg-background')}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {symbol} Price Chart
            {realtimePrice && (
              <Badge variant="success" className="ml-2 animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart type selector */}
            <div className="flex items-center gap-1 rounded-lg border p-1">
              {CHART_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={chartType === type.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onChartTypeChange?.(type.value)}
                  title={type.label}
                >
                  {type.icon}
                  <span className="ml-1 hidden sm:inline">{type.label}</span>
                </Button>
              ))}
            </div>
            
            {/* Time period selector */}
            <div className="flex items-center gap-1 rounded-lg border p-1">
              {PERIODS.map((period) => (
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
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleToggleFullscreen} title="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </Button>
              {onRefresh && (
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh} title="Refresh">
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                SMA({smaPeriod})
              </Badge>
            )}
            {showEMA && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                EMA({emaPeriod})
              </Badge>
            )}
            {showBollingerBands && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                BB({bollingerPeriod},{bollingerStdDev})
              </Badge>
            )}
            {showRSI && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                RSI({rsiPeriod})
              </Badge>
            )}
            {showMACD && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                MACD(12,26,9)
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height: chartHeight }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data.length ? (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height: chartHeight }}>
            No chart data available
          </div>
        ) : (
          <>
            {/* Main price chart */}
            <div
              ref={chartContainerRef}
              className="w-full touch-pan-x touch-pinch-zoom"
              style={{ height: chartHeight }}
            />

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
                <div
                  ref={rsiChartContainerRef}
                  className="w-full touch-pan-x touch-pinch-zoom"
                  style={{ height: 100 }}
                />
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
                <div
                  ref={macdChartContainerRef}
                  className="w-full touch-pan-x touch-pinch-zoom"
                  style={{ height: 120 }}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StockChart;
"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  AreaData,
  HistogramData,
  Time,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  UTCTimestamp,
  createTextWatermark,
} from 'lightweight-charts';
import { cn } from '@/lib/utils';
import { chartColors } from '@/lib/design-tokens';

// ============================================
// Type Definitions
// ============================================

export type ChartType = 'line' | 'candlestick' | 'area';

export interface OHLCVDataPoint {
  time: number | string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceDataPoint {
  time: number | string | Date;
  value: number;
}

export interface VolumeDataPoint {
  time: number | string | Date;
  value: number;
  color?: string;
}

export interface ChartColors {
  up: string;
  down: string;
  line: string;
  area: string;
  volume: string;
  background: string;
  grid: string;
  text: string;
}

interface ChartContainerProps {
  /** Stock symbol */
  symbol: string;
  /** Chart type to display */
  chartType?: ChartType;
  /** Historical data */
  data?: OHLCVDataPoint[] | PriceDataPoint[];
  /** Chart height */
  height?: number;
  /** Show volume panel */
  showVolume?: boolean;
  /** Enable real-time updates */
  realtimeUpdates?: boolean;
  /** Polling interval for updates (ms) */
  pollInterval?: number;
  /** WebSocket URL for real-time data */
  websocketUrl?: string;
  /** Show timeframe selector */
  showTimeframeSelector?: boolean;
  /** Show chart type selector */
  showChartTypeSelector?: boolean;
  /** Custom colors */
  colors?: Partial<ChartColors>;
  /** Watermark text */
  watermark?: string;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Price update callback */
  onPriceUpdate?: (price: number) => void;
  /** Custom class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================
// Constants
// ============================================

const DEFAULT_HEIGHT = 400;
const DEFAULT_POLL_INTERVAL = 5000;
const CHART_TYPES: ChartType[] = ['line', 'candlestick', 'area'];

const COLORS: ChartColors = {
  up: '#10b981',      // emerald-500
  down: '#ef4444',    // red-500
  line: '#2563eb',    // blue-600
  area: '#2563eb',    // blue-600
  volume: '#64748b',  // slate-500
  background: 'transparent',
  grid: 'rgba(148, 163, 184, 0.1)',
  text: '#94a3b8',    // slate-400
};

// ============================================
// Helper Functions
// ============================================

/**
 * Convert timestamp to lightweight-charts Time format (UTCTimestamp)
 */
function toTime(timestamp: number | string | Date): UTCTimestamp {
  if (typeof timestamp === 'number') {
    return timestamp as UTCTimestamp;
  }
  if (typeof timestamp === 'string') {
    return Math.floor(new Date(timestamp).getTime() / 1000) as UTCTimestamp;
  }
  return Math.floor(timestamp.getTime() / 1000) as UTCTimestamp;
}

/**
 * Convert OHLCV data to candlestick format
 */
function toCandlestickData(data: OHLCVDataPoint[]): CandlestickData<Time>[] {
  return data.map((d) => ({
    time: toTime(d.time),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));
}

/**
 * Convert price data to line format
 */
function toLineData(data: PriceDataPoint[] | OHLCVDataPoint[]): LineData<Time>[] {
  return data.map((d) => {
    const time = 'value' in d ? (d as PriceDataPoint).time : (d as OHLCVDataPoint).time;
    return {
      time: toTime(time),
      value: 'value' in d ? d.value : (d as OHLCVDataPoint).close,
    };
  });
}

/**
 * Convert data to area format
 */
function toAreaData(data: PriceDataPoint[] | OHLCVDataPoint[]): AreaData<Time>[] {
  return data.map((d) => {
    const time = 'value' in d ? (d as PriceDataPoint).time : (d as OHLCVDataPoint).time;
    return {
      time: toTime(time),
      value: 'value' in d ? d.value : (d as OHLCVDataPoint).close,
    };
  });
}

/**
 * Convert volume data to histogram format
 */
function toVolumeData(data: OHLCVDataPoint[]): HistogramData<Time>[] {
  return data
    .filter((d) => d.volume !== undefined)
    .map((d) => ({
      time: toTime(d.time),
      value: d.volume!,
      color: d.close >= d.open ? COLORS.up + '40' : COLORS.down + '40',
    }));
}

// ============================================
// StockChart Component
// ============================================

export interface StockChartRef {
  /** Get the chart instance */
  getChart: () => IChartApi | null;
  /** Update price data in real-time */
  updatePrice: (price: number, volume?: number) => void;
  /** Update candlestick data in real-time */
  updateCandle: (data: OHLCVDataPoint) => void;
  /** Clear all data */
  clearData: () => void;
  /** Take screenshot */
  takeScreenshot: () => string | null;
  /** Resize chart */
  resize: (width: number, height: number) => void;
  /** Fit content */
  fitContent: () => void;
  /** Set visible range */
  setVisibleRange: (from: number, to: number) => void;
}

// Type for any series
type AnySeries = ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Histogram'>;

/**
 * StockChart Component
 * 
 * A high-performance financial chart component using TradingView Lightweight Charts.
 * Supports line, candlestick, and area chart types with real-time updates.
 * 
 * @example
 * ```tsx
 * <StockChart
 *   symbol="AAPL"
 *   chartType="candlestick"
 *   data={historicalData}
 *   showVolume={true}
 *   realtimeUpdates={true}
 *   onPriceUpdate={(price) => console.log(price)}
 * />
 * ```
 */
export const StockChart = forwardRef<StockChartRef, ChartContainerProps>(
  function StockChart(
    {
      symbol,
      chartType = 'candlestick',
      data = [],
      height = DEFAULT_HEIGHT,
      showVolume = true,
      realtimeUpdates = false,
      pollInterval = DEFAULT_POLL_INTERVAL,
      websocketUrl,
      showTimeframeSelector = false,
      showChartTypeSelector = false,
      colors = {},
      watermark,
      onError,
      onPriceUpdate,
      className,
      isLoading = false,
    },
    ref
  ) {
    // Refs
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<AnySeries | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // State
    const [isReady, setIsReady] = useState(false);
    const [currentChartType, setCurrentChartType] = useState<ChartType>(chartType);
    const [error, setError] = useState<string | null>(null);

    // Merge colors with defaults
    const mergedColors = useMemo(
      () => ({ ...COLORS, ...colors }),
      [colors]
    );

    // ============================================
    // Initialize Chart
    // ============================================

    const initializeChart = useCallback(() => {
      if (!chartContainerRef.current) return null;

      try {
        // Clean up existing chart
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          mainSeriesRef.current = null;
          volumeSeriesRef.current = null;
        }

        // Create new chart
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: mergedColors.background },
            textColor: mergedColors.text,
            fontSize: 12,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          grid: {
            vertLines: { color: mergedColors.grid, style: 1 },
            horzLines: { color: mergedColors.grid, style: 1 },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: mergedColors.text + '80',
              width: 1,
              style: 3,
              labelBackgroundColor: mergedColors.line,
            },
            horzLine: {
              color: mergedColors.text + '80',
              width: 1,
              style: 3,
              labelBackgroundColor: mergedColors.line,
            },
          },
          rightPriceScale: {
            borderColor: mergedColors.grid,
            scaleMargins: {
              top: 0.1,
              bottom: showVolume ? 0.25 : 0.1,
            },
          },
          timeScale: {
            borderColor: mergedColors.grid,
            timeVisible: true,
            secondsVisible: false,
          },
          handleScroll: { vertTouchDrag: true, horzTouchDrag: true },
          handleScale: { axisPressedMouseMove: true },
        });

        // Size the chart
        const containerWidth = chartContainerRef.current.clientWidth;
        chart.resize(containerWidth, height);

        // Add watermark if provided (using text watermark on panes)
        if (watermark) {
          const panes = chart.panes();
          if (panes.length > 0) {
            try {
              createTextWatermark(panes[0], {
                lines: [{
                  text: watermark,
                  color: mergedColors.text + '20',
                  fontSize: 48,
                }],
                horzAlign: 'center',
                vertAlign: 'center',
              });
            } catch {
              // Watermark is optional, continue if it fails
              console.warn('Failed to create watermark');
            }
          }
        }

        return chart;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize chart');
        console.error('Chart initialization error:', error);
        setError(error.message);
        onError?.(error);
        return null;
      }
    }, [height, showVolume, mergedColors, watermark, onError]);

    // ============================================
    // Create Series
    // ============================================

    const createMainSeries = useCallback(
      (chart: IChartApi, type: ChartType) => {
        switch (type) {
          case 'candlestick':
            return chart.addSeries(CandlestickSeries, {
              upColor: mergedColors.up,
              downColor: mergedColors.down,
              borderUpColor: mergedColors.up,
              borderDownColor: mergedColors.down,
              wickUpColor: mergedColors.up,
              wickDownColor: mergedColors.down,
            });
          case 'area':
            return chart.addSeries(AreaSeries, {
              lineColor: mergedColors.area,
              topColor: mergedColors.area + '40',
              bottomColor: mergedColors.area + '00',
              lineWidth: 2,
            });
          case 'line':
          default:
            return chart.addSeries(LineSeries, {
              color: mergedColors.line,
              lineWidth: 2,
            });
        }
      },
      [mergedColors]
    );

    const createVolumeSeries = useCallback((chart: IChartApi) => {
      if (!showVolume) return null;

      return chart.addSeries(HistogramSeries, {
        color: mergedColors.volume + '80',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
    }, [showVolume, mergedColors.volume]);

    // ============================================
    // Update Data
    // ============================================

    const updateData = useCallback(
      (newData: OHLCVDataPoint[] | PriceDataPoint[]) => {
        if (!chartRef.current || !mainSeriesRef.current) return;

        try {
          // Clear existing data
          mainSeriesRef.current.setData([]);

          // Convert and set data based on chart type
          if (currentChartType === 'candlestick') {
            const ohlcvData = newData as OHLCVDataPoint[];
            if (ohlcvData.length > 0 && 'open' in ohlcvData[0]) {
              (mainSeriesRef.current as ISeriesApi<'Candlestick'>).setData(
                toCandlestickData(ohlcvData)
              );

              // Update volume
              if (volumeSeriesRef.current) {
                volumeSeriesRef.current.setData(toVolumeData(ohlcvData));
              }
            }
          } else {
            const lineOrAreaData = Array.isArray(newData) ? newData : [];
            const convertedData = currentChartType === 'area'
              ? toAreaData(lineOrAreaData)
              : toLineData(lineOrAreaData);
            (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).setData(convertedData);
          }

          chartRef.current.timeScale().fitContent();
        } catch (err) {
          console.error('Error updating chart data:', err);
          const error = err instanceof Error ? err : new Error('Failed to update data');
          onError?.(error);
        }
      },
      [currentChartType, onError]
    );

    // ============================================
    // Real-time Updates
    // ============================================

    const startPolling = useCallback(() => {
      if (!realtimeUpdates) return;

      pollIntervalRef.current = setInterval(async () => {
        try {
          // Fetch latest price from API
          const response = await fetch(`/api/stocks/${symbol}/quote`);
          if (!response.ok) throw new Error('Failed to fetch price');
          const quote = await response.json();

          // Update chart
          if (mainSeriesRef.current) {
            const time = Math.floor(Date.now() / 1000) as UTCTimestamp;
            const price = quote.price;

            if (currentChartType === 'candlestick') {
              // Update current candle
              (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update({
                time,
                open: price,
                high: price,
                low: price,
                close: price,
              });
            } else {
              // Update line/area
              (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).update({
                time,
                value: price,
              });
            }

            onPriceUpdate?.(price);
          }
        } catch (err) {
          console.warn('Polling error:', err);
        }
      }, pollInterval);
    }, [realtimeUpdates, symbol, currentChartType, pollInterval, onPriceUpdate]);

    const connectWebSocket = useCallback(() => {
      if (!websocketUrl) return;

      try {
        wsRef.current = new WebSocket(websocketUrl);

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'price' && message.data) {
              const { time, price, volume } = message.data;

              if (mainSeriesRef.current) {
                if (currentChartType === 'candlestick') {
                  (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update({
                    time,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                  });

                  if (volumeSeriesRef.current && volume) {
                    volumeSeriesRef.current.update({
                      time,
                      value: volume,
                    });
                  }
                } else {
                  (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).update({
                    time,
                    value: price,
                  });
                }

                onPriceUpdate?.(price);
              }
            }
          } catch (err) {
            console.warn('WebSocket message parse error:', err);
          }
        };

        wsRef.current.onerror = () => {
          console.error('WebSocket error');
          onError?.(new Error('WebSocket connection error'));
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        const error = err instanceof Error ? err : new Error('Failed to connect WebSocket');
        onError?.(error);
      }
    }, [websocketUrl, currentChartType, onPriceUpdate, onError]);

    // ============================================
    // Expose Methods via Ref
    // ============================================

    useImperativeHandle(
      ref,
      () => ({
        getChart: () => chartRef.current,
        updatePrice: (price: number, volume?: number) => {
          if (!mainSeriesRef.current) return;

          const time = Math.floor(Date.now() / 1000) as UTCTimestamp;

          if (currentChartType === 'candlestick') {
            (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update({
              time,
              close: price,
            });
          } else {
            (mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).update({
              time,
              value: price,
            });
          }

          if (volumeSeriesRef.current && volume) {
            volumeSeriesRef.current.update({ time, value: volume });
          }

          onPriceUpdate?.(price);
        },
        updateCandle: (data: OHLCVDataPoint) => {
          if (!mainSeriesRef.current) return;

          const candleData: CandlestickData<Time> = {
            time: toTime(data.time),
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
          };

          (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update(candleData);

          if (volumeSeriesRef.current && data.volume) {
            volumeSeriesRef.current.update({
              time: toTime(data.time),
              value: data.volume,
              color: data.close >= data.open ? COLORS.up + '40' : COLORS.down + '40',
            });
          }
        },
        clearData: () => {
          if (mainSeriesRef.current) {
            mainSeriesRef.current.setData([]);
          }
          if (volumeSeriesRef.current) {
            volumeSeriesRef.current.setData([]);
          }
        },
        takeScreenshot: () => {
          if (!chartRef.current) return null;
          return chartRef.current.takeScreenshot().toDataURL('image/png');
        },
        resize: (width: number, newHeight: number) => {
          chartRef.current?.resize(width, newHeight);
        },
        fitContent: () => {
          chartRef.current?.timeScale().fitContent();
        },
        setVisibleRange: (from: number, to: number) => {
          chartRef.current?.timeScale().setVisibleRange({
            from: from as UTCTimestamp,
            to: to as UTCTimestamp,
          });
        },
      }),
      [currentChartType, onPriceUpdate]
    );

    // ============================================
    // Initialize on Mount
    // ============================================

    useEffect(() => {
      const chart = initializeChart();
      if (!chart) return;

      chartRef.current = chart;
      mainSeriesRef.current = createMainSeries(chart, currentChartType);
      volumeSeriesRef.current = showVolume ? createVolumeSeries(chart) : null;

      // Set initial data
      if (data.length > 0) {
        updateData(data as OHLCVDataPoint[]);
      }

      // Handle resize
      const handleResize = () => {
        if (!chartContainerRef.current || !chartRef.current) return;
        const width = chartContainerRef.current.clientWidth;
        chartRef.current.resize(width, height);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }

      setIsReady(true);

      return () => {
        resizeObserver.disconnect();
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          mainSeriesRef.current = null;
          volumeSeriesRef.current = null;
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }, [initializeChart, createMainSeries, createVolumeSeries, updateData, data, showVolume, height]);

    // ============================================
    // Handle Chart Type Change
    // ============================================

    useEffect(() => {
      if (!isReady || !chartRef.current) return;

      // Remove old series
      if (mainSeriesRef.current) {
        chartRef.current.removeSeries(mainSeriesRef.current);
      }
      if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
      }

      // Create new series
      mainSeriesRef.current = createMainSeries(chartRef.current, currentChartType);
      volumeSeriesRef.current = showVolume ? createVolumeSeries(chartRef.current) : null;

      // Reload data
      if (data.length > 0) {
        updateData(data as OHLCVDataPoint[]);
      }
    }, [currentChartType, isReady, showVolume, createMainSeries, createVolumeSeries, updateData, data]);

    // ============================================
    // Start Real-time Updates
    // ============================================

    useEffect(() => {
      if (!isReady || !realtimeUpdates) return;

      if (websocketUrl) {
        connectWebSocket();
      } else {
        startPolling();
      }

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }, [isReady, realtimeUpdates, websocketUrl, startPolling, connectWebSocket]);

    // ============================================
    // Render
    // ============================================

    return (
      <div className={cn('relative w-full', className)}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading chart...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="text-center text-sm text-destructive">
              <p>Failed to load chart</p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Chart Controls */}
        {(showChartTypeSelector || showTimeframeSelector) && (
          <div className="absolute right-0 top-0 z-20 flex gap-2 p-2">
            {showChartTypeSelector && (
              <div className="flex rounded-lg border bg-background/80 backdrop-blur">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setCurrentChartType(type)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium uppercase transition-colors',
                      type === currentChartType
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {type === 'candlestick' ? 'OHLC' : type}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chart Container */}
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ height: `${height}px` }}
          role="img"
          aria-label={`Stock chart for ${symbol}`}
        />
      </div>
    );
  }
);

// ============================================
// Export Types
// ============================================

export type { ChartContainerProps };